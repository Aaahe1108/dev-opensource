---
title: /opt/deploy/systemd.md · systemd 服务管理
ai_summary: "systemd 服务管理：管理 Nginx、自定义静态服务与每日备份定时器。"
---

# systemd 服务管理

> Nginx 由 systemd 管理；若需自定义静态服务器，也可写一个单元文件。

## 管理 Nginx

```bash
sudo systemctl enable --now nginx     # 开机自启并立即启动
sudo systemctl status nginx           # 查看状态
sudo systemctl reload nginx           # 配置修改后热重载
sudo systemctl restart nginx          # 重启
journalctl -u nginx -f                # 实时查看日志
```

## 自定义静态服务器（示例）

如果不想用 Nginx，可以用一个简单的 Node/Python 静态服务：

```ini
# /etc/systemd/system/dev-opensource.service
[Unit]
Description=dev-opensource static file server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dev-opensource
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now dev-opensource
```

> 生产环境建议仍使用 Nginx：性能、缓存、gzip、反向代理与安全头更可控。

## 定时器示例：每日备份

```ini
# /etc/systemd/system/dev-opensource-backup.service
[Unit]
Description=Backup dev-opensource
[Service]
Type=oneshot
ExecStart=/usr/bin/tar -czf /var/backups/dev-opensource-$(date +%%F).tar.gz /var/www/dev-opensource
```

```ini
# /etc/systemd/system/dev-opensource-backup.timer
[Unit]
Description=Daily backup of dev-opensource
[Timer]
OnCalendar=daily
Persistent=true
[Install]
WantedBy=timers.target
```
