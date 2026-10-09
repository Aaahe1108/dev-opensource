<template>
  <div class="term" :class="{ 'term--hero': hero }">
    <div class="term__bar">
      <span class="term__dots" aria-hidden="true">
        <i class="dot r"></i><i class="dot y"></i><i class="dot g"></i>
      </span>
      <span class="term__title">guest@opensource: 终端</span>
      <span class="term__ai" :class="{ 'term__ai--on': aiOn }" title="AI 状态">
        {{ aiOn ? '🤖 AI' : '🤖 本地' }}
      </span>
      <button class="term__btn" type="button" @click="$emit('gui')" title="切换到图形导航">GUI 导航</button>
    </div>

    <div class="term__body" ref="bodyEl" @click="focusInput" role="log" aria-label="终端输出">
      <template v-for="(line, i) in lines" :key="i">
        <!-- 命令行 -->
        <div v-if="line.type === 'cmd'" class="t-row t-cmd">
          <span class="t-prompt">{{ prompt }}</span><span class="t-cmdtext">{{ line.text }}</span>
        </div>

        <!-- ls 列表 -->
        <div v-else-if="line.type === 'ls'" class="t-rows">
          <div v-for="(e, j) in line.entries" :key="j" class="t-ls">
            <a v-if="e.route" :href="e.route" class="t-name" :class="'t-name--' + e.type">
              {{ e.name }}{{ e.type === 'dir' ? '/' : '' }}
            </a>
            <span v-else class="t-name" :class="'t-name--' + e.type">
              {{ e.name }}{{ e.type === 'dir' ? '/' : '' }}
            </span>
            <span class="t-meta">{{ line.long ? e.size + '  ' + e.desc : e.desc }}</span>
          </div>
        </div>

        <!-- tree / 多行文本 -->
        <div v-else-if="line.type === 'tree'" class="t-row">
          <pre class="t-pre t-tree">{{ line.text }}</pre>
        </div>

        <!-- 链接提示 -->
        <div v-else-if="line.type === 'links'" class="t-rows">
          <div v-for="(l, j) in line.links" :key="j" class="t-linkrow">
            → <a :href="l.to">{{ l.label }}</a>
          </div>
        </div>

        <!-- 普通文本 / 错误 / 成功 / grep -->
        <div v-else class="t-row" :class="'t-' + line.type">
          <pre v-if="line.pre" class="t-pre">{{ line.text }}</pre>
          <span v-else>{{ line.text }}</span>
        </div>
      </template>

      <!-- 输入行 -->
      <div class="t-row t-input-row">
        <span class="t-prompt">{{ prompt }}</span>
        <input
          ref="inputEl"
          class="t-input"
          v-model="input"
          @keydown="onKey"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          aria-label="终端命令输入"
          :placeholder="hero ? '' : '输入 help 查看命令'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vitepress'
import { findNode, resolvePath, pathOf, normalizePath, expandGlob, ROOT } from '../vfs'
import {
  isAIEnabled,
  aiAsk,
  localAsk,
  localSearch,
  buildCorpus,
  generateDraft,
  aiGenerateDraft,
  aiRerank,
  getAIConfig,
  setAIConfig,
  clearAIConfig
} from '../ai'

const props = defineProps({
  hero: { type: Boolean, default: false }
})
const emit = defineEmits(['gui'])

const router = useRouter()
const bodyEl = ref(null)
const inputEl = ref(null)
const input = ref('')
const lines = ref([])
const cwd = ref('/')
const history = ref([])
const hIdx = ref(-1)
// 当前进行中的 AI 请求（用于 Ctrl+C 中断）
let abortCtrl = null

const prompt = computed(() => `guest@opensource:${cwd.value} $`)
const aiOn = computed(() => isAIEnabled())

const COMMANDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'grep', 'tree', 'clear', 'gui', 'open', 'echo', 'whoami', 'date', 'history', 'sudo', 'ask', 'config', 'exit']

