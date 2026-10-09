<template>
  <section class="lp" aria-label="AI 学习路径推荐">
    <header class="lp__head">
      <span class="lp__icon" aria-hidden="true">🧭</span>
      <div>
        <h2 class="lp__title">AI 学习路径推荐</h2>
        <p class="lp__sub">基于本地浏览记录（localStorage，不上传任何数据）· {{ visitedCount }}/{{ totalCount }} 已探索</p>
      </div>
    </header>

    <div v-if="recommendations.length" class="lp__grid">
      <a
        v-for="(r, i) in recommendations"
        :key="r.path"
        :href="r.path"
        class="lp__card"
      >
        <span class="lp__rank">第 {{ i + 1 }} 站</span>
        <span class="lp__path">{{ r.path }}</span>
        <span class="lp__desc">{{ r.desc }}</span>
        <span class="lp__reason">{{ r.reason }}</span>
      </a>
    </div>

    <div v-else class="lp__done">
      <span class="lp__done-icon" aria-hidden="true">🎉</span>
      <p>你已探索完全部学习路径！试试 <kbd>ask</kbd> 命令向 AI 提问，或 <kbd>tree /</kbd> 回顾整棵文件系统。</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ROOT } from '../vfs'
import { getHistory } from '../ai'

// 策划的学习路径顺序（由浅入深：人物 → 许可证 → 历史 → 哲学 → 实战 → 反思）
const LEARNING_ORDER = [
  { path: '/home/torvalds', reason: '从 Linux 之父的故事开始' },
  { path: '/home/stallman', reason: '了解自由软件运动的起源' },
  { path: '/home/raymond', reason: '理解开源协作的方法论' },
  { path: '/home/community', reason: '认识开源的土壤：社区' },
  { path: '/etc/licenses/', reason: '对比四大开源许可证' },
  { path: '/var/log/kernel', reason: '浏览 Linux 内核时间线' },
  { path: '/var/log/distro', reason: '了解发行版编年史' },
  { path: '/usr/share/philosophy/', reason: '阅读开源哲学经典' },
  { path: '/usr/share/tutorials/', reason: '动手贡献第一个 PR' },
  { path: '/lost+found/centos', reason: '思考开源可持续性' },
  { path: '/lost+found/heartbleed', reason: '理解基础设施之重' },
  { path: '/usr/share/distros/', reason: '图鉴：按家族筛选发行版' },
  { path: '/proc/community/stats', reason: '查看社区统计 JSON' }
]

const history = ref([])

onMounted(() => {
  history.value = getHistory()
})

const visitedPaths = computed(() => new Set(history.value.map((h) => h.path)))

// 收集所有可浏览的文件/目录页面
const allPages = computed(() => {
  const pages = []
  const walk = (node, prefix) => {
    const p = prefix + '/' + node.name
    if (node.route) pages.push({ path: node.route, desc: node.desc || node.name })
    ;(node.children || []).forEach((c) => walk(c, p))
  }
  ;(ROOT.children || []).forEach((c) => walk(c, ''))
  return pages
})

const totalCount = allPages.value.length
const visitedCount = computed(() => allPages.value.filter((p) => visitedPaths.value.has(p.path)).length)

const recommendations = computed(() => {
  // 未访问的页面中，按学习路径顺序优先，其余按文件系统顺序补充
  const unvisited = allPages.value.filter((p) => !visitedPaths.value.has(p.path))
  const ordered = []
  for (const stop of LEARNING_ORDER) {
    const hit = unvisited.find((p) => p.path === stop.path)
    if (hit) ordered.push({ ...hit, reason: stop.reason })
  }
  for (const p of unvisited) {
    if (!ordered.some((o) => o.path === p.path)) {
      ordered.push({ ...p, reason: '继续探索文件系统' })
    }
  }
  return ordered.slice(0, 3)
})
</script>

<style scoped>
.lp {
  margin: 2rem auto;
  max-width: 760px;
}
.lp__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.1rem;
}
.lp__icon { font-size: 22px; }
.lp__title {
  margin: 0;
  font-size: 1.25rem;
  font-family: var(--font-mono);
  color: var(--vp-c-text-1);
}
.lp__sub {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--vp-c-text-2);
}
.lp__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.lp__card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 1rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-elv);
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.lp__card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand);
}
.lp__rank {
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--vp-c-brand);
}
.lp__path {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-brand);
}
.lp__desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}
.lp__reason {
  font-size: 11.5px;
  color: var(--vp-c-text-2);
  font-family: var(--font-mono);
}
.lp__done {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.2rem;
  border: 1px dashed var(--vp-c-brand);
  border-radius: 12px;
  color: var(--vp-c-text-1);
}
.lp__done-icon { font-size: 26px; }
.lp__done p { margin: 0; font-size: 0.95rem; }
.lp__done kbd {
  font-family: var(--font-mono);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0 5px;
  background: var(--vp-c-bg-soft);
}
</style>
