<template>
  <ul class="gui-tree">
    <li v-for="child in filtered" :key="child.name">
      <div class="gui-row" :style="{ paddingLeft: depth * 14 + 'px' }">
        <button
          v-if="child.type === 'dir'"
          class="gui-toggle"
          type="button"
          :aria-expanded="open"
          @click="open = !open"
        >
          {{ open ? '▾' : '▸' }}
        </button>
        <span v-else class="gui-toggle gui-toggle--sp" aria-hidden="true">·</span>
        <a
          v-if="child.route"
          class="gui-link"
          :class="{ 'gui-link--dir': child.type === 'dir' }"
          :href="child.route"
          :title="child.desc || child.name"
          @click="store.guiOpen = false"
        >
          {{ child.name }}<span v-if="child.type === 'dir'">/</span>
        </a>
        <span v-else class="gui-name gui-name--dir">{{ child.name }}/</span>
      </div>
      <GuiNode
        v-if="child.type === 'dir' && open"
        :node="child"
        :depth="depth + 1"
        :query="query"
      />
    </li>
  </ul>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store } from '../store'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  query: { type: String, default: '' }
})

const open = ref(props.depth < 1)

function matches(node, q) {
  const needle = q.toLowerCase()
  if (node.name.toLowerCase().includes(needle)) return true
  if (node.desc && node.desc.toLowerCase().includes(needle)) return true
  return (node.children || []).some((c) => matches(c, q))
}

const filtered = computed(() => {
  const children = props.node.children || []
  if (!props.query.trim()) return children
  return children.filter((c) => matches(c, props.query.trim()))
})

// 搜索时强制展开
if (props.query) open.value = true
</script>
