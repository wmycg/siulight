# Docker 部署

项目使用两个 Compose 文件：

- `compose.yaml`：本地开发，只启动 MySQL。
- `compose.production.yaml`：服务器部署，同时启动应用和 MySQL。

## 构建与导出镜像

在开发机执行：

```bash
docker build -t siulight-app:3.0.0 .
docker pull mysql:8.4
docker save -o siulight-images-3.0.0.tar siulight-app:3.0.0 mysql:8.4
```

将镜像归档、`compose.production.yaml` 和 `docker.env.example` 上传到服务器。服务器无需源代码，也不执行构建。

## 服务器启动

先导入镜像：

```bash
docker load -i siulight-images-3.0.0.tar
```

在部署目录执行：

```bash
cp docker.env.example .env
```

编辑 `.env`：

- `APP_ORIGIN` 改成主网站的 HTTPS 地址，例如 `https://photo.example.com`。需要多个域名时，将它们以英文逗号写入 `APP_ORIGINS`，例如 `https://photo.example.com,https://www.photo.example.com`，不要加结尾斜杠。
- 两个数据库密码都换成长随机密码。当前连接串由 Compose 自动生成，密码建议只使用字母、数字、下划线和短横线。
- `APP_PORT` 是服务器暴露的端口；通常由 Nginx 或 Caddy 反向代理到此端口。
- `MYSQL_PASSWORD` 会进入数据库连接 URL，使用 `openssl rand -hex 24` 生成只含十六进制字符的密码。

启动已导入的镜像：

```bash
docker compose -f compose.production.yaml up -d --wait
```

检查状态和日志：

```bash
docker compose -f compose.production.yaml ps
docker compose -f compose.production.yaml logs -f app
```

全新的 MySQL 数据卷只会执行数据库迁移，不会写入演示数据或创建管理员。已有站点应先导入原数据库；全新站点可先注册自己的账号，再在 MySQL 中将该账号的 `role` 改为 `superadmin`。

更新时重新构建并导入新应用镜像，再执行启动命令。数据库和上传图片分别保存在 Docker 命名卷 `mysql-data`、`uploads` 中，重建应用容器不会删除它们。

停止服务但保留数据：

```bash
docker compose -f compose.production.yaml down
```

不要在生产服务器执行 `down -v`，它会删除数据库和上传文件。