const HELP = [
  ['help', '显示本帮助'],
  ['ls [-l] [路径]', '列出目录内容'],
  ['cd [路径]', '切换目录（默认 /home）'],
  ['pwd', '显示当前路径'],
  ['cat <文件>', '查看文件内容'],
  ['grep "模式" <路径...>', '搜索文件（支持 * 与自然语言）'],
  ['tree [路径]', '以树状图显示目录'],
  ['ask <自然语言问题>', 'AI 问答（无 Key 时本地降级）'],
  ['sudo make install <主题>', 'AI 生成页面草稿（不写入站点）'],
  ['config [set|on|off|clear]', '查看/配置 AI（Key 存于本机）'],
  ['open <路径>', '在浏览器中打开对应页面'],
  ['gui', '切换到图形导航'],
  ['clear', '清屏'],
  ['history', '命令历史'],
  ['Ctrl+C', '中断当前 AI 请求'],
  ['whoami / date / echo', '彩蛋命令']
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function scrollBottom() {
  if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

function print(obj) {
  lines.value.push(obj)
  nextTick(scrollBottom)
}

function printLines(text, type = 'text', pre = true) {
  String(text).split('\n').forEach((l) => print({ type, text: l, pre }))
}

function focusInput() {
  inputEl.value && inputEl.value.focus()
}

function tokenize(s) {
  const re = /"([^"]*)"|(\S+)/g
  const out = []
  let m
  while ((m = re.exec(s))) out.push(m[1] ?? m[2])
  return out
}

/* ---------------- 文件系统命令 ---------------- */

function entryOf(node, fullPath) {
  return {
    name: node.name,
    type: node.type,
    route: node.route || null,
    size: node.size || (node.type === 'dir' ? '4.0K' : '1.0K'),
    desc: node.desc || '',
    path: fullPath
  }
}

function cmdLs(args) {
  let long = false
  let target = null
  for (const a of args) {
    if (a.startsWith('-')) long = true
    else target = a
  }
  const segs = target ? resolvePath(cwd.value, target) : normalizePath(cwd.value)
  const node = findNode(pathOf(segs))
  if (!node) return print({ type: 'error', text: `ls: 无法访问 '${target}': 没有那个文件或目录` })
  if (node.type === 'file') {
    print({ type: 'ls', entries: [entryOf(node, pathOf(segs))], long })
    return
  }
  const children = node.children || []
  if (!children.length) return print({ type: 'text', text: '(空目录)' })
  print({ type: 'ls', entries: children.map((c) => entryOf(c, pathOf([...segs, c.name]))), long })
}

function cmdCd(args) {
  const target = args[0] || '/home'
  const segs = resolvePath(cwd.value, target)
  const node = findNode(pathOf(segs))
  if (!node) return print({ type: 'error', text: `cd: ${target}: 没有那个文件或目录` })
  if (node.type === 'file') return print({ type: 'error', text: `cd: ${target}: 不是一个目录` })
  cwd.value = pathOf(segs)
}

function cmdCat(args) {
  if (!args.length) return print({ type: 'error', text: 'cat: 缺少文件参数' })
  for (const a of args) {
    const segs = resolvePath(cwd.value, a)
    const node = findNode(pathOf(segs))
    if (!node) {
      print({ type: 'error', text: `cat: ${a}: 没有那个文件或目录` })
      continue
    }
    if (node.type === 'dir') {
      print({ type: 'error', text: `cat: ${a}: 是一个目录` })
      continue
    }
    ;(node.body || ['(空文件)']).forEach((l) => print({ type: 'text', text: l, pre: true }))
    if (node.route) {
      print({ type: 'text', text: '' })
      print({ type: 'links', links: [{ to: node.route, label: `在浏览器中打开完整页面 ${node.route}` }] })
    }
  }
}

