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

默认端口为 `8080`，可以用 `PORT` 覆盖。Knife4j UI 位于 `/doc.html`，Swagger UI 位于 `/swagger`，两者共用 `/swagger-json`。文档生成时会将 Zod 生成的内联 JSON 对象提取为 `components.schemas` 和 `$ref`，以兼容 Knife4j 的请求体与嵌套响应解析；运行时的 Zod 校验不受影响。文档入口不跟随应用前缀。应用前缀、CORS、URI 版本和日志配置位于 `config/default.yaml`。Winston 文件日志写入 `logs/`。

Schema 可通过 Zod 的 `.meta({ title: 'User' })` 指定文档模型名称；`normalizeSchemas` 优先使用该名称，并复用同名且结构一致的模型。未指定名称时，仍按接口和字段路径生成名称；同名但结构不同的模型会添加数字后缀，避免覆盖。

## 依赖兼容性

使用 ESLint 10、SWC 1.16、config 5 和 dotenv 18。config 5 的 YAML 解析器需要显式安装，项目已添加 `yaml`，继续使用现有 YAML 配置。

TypeScript 保持 6.0 最新兼容版本：7.0 尚未提供 Nest CLI 所需的编译器 API，typescript-eslint 也暂不支持。`@types/node` 跟随 Node.js 24；Prisma CLI、Client 和 MariaDB Adapter 统一使用 7.10.1，暂不采用 8.0 RC。

## 构建和验证

```bash
pnpm lint
pnpm build
pnpm test:e2e
pnpm start:prod
```

端到端测试使用 `DATABASE_URL` 指向的 MySQL 数据库。先应用迁移。测试覆盖 Swagger 文档、请求校验及数据库 CRUD，并清理本次创建的用户记录。
