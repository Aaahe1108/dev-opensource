<template>
  <div v-if="summary" class="ai-summary">
    <span class="ai-summary__badge" aria-hidden="true">✨ AI 一句话总结</span>
    <p class="ai-summary__text">{{ summary }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

// AI 页面摘要：内容预生成于 Markdown frontmatter 的 ai_summary 字段，
// 构建时静态输出，无需实时调用 AI API。
const { frontmatter } = useData()
const summary = computed(() => frontmatter.value.ai_summary || '')
</script>

<style scoped>
.ai-summary {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin: 0 0 1.4rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand);
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
}
.ai-summary__badge {
  flex: none;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-brand);
  padding-top: 2px;
  white-space: nowrap;
}
.ai-summary__text {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  line-height: 1.6;
}
@media (max-width: 720px) {
  .ai-summary { flex-direction: column; gap: 4px; }
}
</style>
