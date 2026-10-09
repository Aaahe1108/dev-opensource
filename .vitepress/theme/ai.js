// ============================================================
// AI 模块：统一管理站点的 AI 能力
//
// 提供 5 项 AI 能力：
//   1. AI 终端助手（ask 命令）
//   2. AI 语义搜索（grep 自然语言模式）
//   3. AI 内容生成（sudo make install <topic>）
//   4. AI 页面摘要（预生成于 frontmatter，见各 Markdown）
//   5. AI 学习路径推荐（LearningPath.vue，本地浏览记录）
//
// 设计原则：
//   - 无 API Key 时自动降级为本地逻辑，网站完整可用
//   - Key 仅存于浏览器 localStorage，不上传、不硬编码
//   - 所有 AI 调用均可通过 config 命令或「AI 设置」面板关闭
// ============================================================

const LS = {
  enabled: 'devop_ai_enabled',
  key: 'devop_ai_key',
  base: 'devop_ai_base',
  model: 'devop_ai_model'
}
const HIST_KEY = 'devop_history'

function storage() {
  // SSR 安全：仅在浏览器中访问 localStorage
  return typeof window !== 'undefined' ? window.localStorage : null
}

/* ---------------- 配置管理 ---------------- */

/** 读取 AI 配置（Base URL / Model / Key / 开关） */
export function getAIConfig() {
  const s = storage()
  return {
    enabled: s ? s.getItem(LS.enabled) !== 'off' : false,
    key: s ? s.getItem(LS.key) || '' : '',
    base: s ? s.getItem(LS.base) || 'https://api.deepseek.com/v1' : 'https://api.deepseek.com/v1',
    model: s ? s.getItem(LS.model) || 'deepseek-chat' : 'deepseek-chat'
  }
}

/** 更新 AI 配置（局部覆盖） */
export function setAIConfig(patch) {
  const s = storage()
  if (!s) return
  for (const k of Object.keys(LS)) {
    if (patch[k] !== undefined) s.setItem(LS[k], String(patch[k]))
  }
}

/** 清除全部 AI 配置（含 Key） */
export function clearAIConfig() {
  const s = storage()
  if (!s) return
  Object.values(LS).forEach((k) => s.removeItem(k))
}

/** AI 是否可用：开关打开且已配置 Key */
export function isAIEnabled() {
  const c = getAIConfig()
  return c.enabled && !!c.key.trim()
}

/* ---------------- 本地知识库（降级用） ---------------- */

