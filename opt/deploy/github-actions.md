---
title: /opt/deploy/github-actions.yml · CI/CD 自动部署
ai_summary: "GitHub Actions 自动部署：push 到 main 后构建并 scp 到服务器。"
---

# GitHub Actions 自动部署

> push 到 `main` 后自动构建并 scp 到服务器。

## 工作流

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Deploy via SCP
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_KEY }}
          port: ${{ secrets.SERVER_PORT || 22 }}
          source: ".vitepress/dist/*"
          target: "/var/www/dev-opensource"
          strip_components: 1

      - name: Reload Nginx
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_KEY }}
          script: sudo nginx -t && sudo systemctl reload nginx
```

## 所需 Secrets

在仓库 Settings → Secrets and variables → Actions 中配置：

| Secret | 说明 |
| --- | --- |
| `SERVER_HOST` | 服务器 IP 或域名 |
| `SERVER_USER` | SSH 用户 |
| `SERVER_KEY` | SSH 私钥 |
| `SERVER_PORT` | SSH 端口（默认 22） |

## 说明

- `pnpm install --frozen-lockfile` 按 lockfile 精确安装，保证可复现。
- 构建产物 `.vitepress/dist/` 整目录推送到服务器。
- 部署后热重载 Nginx，无需重启。
