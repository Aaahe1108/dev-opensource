---
title: /opt/deploy/nginx.conf · 本站 Nginx 配置
ai_summary: "本站 Nginx 生产配置：try_files 支持 cleanUrls，静态资源长缓存与安全头。"
---

# 本站 Nginx 配置

> 本站为纯静态站点（VitePress 构建产物），以下为完整生产配置。

## nginx.conf

```nginx
# /etc/nginx/sites-available/dev-opensource
server {
    listen 80;
    listen [::]:80;
    server_name opensource.example.com;

    # VitePress 构建输出目录
    root /var/www/dev-opensource;
    index index.html;

    # cleanUrls：/home/torvalds -> /home/torvalds.html
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # 静态资源长缓存（VitePress 的 assets/ 带内容哈希）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # 安全头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    access_log /var/log/nginx/dev-opensource.access.log;
    error_log  /var/log/nginx/dev-opensource.error.log;
}
```

## 说明

- `try_files $uri $uri.html $uri/`：支持 VitePress 的 cleanUrls（无后缀 URL）。
- 部署流程：`pnpm build` → 把 `.vitepress/dist/` 内容同步到 `/var/www/dev-opensource/`。
- HTTPS 配置见 [`/opt/deploy/certbot`](/opt/deploy/certbot)。
- 服务管理见 [`/opt/deploy/systemd`](/opt/deploy/systemd)。
- CI/CD 见 [`/opt/deploy/github-actions`](/opt/deploy/github-actions)。
