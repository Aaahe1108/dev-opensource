# dev-opensource

> 用 Linux 文件系统讲述开源精神。

`dev-opensource` 是一个可浏览的 Linux 文件系统静态网站。用户进入后就像登录了一台名为 `opensource` 的服务器，通过终端命令（`ls`、`cd`、`cat`、`grep`、`tree`）浏览内容。每个“文件”对应一个真实网页，拥有独立 URL 和正常 HTML 内容。

## 快速开始

```bash
# 安装依赖（需要 Node.js >= 18）
pnpm install

# 本地开发
pnpm dev

# 构建纯静态文件（输出到 .vitepress/dist）
pnpm build

# 本地预览构建结果
pnpm preview
```

## 功能

- 🖥 **虚拟文件系统**：用 JSON 定义目录树（`.vitepress/theme/vfs.json`），映射到 VitePress 路由。
- ⌨ **终端组件**：支持 `ls`、`cd`、`cat`、`grep`、`tree`、`clear`、`help`、`gui`、`open`、`ask`、`config`、`sudo make install` 等命令，支持 **Tab 补全**、**上下方向键历史命令** 与 **Ctrl+C 中断**。
- 🤖 **五项 AI 能力**（无 API Key 时自动降级，网站完整可用）：
  1. **AI 终端助手**：`ask GPL 和 MIT 有什么区别` —— 调用 OpenAI 兼容 API（DeepSeek 等），Key 在「🤖 AI」面板或 `config` 命令中配置，仅存本机 localStorage
  2. **AI 页面摘要**：每页顶部的「✨ AI 一句话总结」，预生成于 Markdown frontmatter，零实时调用
  3. **AI 语义搜索**：`grep` 支持自然语言（如 `grep 内核历史`），本地全文检索降级
  4. **AI 学习路径推荐**：首页根据 localStorage 浏览记录推荐下一站
  5. **AI 内容生成**：`sudo make install <主题>` 生成页面草稿（仅输出可复制，不写入站点）
- 📄 **每个文件节点都有对应的 Markdown 内容页**，例如：
  - `/home/torvalds` → Linus Torvalds 人物介绍
  - `/etc/licenses/GPL` → GPL 许可证讲解
  - `/var/log/kernel.log` → Linux 内核时间线
  - `/lost+found/centos` → CentOS 事件与开源可持续性反思
  - `/opt/deploy/nginx.conf` → 本站 Nginx 配置公开
- 🌓 深色/浅色切换、代码块一键复制、响应式布局（移动端自动打开图形导航）。
- 🗂 `gui` 模式：传统侧边栏导航，保证移动端与可访问性。

## AI Key 配置

```bash
# 方式一：页面内配置（推荐）
# 点击导航栏「🤖 AI」→ 填入 Base URL / Model / API Key → 保存
# Key 仅保存在本机浏览器 localStorage，不上传本站服务器

# 方式二：终端命令
ask config set key sk-xxxx
ask config set base https://api.deepseek.com/v1
ask config set model deepseek-chat
```

> 参考模板见 `.env.example`。支持任何 OpenAI 兼容接口（DeepSeek、OpenAI、硅基流动等）。
> 无 Key 时 `ask` / 语义搜索 / 内容生成自动降级为本地逻辑。

## 部署

```bash
# 构建后把 .vitepress/dist 部署到服务器
scp -r .vitepress/dist/* user@server:/var/www/dev-opensource/
```

Nginx 配置见 [`deploy/nginx.conf`](deploy/nginx.conf)，HTTPS 见 [`deploy/certbot.md`](deploy/certbot.md)，systemd 见 [`deploy/systemd.md`](deploy/systemd.md)，CI/CD 见 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

## 技术栈

VitePress + Vue 3 自定义主题 + 原生 JavaScript（虚拟文件系统 / 命令解析 / Tab 补全 / 历史命令）+ 手写 CSS。