/* grep：正则/通配搜索 + 自然语言语义搜索（AI 降级为本地全文检索） */
function cmdGrep(args) {
  let i = 0
  let ignoreCase = false
  while (args[i] === '-i') {
    ignoreCase = true
    i++
  }
  const pattern = args[i++]
  const paths = args.slice(i)
  if (!pattern) return print({ type: 'error', text: 'grep: 用法: grep "模式" <文件路径...>' })

  // 自然语言模式：单个参数且含空格或中文 → 语义搜索
  if (!paths.length && /[\u4e00-\u9fff\s]/.test(pattern)) {
    return cmdGrepNL(pattern)
  }

  let re
  try {
    re = new RegExp(pattern, ignoreCase ? 'i' : '')
  } catch {
    re = null
  }
  let total = 0
  for (const p of paths) {
    const matches = expandGlob(cwd.value, p)
    if (!matches.length) {
      print({ type: 'error', text: `grep: ${p}: 没有那个文件或目录` })
      continue
    }
    for (const { node, path } of matches) {
      ;(node.body || []).forEach((line, idx) => {
        const hit = re ? re.test(line) : line.includes(pattern)
        if (hit) {
          total++
          print({ type: 'grep', text: `${path}:${idx + 1}: ${line}`, pre: true })
        }
      })
    }
  }
  if (!total) print({ type: 'text', text: '(无匹配)' })
}

// grep 自然语言模式：本地全文检索 + AI 语义重排（无 Key 时纯本地）
async function cmdGrepNL(query) {
  const results = localSearch(query, buildCorpus(ROOT)).slice(0, 8)
  if (!results.length) {
    print({ type: 'text', text: '(无匹配)' })
    return
  }
  let ordered = results
  if (isAIEnabled()) {
    print({ type: 'success', text: '🤖 语义搜索（AI 重排中… Ctrl+C 中断）' })
    abortCtrl = new AbortController()
    try {
      ordered = await aiRerank(query, results, abortCtrl.signal)
    } catch (err) {
      if (err.name === 'AbortError') {
        print({ type: 'error', text: '已中断 (^C)' })
        return
      }
      print({ type: 'error', text: `AI 重排失败：${err.message}，使用本地排序。` })
    }
    abortCtrl = null
  } else {
    print({ type: 'success', text: '🔎 本地全文检索（未配置 API Key，自动降级）' })
  }
  for (const r of ordered) {
    const pct = Math.min(99, Math.round((r.score / (r.score + 4)) * 100))
    print({ type: 'grep', text: `${r.path}  相关度 ${pct}%  ${r.desc || ''}`, pre: true })
    r.matchedLines.slice(0, 2).forEach((l) => print({ type: 'text', text: `    ${l}`, pre: true }))
  }
  print({ type: 'text', text: `共 ${ordered.length} 个文件匹配。` })
}

function treeText(node, prefix = '') {
  let out = ''
  const children = node.children || []
  children.forEach((c, i) => {
    const last = i === children.length - 1
    out += prefix + (last ? '└── ' : '├── ') + c.name + (c.type === 'dir' ? '/' : '') + '\n'
    if (c.type === 'dir') out += treeText(c, prefix + (last ? '    ' : '│   '))
  })
  return out
}

function cmdTree(args) {
  const target = args[0] || cwd.value
  const segs = resolvePath(cwd.value, target)
  const node = findNode(pathOf(segs))
  if (!node) return print({ type: 'error', text: `tree: ${target}: 没有那个文件或目录` })
  const head = pathOf(segs) === '/' ? '/' : node.name + '/'
  print({ type: 'tree', text: head + '\n' + treeText(node) })
}

/* ---------------- AI 命令 ---------------- */

