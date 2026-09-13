# 微光漫摄 · Siulight

全新 TypeScript 全栈社团官网。React + Vite、Express、shadcn/ui、MySQL 8.4，使用 pnpm。暖白纸面与原创夏日动画插画，兼顾桌面和手机；公开纪念册记录社团、个人与共同署名的里程碑。

## 本地启动

需要 Node.js 22+、pnpm 11.22.0、已启动的 Docker Desktop。

```bash
cp .env.example .env
pnpm install
pnpm setup
pnpm dev
```

打开 **[http://localhost:3000](http://localhost:3000)**。这是浏览器网站；`pnpm dev` 同时启动前端和 TypeScript API，无需另开后端服务。

已有依赖和数据库时，最短启动命令：

```bash
pnpm dev
```

`pnpm setup` 依次执行 Docker Compose 启动与健康检查、数据库结构迁移、演示数据填充。重复执行不清空已有内容、不重置密码。数据库以命名 volume 持久化，`pnpm db:down` 不删除数据。

## 演示账号

仅用于项目目录下的本地测试数据库，密码来自 `.env`。修改 `.env` 的种子密码不会覆盖已存在的账号，可登录后修改密码。

| 角色             | 邮箱                    | .env.example 初始密码   |
| ---------------- | ----------------------- | ----------------------- |
| 超级管理员       | `admin@siulight.local`  | `ChangeMe-Admin-2026!`  |
| 普通成员（小夏） | `member@siulight.local` | `ChangeMe-Member-2026!` |

数据库种子包含 6 个演示账号、4 条演示活动和 6 条演示纪念。**它们用于展示与测试，不代表真实社团活动、人数或历史。** 正式上线前需替换内容并移除演示账号。原站的社团介绍、五个部门及 QQ 招新海报已保留。

## 数据库

根目录 `compose.yaml` 运行 MySQL 8.4，默认只绑定本机 `127.0.0.1:3308`，字符集 utf8mb4。

| 配置   | 本地默认值                                              |
| ------ | ------------------------------------------------------- |
| 数据库 | `siulight`                                              |
| 用户   | `siulight`                                              |
| 密码   | `siulight_dev`                                          |
| 连接串 | `mysql://siulight:siulight_dev@127.0.0.1:3308/siulight` |

如 3308 被占用，在 `.env` 同时修改 `MYSQL_PORT` 和 `DATABASE_URL` 中的端口。实际健康检查接口：[http://localhost:3000/api/health](http://localhost:3000/api/health)，只有 MySQL 查询成功后才返回 `database: mysql`。

## 功能

- 首页、社团介绍、五部门介绍、QQ 社群入口。
- 活动搜索、即将相遇/往期回顾、详情、登录报名和取消报名、并发名额控制。
- 入社表单真实写库、重复学号检查、私密信息保护、可复制回执。
- 注册、登录、退出、修改密码，数据库会话和三个权限等级。
- 公开里程碑：图文或纯文字、个人/社团分类、最多 12 位共同伙伴、点赞、关键词/年份筛选与分页。
- 每位成员的公开纪念册；自己创作和共同署名的纪念均可见。作者可编辑/删除，管理员可移除记录。
- 后台：活动增删改、入社申请搜索和状态处理、管理员账号维护、操作日志。
- 手机折叠导航、单列纪念时间线、图片裁切、滚动表单与弹窗，减少动态效果偏好支持。

## 常用命令

```bash
pnpm dev                 # 开发，http://localhost:3000
pnpm typecheck           # TypeScript 严格检查
pnpm test                # 领域校验与密码测试
pnpm test:integration    # 真实 MySQL 的 API 流程测试
pnpm build               # 生产前后端构建
pnpm start               # 运行生产构建（正式环境需要 HTTPS 反向代理）
pnpm format              # 格式化源码
pnpm format:check        # 检查格式
pnpm db:up               # 启动 MySQL，等待健康检查
pnpm db:migrate          # 应用数据库结构版本
pnpm db:seed             # 写入幂等演示数据，仅用于开发
pnpm db:down             # 停止数据库，保留数据
```

集成测试连接 `.env` 中的 MySQL，创建带随机标识的专属测试记录，测试后清理自身记录；不重置或清空已有数据库。测试不依赖正在运行的前端，自动使用随机本地端口启动 API。

## 目录结构与设计

- `src/components/ui`：shadcn/ui 基础组件源码，配置为 `components.json`。
- `src/features`：按认证、活动、纪念册、后台划分的业务组件。
- `src/pages`：页面内容编排与路由。
- `src/styles`：基础、布局、首页、页面、表单、后台及响应式样式。
- `server/routes` / `services` / `middleware` / `db`：HTTP 边界、业务事务、权限、数据库。
- `shared`：领域类型、Zod 校验与社团内容。
- `public/images`：三张原创 WebP 插画及保留的旧站素材。
- `storage/uploads`：用户上传图片，需持久化与备份，不进入 Git。
- `tests`：规则测试和 MySQL 集成测试。

更多内容见 [架构与功能映射](docs/architecture.md)、[视觉方向与插画提示词](docs/visual-direction.md)、[验证记录](docs/verification.md)。

## 部署边界

构建输出在 `dist/client` 和 `dist/server.js`。保留 `.env` 配置、MySQL、`storage/uploads`，通过 Node 启动。`NODE_ENV=production` 启用 Secure Cookie 和 CSP，需在 HTTPS 反向代理后使用，并将 `APP_ORIGIN` 配置成真实域名。当前邮件用于登录标识，尚未接入邮箱验证或邮件找回密码；共同署名前由发布者征得伙伴同意，未实现邀请审批。完整部署考虑见架构文档。
