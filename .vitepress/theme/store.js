import { reactive } from 'vue'

// 全局共享状态：终端浮层 / 图形导航 / AI 设置 的开关
export const store = reactive({
  terminalOpen: false,
  guiOpen: false,
  aiSettingsOpen: false
})
