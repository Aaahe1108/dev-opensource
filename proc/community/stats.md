---
title: /proc/community/stats.json · 社区统计
ai_summary: "社区统计：42 个项目、1280 名贡献者、MIT 是使用最多的许可证。"
---

# 社区统计 JSON

> 「虚拟文件系统」中的 `/proc/community/stats.json` 记录了开源社区的脉搏。

## stats.json

```json
{
  "projects_tracked": 42,
  "contributors": 1280,
  "commits_last_30d": 3642,
  "top_language": "JavaScript",
  "license_most_used": "MIT",
  "license_distribution": {
    "MIT": 0.41,
    "Apache-2.0": 0.22,
    "GPL": 0.18,
    "BSD": 0.09,
    "Other": 0.10
  }
}
```

## 解读

- **MIT 占比最高**：宽松许可证仍是主流选择（见 `/etc/licenses`）。
- **提交活跃**：30 天 3600+ 次提交，说明社区处于健康迭代中。
- **贡献者 1280 人**：巴士因子健康，没有单点风险。

## 在终端中查看

```bash
cat /proc/community/stats.json
```

<div class="fileview">$ jq '.license_most_used' /proc/community/stats.json
"MIT"</div>
