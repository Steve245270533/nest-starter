import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './commons/filters/all-exception/all-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { Configuration } from './commons/config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configServcie = app.get<ConfigService<Configuration>>(ConfigService);
  const AppConfig = configServcie.get('app', { infer: true })!;

  // 全局Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const httpAdapter = app.get(HttpAdapterHost);

  // 全局Filter
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  // 跨域
  if (AppConfig.cors === true) {
    app.enableCors();
  }

  // 全局请求前缀
  console.log(AppConfig.prefix);
  app.setGlobalPrefix(AppConfig.prefix);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
