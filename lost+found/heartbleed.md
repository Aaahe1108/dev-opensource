---
title: /lost+found/heartbleed · Heartbleed 漏洞
ai_summary: "Heartbleed 漏洞：关键基础设施需要持续资源，直接推动 CII 成立。"
---

# Heartbleed：基础设施的警钟

> 2014 年 4 月 7 日，OpenSSL 爆出 CVE-2014-0160。

## 事件

- **漏洞**：TLS 心跳扩展的缓冲区越界读取，服务器内存中的私钥、用户数据可能泄露。
- **影响**：全球约 **三分之二** 的网站受影响。
- **讽刺的是**：OpenSSL 是互联网最重要的安全基础设施之一，当时却只有 **少数全职维护者**，年预算不足 2000 美元。

## 后续

- Linux 基金会成立 **Core Infrastructure Initiative（CII）**，为关键开源基础设施提供资金与审计支持。
- 行业开始重视「开源可持续性」：资金、审计、专职维护者。
- 催生了 Let's Encrypt 等免费证书机构的普及。

## 教训

> 关键基础设施不能只靠志愿者热情运转。开源需要**持续的资源**。

<div class="fileview">$ grep "CVE" /lost+found/heartbleed
Heartbleed：CVE-2014-0160。</div>
