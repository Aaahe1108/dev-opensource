---
title: /etc/licenses · 许可证总览
ai_summary: "四大开源许可证对比：GPL 传染性最强，MIT 最宽松，Apache-2.0 自带专利授权，BSD 源自伯克利。"
---

# 许可证总览

`/etc` 存放系统配置。这里的许可证决定了代码能被如何使用、修改与再分发。

```bash
ls /etc/licenses        # 列出全部许可证
cat /etc/licenses/GPL   # 查看单份许可证
```

## 对比卡片

<div class="cards">
  <div class="card">
    <span class="tag">Copyleft</span>
    <h3>GPL</h3>
    <p>传染性：衍生作品必须同样以 GPL 发布。保证用户四大自由。</p>
    <p>代表：Linux 内核、GCC、WordPress</p>
    <p><a href="/etc/licenses/GPL">查看详情 →</a></p>
  </div>
  <div class="card">
    <span class="tag">宽松</span>
    <h3>MIT</h3>
    <p>仅约 170 个单词，允许任何用途，只需保留版权声明。</p>
    <p>代表：jQuery、Ruby on Rails、Node.js 生态</p>
    <p><a href="/etc/licenses/MIT">查看详情 →</a></p>
  </div>
  <div class="card">
    <span class="tag">宽松 + 专利</span>
    <h3>Apache-2.0</h3>
    <p>与 MIT 类似，但额外包含明确的专利授权条款。</p>
    <p>代表：Kubernetes、Apache HTTP Server</p>
    <p><a href="/etc/licenses/Apache-2.0">查看详情 →</a></p>
  </div>
  <div class="card">
    <span class="tag">宽松</span>
    <h3>BSD</h3>
    <p>源自伯克利，限制极少，3-Clause 禁止用名字背书。</p>
    <p>代表：FreeBSD、nginx</p>
    <p><a href="/etc/licenses/BSD">查看详情 →</a></p>
  </div>
</div>

## 一句话选择指南

- 想**最大化传播与采用** → MIT
- 想**保护衍生作品同样开放** → GPL
- 想要**专利保护 + 企业友好** → Apache-2.0
- 想要**学术/科研风格** → BSD
