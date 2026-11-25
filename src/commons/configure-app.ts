import {
  BadRequestException,
  StandardSchemaValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { HttpExceptionsFilter } from "./filters/http-exception/http-exception.filter.js";
import { setupSwagger } from "./swagger/setupSwagger.js";

import type { Configuration } from "./config/configuration.js";
import type { INestApplication } from "@nestjs/common";

export async function configureApp(app: INestApplication) {
  const config = app.get<ConfigService<Configuration>>(ConfigService);
  const settings = config.getOrThrow("app", { infer: true });

  if (settings.cors) app.enableCors();
  app.setGlobalPrefix(settings.prefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: settings.version ?? VERSION_NEUTRAL,
  });
  app.useGlobalFilters(new HttpExceptionsFilter());
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues) =>
        new BadRequestException(issues[0]?.message ?? "请求参数校验失败"),
    }),
  );
  await setupSwagger(app);
}
