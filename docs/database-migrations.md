# 数据库模型、迁移与部署

项目使用 pnpm，Prisma CLI 和 Prisma Client 固定为 7.10.0；业务查询使用 Prisma Client，复杂报表保留参数化 `$queryRaw`。

- `prisma/schema.prisma`：模型、字段、关系、索引与数据库类型。
- `prisma/migrations/*/migration.sql`：按版本提交的实际数据库变更。
- `prisma.config.ts`：读取 `.env` 的连接信息。
- `_prisma_migrations`：数据库内的迁移执行历史。
- 业务服务通过 `server/db/client.ts` 创建 Prisma Client；报名、登录、后台、留言墙等写操作使用 Prisma 模型 API 和事务。
- `server/db/client.ts`：Prisma Client、连接生命周期、日期转换，以及复杂报表查询的 `$queryRaw` 兼容入口。

原 `schema_migrations`、`server/db/migrate.ts` 和 `server/db/schema.sql` 已移除。经用户明确同意，本地开发库已清空并用 Prisma 初始迁移重建，随后重新填充演示数据。

## 开发时改表

1. 修改 `prisma/schema.prisma`。
2. 生成并应用迁移：`pnpm db:dev --name add_user_avatar`。
3. 类型检查：`pnpm typecheck`。
4. 检查生成的 SQL，验证业务，再将模型和迁移一起提交 Git。

示例：在 `User` 模型增加 `avatar String @default("") @db.VarChar(255)`。迁移会为已有记录设置空字符串，不需要删除用户表。

复杂改表可先生成 SQL：

```bash
pnpm db:dev --create-only --name change_user_profile
# 检查和编辑新 migration.sql，包括必要的数据搬迁。
pnpm db:dev
pnpm typecheck
```

本地开发的影子数据库由 `pnpm run setup` 创建。`.env` 的 `SHADOW_DATABASE_URL` 指向独立的 `siulight_shadow`，不应指向业务库；更改 `MYSQL_DATABASE` 时同步调整这两个 URL。已存在 Docker volume 时可执行 `pnpm db:shadow` 补建影子库。生产环境不需要设置此变量。

## 部署

准备 Node.js 22+（最低 22.12）、pnpm 11.22.0、MySQL 和 `.env`，先安装锁定依赖：

```bash
pnpm install --frozen-lockfile
pnpm run deploy
```

`pnpm run deploy` 依次执行类型检查、前后端构建、`prisma migrate deploy`、生产服务启动。构建或迁移失败都会中止链路。更新已构建的产物时，`pnpm start` 同样先迁移再启动。命令以前台方式运行服务；线上可交给服务管理器运行。

发布物保留 `dist/`、`prisma/`、`prisma.config.ts`、`package.json`、`pnpm-lock.yaml`、`.env` 与生产依赖。Prisma CLI 属于生产依赖，因此只安装生产依赖的运行环境也可迁移。`pnpm run deploy` 的构建阶段需要开发依赖，已构建环境用 `pnpm start`。

自动应用的是已提交的迁移，不会根据 `schema.prisma` 直接重建生产表。不要用 `db push`、`migrate dev` 或 `migrate reset` 替代生产迁移。部署不执行演示数据种子，也不启动本地测试 Docker。

## 状态与失败处理

```bash
pnpm db:status
pnpm db:migrate
```

Prisma 会记录执行状态并使用迁移锁。迁移失败时修复原因，检查哪些 SQL 已生效，再按实际状态恢复。MySQL 的 DDL 可能已经提交，不能假设整次失败自动回滚。

- 若已手动撤销失败迁移的所有变更：`pnpm exec prisma migrate resolve --rolled-back <迁移目录名>`，然后重新部署。
- 若已手动完整执行其全部变更并核对结构：`pnpm exec prisma migrate resolve --applied <迁移目录名>`。

不要仅为跳过报错而修改执行状态。已执行成功的迁移保持不变，通过新增迁移纠正后续结构。

开发库确需清空时，`pnpm db:reset` 会显示确认提示；重建后可按需执行 `pnpm db:seed`。该操作会删除数据，不属于正常部署流程。

## 验证

`pnpm test:migrations` 在本地 Docker 中创建独立临时数据库，验证首次建表、增量字段保留数据、重复部署、失败迁移与真实 `pnpm start` 的失败阻断，完成后删除临时库。不会清空应用数据库。

参考：[Prisma 生产迁移命令](https://www.prisma.io/docs/cli/v7/migrate/deploy)、[Prisma Migrate 工作流](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)。