// 精选问答对：无 API Key 时按关键词匹配返回
const KB = [
  {
    keywords: ['gpl', 'mit', '区别', '许可证', 'license', 'copyleft', '传染', '对比'],
    answer:
      'GPL 与 MIT 的核心区别是「传染性」（copyleft）：\n' +
      '• GPL：衍生作品必须以相同的 GPL 许可证发布，保证自由传递。代表：Linux 内核（GPLv2）。\n' +
      '• MIT：允许任何用途（包括闭源商用），只需保留版权声明。代表：jQuery、Node.js 生态。\n' +
      '一句话：想保护衍生作品同样开放，选 GPL；想最大化采用，选 MIT。\n' +
      '详见 /etc/licenses/GPL 与 /etc/licenses/MIT。'
  },
  {
    keywords: ['apache', '专利', 'apache-2.0', '2.0'],
    answer:
      'Apache-2.0 与 MIT 同属宽松许可证，但额外包含两项重要条款：\n' +
      '• 明确的专利授权：贡献者自动授予专利许可，降低诉讼风险；\n' +
      '• 修改声明：分发修改版时需标注更改。\n' +
      '企业级项目（Kubernetes、Apache HTTP Server）首选。详见 /etc/licenses/Apache-2.0。'
  },
  {
    keywords: ['bsd', '伯克利', 'berkeley'],
    answer:
      'BSD 许可证源自加州大学伯克利分校的 BSD Unix，限制极少：\n' +
      '• 允许闭源商用；\n' +
      '• 2-Clause（FreeBSD）极简，3-Clause 额外禁止用贡献者名字背书；\n' +
      '• 与 GPL 兼容。代表：FreeBSD、nginx。详见 /etc/licenses/BSD。'
  },
  {
    keywords: ['torvalds', 'linus', '内核之父', 'linux 之父', '谁写'],
    answer:
      'Linus Torvalds（1969 年生，芬兰）：\n' +
      '• 1991 年发布 Linux 0.01，并亲自维护内核主线至今；\n' +
      '• 2005 年因 BitKeeper 事件编写了 Git；\n' +
      '• 名言：Talk is cheap. Show me the code.\n' +
      '详见 /home/torvalds。'
  },
  {
    keywords: ['stallman', 'stallman', '自由软件', 'gnu', '四大自由', 'fsf'],
    answer:
      'Richard Stallman（1953 年生）：\n' +
      '• 1983 年发起 GNU 计划，1985 年创立自由软件基金会（FSF）；\n' +
      '• 起草 GPL 许可证，提出软件四大自由（运行、研究、分发、发布修改版）；\n' +
      '• 名言：自由软件关乎自由，而非价格。\n' +
      '详见 /home/stallman。'
  },
  {
    keywords: ['raymond', '大教堂', '集市', 'linus 定律', '开源定义'],
    answer:
      'Eric S. Raymond（1957 年生）：\n' +
      '• 1997 年发表《大教堂与集市》，提出 Linus 定律：「足够多的眼睛，就可让所有问题浮现」；\n' +
      '• 1998 年推动「开源」一词确立，参与起草开源定义（OSD）；\n' +
      '• 著有《Unix 编程艺术》。详见 /home/raymond。'
  },
  {
    keywords: ['内核', 'kernel', '时间线', '历史', '版本'],
    answer:
      'Linux 内核时间线：\n' +
      '• 1991-08-25：Linus 在 comp.os.minix 发布著名帖子；\n' +
      '• 1991-09-17：Linux 0.01 发布；1992 年采用 GPLv2；\n' +
      '• 1994：Linux 1.0；2003：2.6 内核 OEM 大规模采用；\n' +
      '• 至今：主线由全球数千名开发者维护，是最大的协作软件项目。\n' +
      '详见 /var/log/kernel。'
  },
  {
    keywords: ['发行版', 'distro', 'ubuntu', 'debian', 'arch', '红帽', 'redhat'],
    answer:
      '发行版 = 内核 + 软件生态 + 理念的封装：\n' +
      '• 1993：Debian、Slackware 诞生；1994：Red Hat；\n' +
      '• 2004：Ubuntu 推动 Linux 桌面普及；2008：Arch 坚持滚动更新与 KISS；\n' +
      '• 2021：CentOS 转向 Stream，Rocky Linux 与 AlmaLinux 应运而生。\n' +
      '可用 <DistroFilter /> 组件按家族筛选，详见 /var/log/distro 与 /usr/share/distros。'
  },
  {
    keywords: ['centos', 'stream', '可持续', ' rocky', 'alma'],
    answer:
      'CentOS 事件（2020-12）：\n' +
      '• CentOS 宣布从 RHEL 克隆转向 CentOS Stream，社区措手不及；\n' +
      '• 教训：公司主导的开源项目，许可证 ≠ 治理结构；\n' +
      '• 衍生：Rocky Linux 与 AlmaLinux 迅速成为社区替代品。\n' +
      '详见 /lost+found/centos。'
  },
  {
    keywords: ['heartbleed', 'openssl', '漏洞', 'cve', '基础设施'],
    answer:
      'Heartbleed（CVE-2014-0160，2014-04）：\n' +
      '• OpenSSL 心跳扩展越界读取，全球约三分之二网站受影响；\n' +
      '• 讽刺的是：当时 OpenSSL 仅有少数全职维护者；\n' +
      '• 直接推动 Linux 基金会成立 Core Infrastructure Initiative（CII）。\n' +
      '详见 /lost+found/heartbleed。'
  },
  {
    keywords: ['分叉', 'fork', 'mariadb', 'libreoffice'],
    answer:
      '著名分叉事件：\n' +
      '• 1993：GCC/EGCS 分叉后和解合并；\n' +
      '• 2008：MySQL 分叉出 MariaDB；2010：LibreOffice 从 OpenOffice 分叉；\n' +
      '• 分叉是开源的自由与健康的纠错机制，许可证保障了分叉权。\n' +
      '详见 /var/log/fork。'
  },
  {
    keywords: ['贡献', '教程', '新手', '入门', 'pr', 'issue', '如何参与'],
    answer:
      '开源贡献五步法：\n' +
      '1. 选一个你正在用的项目；2. 读 CONTRIBUTING.md；\n' +
      '3. 从 good first issue 开始（文档、测试都是好切入点）；\n' +
      '4. 提 PR 并回应评审；5. 持续参与。\n' +
      '详见 /usr/share/tutorials。'
  },
  {
    keywords: ['开源', '定义', '精神', '什么是开源', '开放源代码'],
    answer:
      '开源精神的核心：\n' +
      '• 开放：源代码可读、可改、可分发；\n' +
      '• 协作：集市模式 + Linus 定律；\n' +
      '• 自由：GPL 保障四大自由，宽松许可证保障采用自由；\n' +
      '• 社区：尽早发布、频繁发布，照顾维护者。\n' +
      '详见 /home/community 与 /usr/share/philosophy。'
  },
  {
    keywords: ['部署', 'nginx', 'https', 'certbot', 'systemd', '服务器'],
    answer:
      '本站部署方案（全部公开）：\n' +
      '• Nginx：root 指向 /var/www/dev-opensource，try_files 支持 cleanUrls；\n' +
      '• HTTPS：certbot + Let\'s Encrypt，自动续期；\n' +
      '• 服务管理：systemd；CI/CD：GitHub Actions 自动构建并 scp。\n' +
      '详见 /opt/deploy 下的四个配置文件。'
  },
  {
    keywords: ['放弃', '遗弃', 'abandon', '倦怠', 'burnout', '巴士'],
    answer:
      '被遗弃的项目给我们的启示：\n' +
      '• 维护者倦怠（burnout）是项目停更的首要原因；\n' +
      '• 巴士因子（bus factor）衡量项目对少数人的依赖；\n' +
      '• 健康项目需要文档、新人引导、可持续资金与维护者轮换。\n' +
      '详见 /lost+found/abandoned-projects。'
  },
  {
    keywords: ['help', '帮助', '命令', '怎么用', '如何使用'],
    answer:
      '终端命令一览：\n' +
      '• ls [-l] [路径]：列出目录；cd [路径]：切换目录；pwd：当前路径；\n' +
      '• cat <文件>：查看文件；grep "模式" <路径...>：搜索（支持 * 与自然语言）；\n' +
      '• tree [路径]：树状图；ask <问题>：AI 问答；gui：图形导航；\n' +
      '• sudo make install <主题>：AI 生成页面草稿；config：配置 AI。\n' +
      '支持 Tab 补全与 ↑/↓ 历史命令。'
  }
]