// ask：AI 问答（无 Key 自动降级为本地知识库）
async function cmdAsk(args) {
  const q = args.join(' ')
  if (!q) return print({ type: 'error', text: 'ask: 用法: ask <自然语言问题>' })
  if (!isAIEnabled()) {
    print({ type: 'success', text: '🤖 AI 助手（本地降级模式 · 输入 config 配置 API Key 可升级）：' })
    printLines(localAsk(q), 'text')
    return
  }
  print({ type: 'success', text: '🤖 AI 助手：' })
  print({ type: 'text', text: '思考中…（Ctrl+C 中断）' })
  abortCtrl = new AbortController()
  try {
    const answer = await aiAsk(q, abortCtrl.signal)
    abortCtrl = null
    printLines(answer, 'text')
  } catch (err) {
    abortCtrl = null
    if (err.name === 'AbortError') {
      print({ type: 'error', text: '已中断 (^C)' })
      return
    }
    print({ type: 'error', text: `AI 调用失败：${err.message}` })
    print({ type: 'text', text: '已自动降级为本地知识库：' })
    printLines(localAsk(q), 'text')
  }
}

// sudo make install <topic>：AI 生成页面草稿（只输出，不写入站点）
async function cmdMakeInstall(args) {
  const topic = args.join(' ')
  if (!topic) return print({ type: 'error', text: 'sudo make install: 用法: sudo make install <主题>' })
  print({ type: 'success', text: `⚙ 正在为「${topic}」生成页面草稿…` })
  let draft
  if (isAIEnabled()) {
    abortCtrl = new AbortController()
    try {
      draft = await aiGenerateDraft(topic, abortCtrl.signal)
      abortCtrl = null
      print({ type: 'success', text: '✔ AI 草稿生成完成：' })
    } catch (err) {
      abortCtrl = null
      if (err.name === 'AbortError') return print({ type: 'error', text: '已中断 (^C)' })
      print({ type: 'error', text: `AI 生成失败：${err.message}，降级为本地模板。` })
      draft = generateDraft(topic)
    }
  } else {
    draft = generateDraft(topic)
    print({ type: 'text', text: '(本地模板模式 · 输入 config 配置 API Key 可启用 AI 生成)' })
  }
  print({ type: 'text', text: '' })
  printLines(draft, 'grep', true)
  print({ type: 'text', text: '' })
  print({ type: 'success', text: '✔ 草稿仅输出到终端，未写入站点（安全设计）。选中文本即可复制。' })
}

// config：查看/配置 AI
function cmdConfig(args) {
  if (!args.length) {
    const cfg = getAIConfig()
    print({ type: 'text', text: `AI 开关 : ${cfg.enabled ? '开' : '关'}`, pre: true })
    print({ type: 'text', text: `Base URL: ${cfg.base}`, pre: true })
    print({ type: 'text', text: `Model   : ${cfg.model}`, pre: true })
    print({
      type: 'text',
      text: `API Key : ${cfg.key ? cfg.key.slice(0, 6) + '…' + cfg.key.slice(-4) + '（已设置）' : '(未设置)'}`,
      pre: true
    })
    print({ type: 'text', text: '', pre: true })
    print({ type: 'text', text: '用法:', pre: true })
    print({ type: 'text', text: '  config set <key|base|model> <值>', pre: true })
    print({ type: 'text', text: '  config on | config off | config clear', pre: true })
    print({ type: 'text', text: '提示：也可点击导航栏「🤖 AI」面板配置。Key 仅存于本机。', pre: true })
    return
  }
  const sub = args[0]
  if (sub === 'set') {
    const field = args[1]
    const value = args.slice(2).join(' ')
    if (!field || !value) return print({ type: 'error', text: 'config set: 用法: config set <key|base|model> <值>' })
    if (!['key', 'base', 'model'].includes(field)) {
      return print({ type: 'error', text: `config set: 未知字段 '${field}'（可选 key/base/model）` })
    }
    const patch = {}
    patch[field] = value
    setAIConfig(patch)
    print({ type: 'success', text: `✔ ${field} 已保存（本机 localStorage）。` })
    if (field === 'key') print({ type: 'text', text: '现在 ask 与 sudo make install 已启用 AI 模式。' })
    return
  }
  if (sub === 'on') {
    setAIConfig({ enabled: true })
    return print({ type: 'success', text: '✔ AI 开关已打开。' })
  }
  if (sub === 'off') {
    setAIConfig({ enabled: false })
    return print({ type: 'success', text: '✔ AI 开关已关闭，全部功能降级为本地模式。' })
  }
  if (sub === 'clear') {
    clearAIConfig()
    return print({ type: 'success', text: '✔ 已清除全部 AI 配置。' })
  }
  print({ type: 'error', text: `config: 未知子命令 '${sub}'（输入 config 查看用法）` })
}

