# Nest Starter Template

这是一个基于 [NestJS](https://nestjs.com/) 的后端项目启动模板，旨在提供一个开箱即用的开发环境。

本模板在 NestJS 官方基础之上，集成了生产环境常用的**日志系统**、**配置管理**以及**高性能编译工具 SWC**，帮助开发者快速搭建健壮的后端服务。

## ✨ 主要特性

- **🚀 高性能编译 (SWC)**
  - 集成 `@swc/core` 和 `@swc/cli`，使用 SWC 替代默认的 TypeScript 编译器。
  - 在开发模式下 (`npm run start:dev`) 启用 SWC 编译 (`-b swc`)，显著提升编译速度和热更新效率。

- **📝 增强的日志系统 (Winston)**
  - 集成 `nest-winston` 和 `winston`。
  - **多渠道输出**：同时支持控制台高亮输出和文件日志。
  - **日志轮转**：集成 `winston-daily-rotate-file`，自动按日期分割日志文件，支持自动清理旧日志（默认保留 14 天）。
  - **上下文感知**：日志自动携带应用名称（从配置中获取）和时间戳。

- **⚙️ 强大的配置管理 (Config)**
  - 结合 `@nestjs/config` 和 `node-config`。
  - **类型安全**：通过 TypeScript 接口定义配置结构，提供完善的类型提示。
  - **多环境支持**：利用 `node-config` 的机制，轻松管理 `default`, `development`, `production` 等多环境配置（支持 YAML/JSON 等格式）。
  - **全局注入**：配置模块注册为全局模块，无需在每个模块中重复导入。

## 📦 目录结构

```
src/
├── commons/                 # 通用模块
│   ├── config/              # 配置模块
│   │   ├── config.module.ts # ConfigModule 定义
│   │   └── configuration.ts # 配置加载与类型定义
│   └── logger.module.ts     # 日志模块（Winston 配置）
├── app.module.ts            # 根模块
└── main.ts                  # 入口文件
config/                      # 配置文件目录 (node-config)
├── default.yaml             # 默认配置
├── development.yaml         # 开发环境配置
└── production.yaml          # 生产环境配置
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

**开发模式（使用 SWC 加速）：**

```bash
npm run start:dev
```

**生产模式：**

```bash
npm run build
npm run start:prod
```

### 3. 配置说明

项目配置位于根目录下的 `config/` 文件夹中。你可以根据需要在 `src/commons/config/configuration.ts` 中扩展配置的类型定义。

示例 `config/default.yaml`:

```yaml
app:
  name: nest-demo
db:
  username: root
  password: password
```

在代码中使用配置：

```typescript
// 注入 ConfigService
constructor(private configService: ConfigService<Configuration>) {}

// 获取配置（支持类型推断）
const dbHost = this.configService.get('db', { infer: true }).host;
```

### 4. 日志使用

日志模块已在 `AppModule` 中全局注册，并替换了 NestJS 默认的 Logger。

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

日志文件将自动生成在项目根目录的 `logs/` 文件夹下。
