import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Terminal from './components/Terminal.vue'
import GuiNav from './components/GuiNav.vue'
import Overlays from './components/Overlays.vue'
import DistroFilter from './components/DistroFilter.vue'
import LinuxDecor from './components/LinuxDecor.vue'
import LinuxDivider from './components/LinuxDivider.vue'
import SiteFooter from './components/SiteFooter.vue'
import AiSummary from './components/AiSummary.vue'
import LearningPath from './components/LearningPath.vue'
import AiSettings from './components/AiSettings.vue'
import { store } from './store'
import { recordVisit } from './ai'
import './style.css'

export default {
  // 使用 extends 让 VitePress 自动串联默认主题的 enhanceApp
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // 全局注册：Markdown 中可直接使用
    app.component('DistroFilter', DistroFilter)
    app.component('LinuxDivider', LinuxDivider)

    // 记录浏览历史（localStorage，不上传）→ 驱动 AI 学习路径推荐
    // 注意：VitePress 的 router 不是 vue-router 实例，
    // 导航钩子通过 onAfterRouteChange 注册（同源 <a> 点击与前进/后退都会触发）
    if (typeof window !== 'undefined') {
      router.onAfterRouteChange = (href) => recordVisit(href)
      // 初始页面也计入浏览记录
      recordVisit(router.route.path)
      // 移动端首次访问自动打开图形导航（可访问性保障）
      if (window.innerWidth < 720 && !window.sessionStorage.getItem('devop_mobile_gui')) {
        window.sessionStorage.setItem('devop_mobile_gui', '1')
        store.guiOpen = true
      }
    }
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 首页 Hero 替换为终端（打字机动画 + Tux 企鹅 ASCII）
      'home-hero-info': () =>
        h(Terminal, {
          hero: true,
          onGui: () => {
            store.terminalOpen = false
            store.guiOpen = true
          }
        }),
      // 首页特性区上方：Tux 企鹅 + shell 标语装饰
      'home-features-before': () => h(LinuxDecor),
      // 首页特性区下方：AI 学习路径推荐
      'home-features-after': () => h(LearningPath),
      // 每个内容页顶部：AI 一句话总结（预生成于 frontmatter）
      'doc-before': () => h(AiSummary),
      // 导航栏按钮：终端 / 图形导航 / AI 设置
      'nav-bar-content-before': () =>
        h('div', { class: 'nav-actions' }, [
          h(
            'button',
            {
              class: 'nav-action-btn',
              title: '打开虚拟终端',
              onClick: () => {
                store.terminalOpen = true
              }
            },
            '⌨ 终端'
          ),
          h(
            'button',
            {
              class: 'nav-action-btn',
              title: '打开图形导航',
              onClick: () => {
                store.guiOpen = true
              }
            },
            '🗂 导航'
          ),
          h(
            'button',
            {
              class: 'nav-action-btn',
              title: '配置 AI（API Key 仅存本机）',
              onClick: () => {
                store.aiSettingsOpen = true
              }
            },
            '🤖 AI'
          )
        ]),
      // 底部：主题页脚 + 浮层（全屏终端 + 侧边导航 + AI 设置）
      'layout-bottom': () => h('div', null, [h(SiteFooter), h(Overlays)])
    })
  }
}
