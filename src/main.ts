import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useLogger } from './commons/logger.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useLogger(app);
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
