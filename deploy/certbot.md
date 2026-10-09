# 用 Let's Encrypt 配置 HTTPS（certbot）

## 1. 安装

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

## 2. 签发证书（nginx 插件自动修改配置）

```bash
sudo certbot --nginx -d opensource.example.com
```

certbot 会自动：

1. 通过 HTTP-01 挑战验证域名所有权；
2. 签发证书到 `/etc/letsencrypt/live/opensource.example.com/`；
3. 修改 nginx 配置：监听 443、配置 SSL、80 端口跳转 HTTPS。

## 3. 自动续期

```bash
# certbot 安装时已注册 systemd 定时器
sudo systemctl status certbot.timer

# 手动测试续期（建议每月检查一次）
sudo certbot renew --dry-run
```

## 4. certbot 生成的 SSL 配置（示意）

```nginx
listen 443 ssl;
server_name opensource.example.com;
ssl_certificate /etc/letsencrypt/live/opensource.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/opensource.example.com/privkey.pem;
include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

## 5. 常见问题

- **80 端口被占用**：先 `sudo systemctl stop nginx` 或改用 `--webroot` 模式。
- **证书不生效**：`sudo nginx -t && sudo systemctl reload nginx`。
- **域名未解析**：确认 A/AAAA 记录已指向服务器公网 IP。
