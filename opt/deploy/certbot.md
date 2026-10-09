---
title: /opt/deploy/certbot.md · Let's Encrypt HTTPS 配置
ai_summary: "Let's Encrypt HTTPS 配置：certbot 一键签发与自动续期。"
---

# Let's Encrypt HTTPS 配置

> 用 certbot 为本站配置免费 HTTPS 与自动续期。

## 安装

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

## 签发证书（nginx 插件自动改配置）

```bash
sudo certbot --nginx -d opensource.example.com
```

certbot 会自动：

1. 通过 HTTP-01 挑战验证域名所有权
2. 签发证书到 `/etc/letsencrypt/live/opensource.example.com/`
3. 修改 nginx 配置：监听 443、配置 SSL、HTTP 跳转 HTTPS

## 自动续期

```bash
# certbot 安装时已注册 systemd 定时器
sudo systemctl status certbot.timer

# 手动测试续期（推荐每月跑一次）
sudo certbot renew --dry-run
```

## nginx SSL 配置要点（certbot 自动生成，类似如下）

```nginx
listen 443 ssl;
server_name opensource.example.com;
ssl_certificate /etc/letsencrypt/live/opensource.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/opensource.example.com/privkey.pem;
include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

## 常见问题

- **80 端口被占用**：先停 nginx 或用 `--webroot` 模式。
- **证书不生效**：`sudo nginx -t && sudo systemctl reload nginx`。
- **域名未解析**：确保 A/AAAA 记录指向服务器。
