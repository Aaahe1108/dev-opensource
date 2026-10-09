import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'dev-opensource',
  description: '用 Linux 文件系统讲述开源精神 —— 登录名为 opensource 的虚拟服务器，用 ls、cd、cat、grep、tree 浏览开源世界。',
  lang: 'zh-CN',
  srcDir: '.',
  srcExclude: ['**/README.md'],
  cleanUrls: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0d1117' }],
    ['meta', { name: 'keywords', content: '开源, Linux, GPL, MIT, Apache-2.0, BSD, VitePress, 终端, 文件系统, dev-opensource' }],
    ['meta', { property: 'og:title', content: 'dev-opensource · 用 Linux 文件系统讲述开源精神' }],
    ['meta', { property: 'og:description', content: '登录 opensource 服务器：ls /etc/licenses、cat /home/torvalds、tree / —— 每个文件都是一个开源故事。' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;1,400&display=swap' }]
  ],
  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' }
  },
  themeConfig: {
    search: { provider: 'local' },
    docFooter: { prev: '← 上一页', next: '下一页 →' },
    darkModeSwitchLabel: '深浅色切换',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    outline: { level: [2, 3], label: '页面导航' }
  }
})
