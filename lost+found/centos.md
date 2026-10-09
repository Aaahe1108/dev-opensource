---
title: /lost+found/centos · CentOS 事件反思
ai_summary: "CentOS 事件：公司主导的开源项目治理风险，Rocky Linux 与 AlmaLinux 应运而生。"
---

# CentOS 事件与开源可持续性反思

> 2020 年 12 月 8 日，CentOS 宣布「转向」，社区至今仍在消化这一课。

## 事件回顾

- **2020-12-08**：CentOS 官方宣布 CentOS Linux 8 将于 2021 年底停止维护，项目重心转向 **CentOS Stream**（RHEL 的上游滚动预览）。
- **社区反应**：大量生产环境负载措手不及——原本「与 RHEL 二进制兼容、稳定到 2029」的承诺被缩短了数年。
- **衍生替代**：Rocky Linux（Gregory Kurtzer 原 CentOS 创始人发起）、AlmaLinux（CloudLinux 发起）迅速兴起，均定位为 RHEL 的社区克隆。

## 深层反思

1. **公司主导的开源项目**：商标与治理由公司控制时，社区用户实质上是「客户」而非「主人」。
2. **许可证 ≠ 治理**：CentOS 是 GPL 项目，但治理结构决定了它无法阻止这次转向。
3. **依赖风险**：生产环境应关注项目的**治理结构、资金来源、继任计划**，而不只是技术特性。

## 教训清单

- ✅ 关注「上游 - 下游」关系（RHEL → CentOS Stream → Rocky/Alma）
- ✅ 重要负载选择有多个替代品的发行版
- ✅ 参与社区治理（投票、贡献、赞助）

<div class="fileview">$ cat /lost+found/centos | grep "教训"
依赖单一厂商的发行版有风险；关注治理结构。</div>
