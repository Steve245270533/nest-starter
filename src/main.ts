import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AllExceptionFilter } from './commons/filters/all-exception/all-exception.filter';
import { HttpExceptionsFilter } from './commons/filters/http-exception/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { Configuration } from './commons/config/configuration';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { setupSwagger } from './commons/swagger/setupSwagger';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configServcie = app.get<ConfigService<Configuration>>(ConfigService);
  const AppConfig = configServcie.get('app', { infer: true })!;

  // 全局Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // const httpAdapter = app.get(HttpAdapterHost);

  // 全局Filter
  app.useGlobalFilters(
    // new AllExceptionFilter(httpAdapter),
    new HttpExceptionsFilter(),
  );

  // 跨域
  if (AppConfig.cors === true) {
    app.enableCors();
  }

  // 全局接口请求前缀
  app.setGlobalPrefix(AppConfig.prefix);
  // 全局接口版本号
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: AppConfig.version ?? VERSION_NEUTRAL,
  });

  // 全局验证管道
  app.useGlobalPipes(new ZodValidationPipe());

  // swagger文档
  await setupSwagger(app, cleanupOpenApiDoc);

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