/**
 * 本地问答（降级模式）：按关键词匹配知识库
 * 返回最佳答案字符串
 */
export function localAsk(question) {
  const q = String(question).toLowerCase()
  let best = null
  let bestScore = 0
  for (const entry of KB) {
    let score = 0
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) score += kw.length >= 4 ? 2 : 1
    }
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }
  if (best) return best.answer
  return (
    '本地知识库暂无匹配内容。你可以：\n' +
    '• 用英文关键词再试一次（如 gpl、kernel、license）；\n' +
    '• 用 ls / 与 tree / 浏览文件系统；\n' +
    '• 在「AI 设置」中配置 API Key 后，ask 将调用 AI 模型回答。'
  )
}

/* ---------------- AI API 调用（OpenAI 兼容） ---------------- */

async function chatCompletion(messages, signal) {
  const cfg = getAIConfig()
  const res = await fetch(cfg.base.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.key.trim()}`
    },
    body: JSON.stringify({ model: cfg.model, messages }),
    signal
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${detail.slice(0, 120)}`)
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('AI 未返回内容')
  return text
}

/** AI 终端助手：调用对话模型问答 */
export function aiAsk(question, signal) {
  return chatCompletion(
    [
      {
        role: 'system',
        content:
          '你是 dev-opensource 网站的 AI 助手，主题是 Linux 文化与开源精神。' +
          '用中文简洁回答（300 字以内），善用换行与列表。' +
          '可引用站内路径（如 /etc/licenses/GPL）引导用户深入阅读。'
      },
      { role: 'user', content: question }
    ],
    signal
  )
}

/**
 * 本地草稿模板（sudo make install 的降级实现）
 * 仅输出到终端，不写入站点（安全设计）
 */
export function generateDraft(topic) {
  return (
    `---\ntitle: ${topic}\nai_summary: AI 草稿：关于「${topic}」的页面待完善摘要。\n---\n\n` +
    `# ${topic}\n\n` +
    `> 本草稿由终端命令 \`sudo make install ${topic}\` 生成（本地模板模式）。\n\n` +
    `## 概述\n\n` +
    `请在此补充「${topic}」的概述：AI 将用一段话说明它是什么、为什么重要。\n\n` +
    `## 时间线 / 核心要点\n\n` +
    `- 要点一：……\n- 要点二：……\n- 要点三：……\n\n` +
    `## 参考来源\n\n` +
    `- 引用来源 1\n- 引用来源 2\n\n` +
    `<!-- 提示：把本页保存为 Markdown 文件即可成为站点的新页面。 -->`
  )
}