/* ---------------- 通用命令 ---------------- */

function cmdHelp() {
  printLines('可用命令：', 'success')
  for (const [cmd, desc] of HELP) {
    print({ type: 'text', text: `  ${cmd.padEnd(28)} ${desc}`, pre: true })
  }
  printLines('提示：Tab 补全路径与命令，↑/↓ 翻阅历史，Ctrl+C 中断 AI 请求。', 'text')
}

function cmdOpen(args) {
  if (!args.length) return print({ type: 'error', text: 'open: 缺少文件参数' })
  const segs = resolvePath(cwd.value, args[0])
  const node = findNode(pathOf(segs))
  if (!node) return print({ type: 'error', text: `open: ${args[0]}: 没有那个文件或目录` })
  if (!node.route) return print({ type: 'error', text: `open: ${args[0]}: 该目录没有对应页面` })
  print({ type: 'success', text: `正在打开 ${node.route} …` })
  router.go(node.route)
}

function exec(raw) {
  print({ type: 'cmd', text: raw })
  const tokens = tokenize(raw)
  if (!tokens.length) return
  const [cmd, ...args] = tokens

  // sudo make install <topic>（sudo 特殊形式）
  if (cmd === 'sudo' && args[0] === 'make' && args[1] === 'install') {
    return cmdMakeInstall(args.slice(2))
  }

  switch (cmd) {
    case 'help':
      cmdHelp()
      break
    case 'ls':
      cmdLs(args)
      break
    case 'cd':
      cmdCd(args)
      break
    case 'pwd':
      print({ type: 'text', text: cwd.value })
      break
    case 'cat':
      cmdCat(args)
      break
    case 'grep':
      cmdGrep(args)
      break
    case 'tree':
      cmdTree(args)
      break
    case 'clear':
      lines.value = []
      break
    case 'gui':
      print({ type: 'success', text: '正在切换到图形导航 …' })
      emit('gui')
      break
    case 'open':
      cmdOpen(args)
      break
    case 'ask':
      cmdAsk(args)
      break
    case 'config':
      cmdConfig(args)
      break
    case 'echo':
      print({ type: 'text', text: args.join(' ') })
      break
    case 'whoami':
      print({ type: 'text', text: 'guest' })
      break
    case 'date':
      print({ type: 'text', text: new Date().toLocaleString('zh-CN') })
      break
    case 'history':
      history.value.forEach((h, i) => print({ type: 'text', text: `  ${String(i + 1).padStart(3)}  ${h}`, pre: true }))
      break
    case 'sudo':
      printLines('[sudo] guest 的密码： ********', 'text')
      printLines('✔ 认证成功（开源精神，无需密码）', 'success')
      printLines('正在读取软件包列表…… 完成', 'text')
      printLines('正在安装：opensource 1.0.0', 'text')
      printLines('✔ 安装完成！本服务器的全部内容已对您开放。', 'success')
      printLines('输入 help 查看命令，或输入 gui 切换图形导航。', 'text')
      break
    case 'exit':
      printLines('连接已关闭……才怪，这里没有出口。输入 help 继续。', 'text')
      break
    default:
      print({ type: 'error', text: `bash: ${cmd}: 未找到命令。输入 help 查看可用命令。` })
  }
}

function banner() {
  if (props.hero) {
    TUX.forEach((l) => print({ type: 'text', text: l, pre: true }))
    print({ type: 'text', text: '' })
  }
  printLines('┌──────────────────────────────────────┐', 'success')
  printLines('│  dev-opensource · 开源精神文件系统   │', 'success')
  printLines('│  服务器: opensource   用户: guest    │', 'success')
  printLines('└──────────────────────────────────────┘', 'success')
  printLines('输入 help 查看可用命令，输入 gui 切换图形导航。', 'text')
  printLines('试试：ls /etc/licenses   cat /home/torvalds   ask GPL 和 MIT 有什么区别', 'text')
  print({ type: 'text', text: '' })
}

