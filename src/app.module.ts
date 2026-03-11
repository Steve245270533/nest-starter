import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from './commons/logger/logger.module';
import { ConfigModule } from './commons/config/config.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule, LoggerModule, UserModule],
  controllers: [AppController],
})
export class AppModule {}
