<template>
  <div class="linux-divider" role="separator" aria-hidden="true">
    <span class="linux-divider__line"></span>
    <span class="linux-divider__icon">{{ icon }}</span>
    <span class="linux-divider__line"></span>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '$' }
})
</script>

<style scoped>
.linux-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 2rem 0;
  font-family: var(--font-mono);
}
.linux-divider__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--vp-c-divider), transparent);
}
.linux-divider__icon {
  color: var(--vp-c-brand);
  font-weight: 700;
  font-size: 14px;
}
</style>
