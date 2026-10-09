<template>
  <Teleport to="body">
    <!-- 全屏终端浮层 -->
    <Transition name="fade">
      <div v-if="store.terminalOpen" class="ov-mask" @click.self="store.terminalOpen = false" role="dialog" aria-label="虚拟终端">
        <Terminal @gui="switchToGui" />
        <p class="ov-hint">按 ESC 或点击空白处关闭终端</p>
      </div>
    </Transition>
    <!-- 图形导航 -->
    <GuiNav />
    <!-- AI 设置面板 -->
    <AiSettings />
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Terminal from './Terminal.vue'
import GuiNav from './GuiNav.vue'
import AiSettings from './AiSettings.vue'
import { store } from '../store'

function switchToGui() {
  store.terminalOpen = false
  store.guiOpen = true
}

function onKey(e) {
  if (e.key === 'Escape') {
    store.terminalOpen = false
    store.guiOpen = false
    store.aiSettingsOpen = false
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
