# Nest Starter Template

这是一个基于 [NestJS](https://nestjs.com/) 的后端项目启动模板，目标是提供一个开箱即用、偏向生产实践的基础工程骨架。

该模板已集成：SWC 编译、Winston 日志（含日志轮转）、node-config 多环境配置（结合 Zod 校验）、Swagger + Knife4j 文档，以及常用的全局中间件能力（前缀、版本、CORS、验证管道、异常过滤器等）。

## ✨ 主要特性

- **🚀 SWC 编译（Nest Builder）**
  - `nest-cli.json` 已设置 `compilerOptions.builder = "swc"`，构建/开发均走 SWC（配合 `.swcrc`）。
  - `compilerOptions.typeCheck = true`，构建时保留 TypeScript 类型检查。

- **📝 日志系统（nest-winston + winston）**
  - 控制台：Nest Like 格式输出，带时间戳与应用名（来源于 `app.name` 配置）。
  - 文件：按天轮转写入 `logs/` 目录，默认保留 14 天。
  - 开关：通过 `app.logger` 控制是否写文件日志（控制台日志始终输出）。

- **⚙️ 配置管理（@nestjs/config + node-config + zod）**
  - 配置文件位于 `config/`，支持 `default.yaml` + `development.yaml` / `production.yaml` 合并。
  - 通过 Zod 对 `app`、`db` 配置做运行时校验，配置非法会在启动时直接抛错。
  - `ConfigModule` 已 `isGlobal: true` 全局注入，无需重复导入。

- **📚 接口文档（Swagger + Knife4j）**
  - Swagger UI：`/swagger`
  - Swagger JSON：`/swagger-json`
  - 已集成 `nestjs-knife4j-plus`，默认使用 Swagger JSON 作为数据源。

- **🌍 全局 Web 行为（main.ts）**
  - 全局异常过滤器：`HttpExceptionsFilter` 统一 `HttpException` 的响应结构。
  - 跨域：根据 `app.cors` 配置决定是否启用。
  - 全局前缀：`app.prefix`（默认 `/api`）。
  - URI 版本：`app.version` 可选（启用 URI Versioning）。
  - 全局验证管道：`ValidationPipe({ transform: true, whitelist: true })`。

## 📦 目录结构

```
src/
├── commons/
│   ├── config/
│   │   ├── config.module.ts
│   │   └── configuration.ts
│   ├── dto/
│   │   └── index.ts
│   ├── filters/
│   │   ├── all-exception/
│   │   │   └── all-exception.filter.ts
│   │   └── http-exception/
│   │       └── http-exception.filter.ts
│   ├── logger/
│   │   └── logger.module.ts
│   └── swagger/
│       ├── api-ok-response-data.ts
│       └── setupSwagger.ts
├── user/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── user.dto.ts
│   ├── user.controller.ts
│   └── user.module.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
config/
├── default.yaml
├── development.yaml
└── production.yaml
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
npm install
# 或者
pnpm install
# 或者
yarn install
```

### 2. 运行项目

```bash
npm run start:dev
```

默认监听端口为 `8080`，也可通过环境变量 `PORT` 覆盖：

```bash
PORT=3000 npm run start:dev
```

### 3. 示例接口

在默认配置（`app.prefix: /api`）下：

- 获取用户列表：`GET http://localhost:8080/api/user/all`
- 创建用户：`POST http://localhost:8080/api/user/create`

示例请求体：

```json
{ "name": "steve", "age": 27 }
```

### 4. Swagger 文档

启动后访问：

- Swagger UI：`http://localhost:8080/swagger`
- Swagger JSON：`http://localhost:8080/swagger-json`

## ⚙️ 配置说明

配置目录为根目录 `config/`，由 `node-config` 负责加载与合并。默认 `start:dev` / `start:prod` 已分别设置：

- `start:dev`：`NODE_ENV=development`
- `start:prod`：`NODE_ENV=production`

示例配置（与当前模板保持一致）：

`config/default.yaml`

```yaml
app:
  name: nest-starter
  logger: true
  cors: true
  prefix: /api
  # version: ["1"]
db:
  username: root
  password: password
```

`config/development.yaml`

```yaml
db:
  port: 3306
  host: localhost
```

说明：

- `app.version` 为可选数组，启用后会开启 URI 版本能力（例如 `["1"]`）。如需对某个控制器/路由声明版本，可使用 `@Version('1')`。
- `configuration.ts` 使用 Zod 校验配置字段，缺少必填字段会在启动时抛错。

在代码中使用配置（支持类型推断）：

```typescript
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/commons/config/configuration';

constructor(private readonly configService: ConfigService<Configuration>) {}

const appConfig = this.configService.get('app', { infer: true })!;
```

## 🧾 统一响应与 Swagger 装饰器

模板内置了常用响应 DTO：

- `ResponseDTO<T>`
- `PaginationResponseDTO<T>`

并提供了 Swagger 装饰器简化响应体定义：

- `ApiOkResponseData(Model)`：返回单对象
- `ApiOkResponseDataArray(Model)`：返回数组
- `ApiOkResponsePaginationData(Model)`：返回分页结构

参考示例：[user.controller.ts](src/user/user.controller.ts)

## 🧩 日志使用

日志模块已在 [app.module.ts](src/app.module.ts) 全局注册，并在 [main.ts](src/main.ts) 中替换 Nest 默认 Logger：

```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('This is a log message');
    this.logger.error('This is an error message');
  }
}
```

若 `app.logger: true`，文件日志默认输出到项目根目录 `logs/`。
