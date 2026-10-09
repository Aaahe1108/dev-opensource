---
layout: home
title: dev-opensource 首页
ai_summary: "从内核到社区，用 Linux 文件系统浏览开源世界：终端命令即导航，每个文件都是一段开源故事。"

hero:
  name: dev-opensource
  text: 用 Linux 文件系统讲述开源精神
  tagline: 登录名为 opensource 的服务器 —— 每一个文件，都是开源世界的一段故事

features:
  - title: /home 先驱者
    details: Torvalds、Stallman、Raymond 与社区的故事。cd /home 即可进入。
  - title: /etc/licenses 许可证
    details: GPL、MIT、Apache-2.0、BSD 的讲解与对比卡片。
  - title: /var/log 历史日志
    details: 内核时间线、发行版编年史与著名分叉事件。
  - title: /lost+found 教训
    details: CentOS 事件、Heartbleed 与被遗弃的项目。
  - title: /opt/deploy 部署
    details: 本站 Nginx、HTTPS、systemd 与 CI/CD 配置全公开。
  - title: /proc/community 社区
    details: 社区统计 JSON 与贡献指南。
---

## 使用方法

> 上方 Hero 就是一个真实可用的终端（带打字机动画）。在任意页面可点击右上角「⌨ 终端」按钮打开它。

```bash
ls /etc/licenses          # 列出许可证
cat /home/torvalds        # 查看 Linus Torvalds
grep "GPL" /etc/licenses/*  # 全局搜索（支持通配符）
tree /                    # 查看整棵目录树
gui                       # 切换到图形导航
ask GPL 和 MIT 有什么区别  # AI 问答（无 Key 时本地降级）
sudo make install 主题名    # AI 生成页面草稿
```

也支持 **Tab 补全**（命令名与路径）、**↑/↓ 历史命令** 与 **Ctrl+C 中断**。

## 快速导航

- 🧑‍💻 先驱者：[`/home/torvalds`](/home/torvalds) · [`/home/stallman`](/home/stallman) · [`/home/raymond`](/home/raymond) · [`/home/community`](/home/community)
- 📜 许可证：[`/etc/licenses`](/etc/licenses/)（含对比卡片）
- 📅 日志：[`/var/log/kernel`](/var/log/kernel) · [`/var/log/distro`](/var/log/distro) · [`/var/log/fork`](/var/log/fork)
- 🧭 图鉴与教程：[`/usr/share/distros`](/usr/share/distros/) · [`/usr/share/philosophy`](/usr/share/philosophy/) · [`/usr/share/tutorials`](/usr/share/tutorials/)
- 🩹 教训：[`/lost+found/centos`](/lost+found/centos) · [`/lost+found/heartbleed`](/lost+found/heartbleed)
- ⚙️ 部署：[`/opt/deploy/nginx`](/opt/deploy/nginx) · [`/opt/deploy/certbot`](/opt/deploy/certbot) · [`/opt/deploy/systemd`](/opt/deploy/systemd)

---

> 💡 移动端或偏好传统导航？点击右上角「🗂 导航」打开侧边栏，或在终端输入 `gui`。

<LinuxDivider icon="🐧" />

## Tux 守护的服务器

<pre class="ascii-art">      .--.
     |o_o |
     |:_/ |
    //   \ \
   (|     | )
   /'\_   _/`\
   \___)=(___/
  <span class="ascii-art__label">Tux · Linux 企鹅 · 本站吉祥物</span>
</pre>

<LinuxDivider icon="$" />
