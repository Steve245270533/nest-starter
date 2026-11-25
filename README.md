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

默认端口为 `8080`，可以用 `PORT` 覆盖。Knife4j UI 位于 `/doc.html`，Swagger UI 位于 `/swagger`，两者共用 `/swagger-json`。命名业务模型通过 Zod 与 Swagger 的原生转换生成 `components.schemas` 和 `$ref`，以兼容 Knife4j 的请求体与嵌套响应解析；运行时的 Zod 校验不受影响。文档入口不跟随应用前缀。应用前缀、CORS、URI 版本和日志配置位于 `config/default.yaml`。Winston 文件日志写入 `logs/`。

需要在文档中引用的对象 Schema（包括嵌套业务对象）使用 `.meta({ id: 'User', title: 'User' })`：`id` 指定唯一模型名称，`title` 指定展示标题。Zod 将命名模型提取为 definitions，Swagger 原生转换为 `components.schemas` 和 `$ref`，无需额外后处理。不同 Schema 使用不同的 `id`；请求与响应结构不同时分别命名。查询参数和路径参数沿用现有声明方式，无需增加模型 `id`。

## 依赖兼容性

使用 Oxlint、Oxfmt、SWC 1.16、config 5 和 dotenv 18。config 5 的 YAML 解析器需要显式安装，项目已添加 `yaml`，继续使用现有 YAML 配置。

TypeScript 保持 6.0 最新兼容版本：7.0 尚未提供 Nest CLI 所需的编译器 API。`@types/node` 跟随 Node.js 24；Prisma CLI、Client 和 MariaDB Adapter 统一使用 7.10.1，暂不采用 8.0 RC。

## 构建和验证

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm build
pnpm test:e2e
pnpm start:prod
```

`pnpm lint` 同时执行 Oxlint 和 Oxfmt 格式检查，`pnpm lint:fix` 自动修复并格式化。检查范围为 `src/`、`test/` 和 `prisma.config.ts`，排除生成客户端与构建产物。Oxlint 通过 `oxlint-tsgolint` 保留类型感知规则，以及原有浮动 Promise、非安全参数的 warning 级别；TypeScript 扩展规则中的数组构造、未使用表达式和变量检查改由 Oxlint 的同名原生规则处理。旧的 `no-octal` 没有独立规则，ESM 严格模式下的旧式八进制字面量由解析器拒绝。

Oxfmt 默认使用双引号，保留尾逗号和 80 列换行宽度；原来的 `endOfLine: auto` 不受支持，统一使用 LF。内置 `sortImports` 将 `import type` 独立放在所有普通导入之后，与普通导入之间空一行；普通导入按 Node.js 内置模块、外部依赖、内部模块和相对路径分组排序，组内按名称升序排列，并保留副作用导入的执行顺序。Oxlint 的 `sort-imports` 负责同一声明中命名导入的排序，声明顺序交由 Oxfmt 处理。VS Code 推荐安装 Oxc 扩展，保存时自动格式化并修复。

端到端测试使用 `DATABASE_URL` 指向的 MySQL 数据库。先应用迁移。测试覆盖 Swagger 文档、请求校验及数据库 CRUD，并清理本次创建的用户记录。