// Tux 企鹅 ASCII 艺术（首页 Hero 横幅）
const TUX = [
  '      .--.       ',
  '     |o_o |      ',
  '     |:_/ |      ',
  '    //   \\ \\    ',
  '   (|     | )    ',
  "   /'\\_   _/`\\   ",
  '   \\___)=(___/   '
]

/* ---------------- 输入处理 ---------------- */

function onKey(e) {
  // Ctrl+C：中断 AI 请求 / 清空输入
  if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
    e.preventDefault()
    print({ type: 'cmd', text: (input.value || '') + ' ^C' })
    input.value = ''
    if (abortCtrl) {
      abortCtrl.abort()
      abortCtrl = null
    }
    return
  }
  if (e.key === 'Enter') {
    const raw = input.value
    input.value = ''
    if (raw.trim()) {
      history.value.push(raw)
      hIdx.value = -1
    }
    exec(raw)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (history.value.length) {
      if (hIdx.value === -1) hIdx.value = history.value.length
      hIdx.value = Math.max(0, hIdx.value - 1)
      input.value = history.value[hIdx.value]
      nextTick(() => inputEl.value && inputEl.value.focus())
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (hIdx.value !== -1) {
      hIdx.value++
      if (hIdx.value >= history.value.length) {
        hIdx.value = -1
        input.value = ''
      } else {
        input.value = history.value[hIdx.value]
      }
    }
  } else if (e.key === 'Tab') {
    e.preventDefault()
    onTab()
  }
}

function onTab() {
  const raw = input.value
  const tokens = tokenize(raw)
  if (!tokens.length) return
  const endsWithSpace = /\s$/.test(raw)
  if (tokens.length === 1 && !endsWithSpace) {
    // 补全命令名
    const frag = tokens[0]
    applyCompletion(raw, frag, COMMANDS.filter((c) => c.startsWith(frag)))
  } else {
    // 补全路径
    const frag = endsWithSpace ? '' : tokens[tokens.length - 1]
    if (!frag) return
    applyCompletion(raw, frag, pathCompletions(frag))
  }
}

function pathCompletions(frag) {
  const segs = resolvePath(cwd.value, frag)
  const parentSegs = segs.slice(0, -1)
  const last = segs[segs.length - 1] || ''
  const parent = findNode(pathOf(parentSegs))
  if (!parent || parent.type !== 'dir') return []
  return (parent.children || [])
    .filter((c) => c.name.startsWith(last))
    .map((c) => (c.type === 'dir' ? c.name + '/' : c.name))
}

function applyCompletion(raw, frag, cands) {
  if (!cands.length) return
  if (cands.length === 1) {
    input.value = replaceLast(raw, frag, cands[0])
    return
  }
  let prefix = cands[0]
  for (const c of cands) {
    while (prefix && !c.startsWith(prefix)) prefix = prefix.slice(0, -1)
  }
  if (prefix && prefix !== frag) {
    input.value = replaceLast(raw, frag, prefix)
  }
  print({ type: 'cmd', text: raw })
  print({ type: 'text', text: cands.join('   '), pre: true })
}

function replaceLast(raw, frag, rep) {
  if (!frag) return raw + rep
  const idx = raw.lastIndexOf(frag)
  return raw.slice(0, idx) + rep
}

/* ---------------- 首页打字机动画 ---------------- */

onMounted(async () => {
  banner()
  if (props.hero) {
    await sleep(700)
    const cmd = 'sudo apt install opensource'
    for (const ch of cmd) {
      input.value += ch
      await sleep(55)
    }
    await sleep(450)
    input.value = ''
    exec(cmd)
  }
  focusInput()
})
</script>
