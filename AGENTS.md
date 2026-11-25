# AGENTS.md

## 沟通与推进

- 结论前置，主动简洁，使用用户和代码库中的真实术语；交付时说明改动、验证结果及必要限制。
- 偏向行动，从上下文推断意图，推进到任务完成并验证可用；可逆、只读及已授权操作直接执行。
- 先读后改，基于相关文件确认实现；用户指定文件或询问代码原理时，先读取再回答。
- 小改直接做；涉及多个文件或架构的大改，先简述范围和方案再推进。缺少关键事实时才提问，其余合理假设说明后继续。
- 完成当前任务后停止，不扩大范围，不修改无关代码，不因假设性风险增加警告或额外确认。

## 项目约定

- 技术栈：NestJS 12、TypeScript ESM、Zod 4、Prisma 7 / MySQL、Swagger / Knife4j、Winston；使用 pnpm，遵循现有依赖和配置。
- 按业务组织 `src/<业务>/`，参照 `src/user/`；公共能力放在 `src/commons/`，数据库接入放在 `src/prisma/`。
- Module 声明依赖与导出，Controller 处理路由、参数和响应，Service 承载业务及数据库操作；使用构造函数依赖注入，不手动实例化服务。
- 本地模块导入保留 `.js` 后缀，纯类型使用 `import type`；命名和格式遵循现有代码、Oxlint 与 Oxfmt。

## 代码约束

- 优先复用现有类、函数、数据结构和 API。按当前需求实现最简单方案，不提前增加依赖、抽象、兼容层或扩展点。
- 外部数据在入口用 schema 校验和转换一次，内部依赖类型与业务约定；新增外部边界仍需校验，真实业务规则在 Service 中处理。
- 禁止用重复校验、多余空值检查、默认值或大量 `?.`、`??`、`||` 掩盖类型和业务问题；保留有明确业务含义的可选值处理。
- 仅在需要恢复、清理或转换已知异常时使用 `try/catch`，不吞异常；其余异常正常传播。
- 禁止用 `any`、随意类型断言或非空断言消除报错，优先修正类型并利用推导与收窄。
- 保持同步逻辑同步，不添加无意义的 `async`、`await` 或 Promise 包装。
- 优先 `const` 和早返回，减少嵌套、`else`、中间变量及重复状态；不以单行堆叠或晦涩缩写牺牲可读性。
- 不为单次使用的逻辑抽取 Helper、Utility 或通用层，除非能明确降低复杂度、提升可读性。

## 接口与数据库

- 请求 DTO 使用原生 Zod schema，类型从 `z.output` 推导；通过 `@Body`、`@Query`、`@Param` 的 `schema` 选项接入全局 `StandardSchemaValidationPipe`，不另建重复校验体系。
- 使用现有 `Result.ok`、`Result.page` 和响应 schema，保持 `{ code, msg, data }` 契约；HTTP 状态与接口语义一致，204 不返回响应体。
- 业务错误使用 NestJS 异常，由现有异常过滤器统一处理；仅按需将明确的 Prisma 错误转换为业务异常，未知错误继续抛出。
- 接口变更同步维护 Swagger 的 `standardSchema` 声明与必要说明，复用 `configureApp` 中的前缀、版本及文档配置。
- 通过注入的 `PrismaService` 访问数据库；需要原子性或一致性时使用事务，不预先引入 Repository 层。
- 数据模型修改同步维护 `prisma/schema.prisma` 和迁移；不手改或提交 `prisma/generated/`，不改写已应用的历史迁移。
- 配置沿用 `config/*.yaml`、环境变量和 `ConfigService`；日志沿用 Nest Logger / Winston，不提交密钥或数据库凭据。

## 验证与交付

- 代码变更运行相关检查：`pnpm lint`、`pnpm build`；按影响补充或运行测试，纯文档修改检查内容与差异即可。
- 测试使用 `node:test`、`node:assert/strict`、`@nestjs/testing` 和 Supertest，沿用 `test/` 的模式，不另引入测试框架。
- `pnpm test` 运行全部测试，`pnpm test:e2e` 运行端到端测试；涉及数据库时需配置 `DATABASE_URL` 并应用迁移，清理仅限本次测试创建的数据。
- 模型变更按需执行 `pnpm db:migrate --name <name>` 和 `pnpm prisma:generate`；应用已有迁移使用 `pnpm db:deploy`。
- 测试真实业务行为及改动风险，尽量少用 Mock；不为凑覆盖率增加测试、注释或文档。未运行或失败的检查如实说明。