/** AI 内容生成：生成 Markdown 页面草稿 */
export function aiGenerateDraft(topic, signal) {
  return chatCompletion(
    [
      {
        role: 'system',
        content:
          '你是技术文档作者。为给定主题生成一篇 Markdown 页面草稿，要求：\n' +
          '1. 以 --- 开头的 frontmatter，包含 title 与 ai_summary（一句话总结）；\n' +
          '2. 正文包含：概述、时间线或核心要点列表、参考来源；\n' +
          '3. 全部使用中文，内容准确，不编造具体数字；\n' +
          '4. 只输出 Markdown，不要输出其他内容。'
      },
      { role: 'user', content: `主题：${topic}` }
    ],
    signal
  )
}

/**
 * AI 语义重排：对本地检索结果按相关度排序
 * 返回重排后的候选数组（解析失败时由调用方回退本地顺序）
 */
export async function aiRerank(query, candidates, signal) {
  const list = candidates.map((c, i) => `[${i}] ${c.path} — ${c.desc || ''}`).join('\n')
  const answer = await chatCompletion(
    [
      {
        role: 'system',
        content:
          '你是搜索排序助手。根据用户查询，对候选文件按相关度从高到低排序。' +
          '只输出用逗号分隔的编号序列（如 2,0,1），不要输出任何其他内容。'
      },
      { role: 'user', content: `查询：${query}\n候选：\n${list}` }
    ],
    signal
  )
  const idxs = [...answer.matchAll(/(\d+)/g)]
    .map((m) => parseInt(m[1], 10))
    .filter((i) => i >= 0 && i < candidates.length)
  const seen = new Set()
  const ordered = []
  for (const i of idxs) {
    if (!seen.has(i)) {
      seen.add(i)
      ordered.push(candidates[i])
    }
  }
  // 未提及的候选按原顺序追加，保证不丢结果
  candidates.forEach((c, i) => {
    if (!seen.has(i)) ordered.push(c)
  })
  return ordered
}

/* ---------------- 本地语义搜索（grep 自然语言模式） ---------------- */

function tokenize(s) {
  return String(s)
    .toLowerCase()
    .split(/[\s,，、;；.。!！?？"'""''（）()\[\]{}]+/)
    .filter((t) => t.length >= 1)
}

/** 从虚拟文件系统构建搜索语料 */
export function buildCorpus(root) {
  const docs = []
  const walk = (node, path) => {
    const p = path + '/' + node.name
    if (node.type === 'file') {
      docs.push({ name: node.name, desc: node.desc || '', body: node.body || [], path: p })
    } else {
      ;(node.children || []).forEach((c) => walk(c, p))
    }
  }
  ;(root.children || []).forEach((c) => walk(c, ''))
  return docs
}

/**
 * 本地全文检索：对语料按词条命中打分
 * 返回 [{ path, score, matchedLines, ...doc }]，按相关度降序
 */
export function localSearch(query, corpus) {
  const terms = tokenize(query)
  if (!terms.length) return []
  return corpus
    .map((doc) => {
      const nameL = doc.name.toLowerCase()
      const descL = doc.desc.toLowerCase()
      const bodyL = doc.body.join(' ').toLowerCase()
      let score = 0
      for (const t of terms) {
        if (nameL.includes(t)) score += 5
        if (descL.includes(t)) score += 3
        score += Math.min(bodyL.split(t).length - 1, 5)
      }
      const matchedLines = doc.body.filter((line) =>
        terms.some((t) => line.toLowerCase().includes(t))
      )
      return { ...doc, score, matchedLines }
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
}

/* ---------------- 浏览记录（学习路径推荐） ---------------- */

/** 读取浏览历史：[{ path, ts }]，最近在前 */
export function getHistory() {
  const s = storage()
  if (!s) return []
  try {
    return JSON.parse(s.getItem(HIST_KEY) || '[]')
  } catch {
    return []
  }
}

/** 记录一次页面访问（localStorage，不上传） */
export function recordVisit(path) {
  const s = storage()
  if (!s) return
  const h = getHistory().filter((x) => x.path !== path)
  h.unshift({ path, ts: Date.now() })
  s.setItem(HIST_KEY, JSON.stringify(h.slice(0, 50)))
}
