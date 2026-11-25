import { Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { ConfigModule } from "./commons/config/config.module.js";
import { LoggerModule } from "./commons/logger/logger.module.js";
import { UserModule } from "./user/user.module.js";

@Module({
  imports: [ConfigModule, LoggerModule, UserModule],
  controllers: [AppController],
})
export class AppModule {}
