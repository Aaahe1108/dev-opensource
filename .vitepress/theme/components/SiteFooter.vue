<template>
  <footer class="sfooter">
    <div class="sfooter__line" aria-hidden="true">
      <span></span><i>🐧</i><span></span>
    </div>
    <p class="sfooter__cmd">
      <span class="sfooter__prompt">guest@opensource:~$</span> cat /etc/motd
    </p>
    <p class="sfooter__motd">欢迎来到 opensource 服务器 —— 用 Linux 文件系统讲述开源精神</p>
    <p class="sfooter__copy">© 2026 dev-opensource · Built with VitePress + Vue 3 · 本站内容以 GPL-3.0 共享</p>
    <p class="sfooter__uptime">
      uptime: <span id="sfooter-uptime">loading…</span>
    </p>
  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const uptime = ref('')

onMounted(() => {
  // 模拟服务器运行时长（本站首次上线时间）
  const boot = new Date('2026-10-08T00:00:00')
  const tick = () => {
    const diff = Date.now() - boot.getTime()
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    uptime.value = `${d} days, ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  tick()
  setInterval(tick, 30000)
})
</script>

<style scoped>
.sfooter {
  text-align: center;
  padding: 2.5rem 1.5rem 2rem;
  color: var(--vp-c-text-2);
  font-family: var(--font-mono);
  font-size: 13px;
}
.sfooter__line {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 420px;
  margin: 0 auto 1.3rem;
}
.sfooter__line::before,
.sfooter__line::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--vp-c-divider), transparent);
}
.sfooter__line i {
  font-style: normal;
  font-size: 15px;
}
.sfooter__cmd {
  margin: 0.2rem 0;
}
.sfooter__prompt {
  color: var(--vp-c-brand);
  font-weight: 600;
}
.sfooter__motd {
  color: var(--vp-c-text-1);
  margin: 0.4rem 0;
}
.sfooter__copy {
  font-size: 11.5px;
  opacity: 0.75;
  margin: 0.5rem 0 0.2rem;
}
.sfooter__uptime {
  font-size: 11px;
  opacity: 0.6;
  margin: 0;
}
</style>
