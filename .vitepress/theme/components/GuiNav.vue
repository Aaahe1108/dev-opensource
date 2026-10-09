<template>
  <Teleport to="body">
    <Transition name="slide">
      <aside v-if="store.guiOpen" class="gui" role="navigation" aria-label="图形文件导航">
        <header class="gui__head">
          <span class="gui__logo">🗂 /</span>
          <span class="gui__title">导航 · 文件系统</span>
          <button class="gui__close" type="button" @click="store.guiOpen = false" aria-label="关闭导航">✕</button>
        </header>
        <div class="gui__search">
          <input v-model="q" type="search" placeholder="搜索文件或目录…" aria-label="搜索文件" />
        </div>
        <nav class="gui__body">
          <GuiNode :node="root" :depth="0" :query="q" />
        </nav>
        <footer class="gui__foot">
          <span>提示：点击文件打开页面；输入 <kbd>gui</kbd> 可随时打开本面板。</span>
        </footer>
      </aside>
    </Transition>
    <Transition name="fade">
      <div v-if="store.guiOpen" class="gui-mask" @click="store.guiOpen = false" />
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import GuiNode from './GuiNode.vue'
import { ROOT } from '../vfs'
import { store } from '../store'

const root = ROOT
const q = ref('')
</script>
