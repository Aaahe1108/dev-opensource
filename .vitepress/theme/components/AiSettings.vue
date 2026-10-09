<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="store.aiSettingsOpen" class="aiset-mask" @click.self="store.aiSettingsOpen = false" role="dialog" aria-label="AI 设置">
        <div class="aiset">
          <header class="aiset__head">
            <span class="aiset__title">🤖 AI 设置</span>
            <button class="aiset__close" type="button" aria-label="关闭" @click="store.aiSettingsOpen = false">✕</button>
          </header>

          <div class="aiset__body">
            <label class="aiset__row">
              <input type="checkbox" v-model="form.enabled" />
              <span>启用 AI 能力（<code>ask</code> / 语义搜索 / 内容生成）</span>
            </label>

            <label class="aiset__field">
              <span class="aiset__label">API Base URL（OpenAI 兼容）</span>
              <input class="aiset__input" v-model="form.base" type="url" placeholder="https://api.deepseek.com/v1" spellcheck="false" />
            </label>

            <label class="aiset__field">
              <span class="aiset__label">模型名称</span>
              <input class="aiset__input" v-model="form.model" type="text" placeholder="deepseek-chat" spellcheck="false" />
            </label>

            <label class="aiset__field">
              <span class="aiset__label">API Key</span>
              <input
                class="aiset__input"
                v-model="form.key"
                :type="showKey ? 'text' : 'password'"
                placeholder="sk-…（仅保存在本机浏览器 localStorage）"
                spellcheck="false"
                autocomplete="off"
              />
            </label>
            <label class="aiset__row aiset__row--small">
              <input type="checkbox" v-model="showKey" />
              <span>显示 Key</span>
            </label>

            <p class="aiset__note">
              ⚠️ Key 仅保存在你自己的浏览器 localStorage 中，不会上传到本站服务器。
              无 Key 或关闭开关时，所有 AI 功能自动降级为本地逻辑，网站完整可用。
              支持任何 OpenAI 兼容接口（DeepSeek、OpenAI、硅基流动等）。
            </p>

            <p v-if="status" class="aiset__status" :class="statusType">{{ status }}</p>
          </div>

          <footer class="aiset__foot">
            <button class="aiset__btn aiset__btn--primary" type="button" @click="save">保存</button>
            <button class="aiset__btn" type="button" @click="clear">清除 Key</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { getAIConfig, setAIConfig, clearAIConfig } from '../ai'
import { store } from '../store'

const showKey = ref(false)
const status = ref('')
const statusType = ref('')

const form = reactive({
  enabled: true,
  base: '',
  model: '',
  key: ''
})

// 打开时载入当前配置
Object.assign(form, getAIConfig())

function save() {
  setAIConfig({
    enabled: form.enabled,
    base: form.base.trim() || 'https://api.deepseek.com/v1',
    model: form.model.trim() || 'deepseek-chat',
    key: form.key.trim()
  })
  status.value = '✔ 已保存到本机浏览器（localStorage）。'
  statusType.value = 'aiset__status--ok'
  store.aiSettingsOpen = false
}

function clear() {
  clearAIConfig()
  Object.assign(form, getAIConfig())
  status.value = '✔ 已清除全部 AI 配置。'
  statusType.value = 'aiset__status--ok'
}
</script>

<style scoped>
.aiset-mask {
  position: fixed;
  inset: 0;
  z-index: 1002;
  background: rgba(1, 4, 9, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.aiset {
  width: min(520px, 100%);
  background: var(--term-bg);
  border: 1px solid var(--term-border);
  border-radius: 14px;
  color: var(--term-fg);
  font-family: var(--font-mono);
  font-size: 13px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(1, 4, 9, 0.6);
}
.aiset__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--term-bg-soft);
  border-bottom: 1px solid var(--term-border);
}
.aiset__title { font-weight: 700; }
.aiset__close {
  background: transparent;
  border: none;
  color: var(--term-dim);
  font-size: 15px;
  cursor: pointer;
}
.aiset__close:hover { color: var(--term-red); }
.aiset__body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.aiset__row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.aiset__row--small { font-size: 11.5px; color: var(--term-dim); }
.aiset__row code { color: var(--term-green); }
.aiset__field { display: flex; flex-direction: column; gap: 4px; }
.aiset__label { font-size: 11.5px; color: var(--term-dim); }
.aiset__input {
  background: var(--term-bg-soft);
  border: 1px solid var(--term-border);
  border-radius: 8px;
  color: var(--term-fg);
  font-family: inherit;
  font-size: 12.5px;
  padding: 8px 10px;
  outline: none;
}
.aiset__input:focus { border-color: var(--term-green); }
.aiset__note {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--term-yellow);
}
.aiset__status { margin: 0; font-size: 12px; }
.aiset__status--ok { color: var(--term-green); }
.aiset__foot {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--term-border);
}
.aiset__btn {
  flex: 1;
  font-family: inherit;
  font-size: 12.5px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--term-border);
  background: transparent;
  color: var(--term-fg);
  cursor: pointer;
}
.aiset__btn:hover { border-color: var(--term-green); }
.aiset__btn--primary { background: var(--term-green); color: var(--term-bg); border-color: var(--term-green); font-weight: 700; }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
