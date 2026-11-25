import { NestFactory } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AppModule } from "./app.module.js";
import { configureApp } from "./commons/configure-app.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();
  await configureApp(app);
  await app.listen(process.env.PORT ?? 8080);
}

void bootstrap();
