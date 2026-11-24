# Nest Starter Template

NestJS 12.6、Swagger 12.1、Zod 4 与 Prisma 7 的 MySQL 后端模板。NestJS 11 版本保存在 `v11` 分支。

## 快速开始

使用 Node.js 24.15 或更新的受支持版本，以及 pnpm 11。项目脚本使用本地 Nest CLI。

```bash
pnpm install
cp .env.example .env
# 编辑 .env 中的 DATABASE_URL，填写本机 MySQL 的连接信息
pnpm db:deploy
pnpm start:dev
```

`DATABASE_URL` 形如 `mysql://USER:PASSWORD@127.0.0.1:3306/nest_starter`。密码中的 URL 保留字符需要百分号编码。`pnpm db:deploy` 应用仓库中已有的迁移。修改 Prisma 数据模型后，用 `pnpm db:migrate --name <name>` 创建开发迁移，再运行 `pnpm prisma:generate` 更新客户端。安装依赖时也会生成客户端，生成目录为 `prisma/generated/`（不提交 Git）。构建产物保留目录结构，应用入口为 `dist/src/main.js`。

默认端口为 `8080`，可以用 `PORT` 覆盖。Swagger UI 位于 `/swagger`，OpenAPI JSON 位于 `/swagger-json`。应用前缀、CORS、URI 版本和日志配置位于 `config/default.yaml`。Winston 文件日志写入 `logs/`。

## 依赖兼容性

使用 ESLint 10、SWC 1.16、config 5 和 dotenv 18。config 5 的 YAML 解析器需要显式安装，项目已添加 `yaml`，继续使用现有 YAML 配置。

TypeScript 保持 6.0 最新兼容版本：7.0 尚未提供 Nest CLI 所需的编译器 API，typescript-eslint 也暂不支持。`@types/node` 跟随 Node.js 24；Prisma CLI、Client 和 MariaDB Adapter 统一使用 7.10.1，暂不采用 8.0 RC。

## 用户 CRUD

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/user` | 创建用户，返回 201 |
| GET | `/api/user?pageSize=20&page=1` | 按 ID 升序分页（page 默认 1，pageSize 默认 20、最大 100），返回 `{ list, total }` |
| GET | `/api/user/:id` | 获取用户 |
| PATCH | `/api/user/:id` | 更新至少一个字段 |
| DELETE | `/api/user/:id` | 删除用户，返回 204 |

创建请求示例为 `{"name":"steve","age":27}`。原有的 `POST /api/user/create` 与 `GET /api/user/all` 仍可使用。读取、更新或删除不存在的用户时返回 404。业务 JSON 响应使用 `{ code, msg, data }`。

## 增加接口

在 `src/user/dto/` 定义 Zod Schema，用 `z.output` 推导校验后的 DTO 类型（请求原始输入用 `z.input`），并通过 `@Body({ schema })`、`@Query({ schema })` 或 `@Param('id', { schema })` 绑定到路由。Nest 的 `StandardSchemaValidationPipe` 将校验和转换后的值传给 Controller。Swagger 从同一个请求 Schema 读取约束，响应装饰器通过 `standardSchema` 读取 Zod 响应 Schema。

业务逻辑位于 `src/user/user.service.ts`，数据库访问使用 `PrismaService`。API 使用 ISO 8601 时间字符串，Prisma 模型单独定义在 `prisma/schema.prisma`。

## 构建和验证

```bash
pnpm lint
pnpm build
pnpm test:e2e
pnpm start:prod
```

端到端测试使用 `DATABASE_URL` 指向的 MySQL 数据库。先应用迁移。测试覆盖 Swagger 文档、请求校验及数据库 CRUD，并清理本次创建的用户记录。
