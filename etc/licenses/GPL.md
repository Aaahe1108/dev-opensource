---
title: /etc/licenses/GPL · GNU 通用公共许可证
ai_summary: "GPL 以 copyleft 机制保证自由传递：衍生作品必须同样开源，Linux 内核采用 GPLv2。"
---

# GNU General Public License (GPL)

> 「自由软件关乎自由，而非价格。」—— Richard Stallman

## 核心机制：Copyleft（传染性）

GPL 的灵魂是 **copyleft**：任何基于 GPL 代码的衍生作品，**必须同样以 GPL 发布**。这保证了自由不会在某次分发中被剥夺。

## 用户四大自由

1. 为任何目的**运行**程序
2. **研究**源码并按需修改
3. **重新分发**副本
4. **发布修改版本**

## 版本演进

| 版本 | 年份 | 要点 |
| --- | --- | --- |
| GPLv1 | 1989 | 首创 copyleft |
| GPLv2 | 1991 | Linux 内核采用的版本 |
| GPLv3 | 2007 | 反 Tivoization、专利条款、兼容 Apache-2.0 |

## 代表项目

- Linux 内核（GPLv2）
- GCC、GNU 工具链
- WordPress、MySQL（B 端双许可）

## 常见误区

- ❌ 「GPL 代码不能商用」→ ✅ 可以商用，但分发时需开源衍生代码。
- ❌ 「用了 GPL 库，整个项目都要开源」→ 取决于链接方式与许可证兼容性，需具体分析。

<div class="fileview">$ cat /etc/licenses/GPL | grep "传染"
Copyleft：自由必须被传递下去。</div>
