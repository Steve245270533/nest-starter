import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from './commons/logger.module';
import { ConfigModule } from './commons/config/config.module';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [AppController],
})
export class AppModule {}
