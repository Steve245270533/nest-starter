import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from "nest-winston";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import type { Configuration } from "../config/configuration.js";

function createDailyRotateTransport(level: string, fileName: string) {
  return new DailyRotateFile({
    level,
    dirname: "logs",
    filename: `${fileName}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
    ),
  });
}

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => {
        const appConfig = configService.get("app", {
          infer: true,
        })!;

        return {
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp({
                  format: "YYYY/MM/DD, hh:mm:ss",
                }),
                nestWinstonModuleUtilities.format.nestLike(appConfig.name),
              ),
            }),
            ...(appConfig.logger
              ? [
                  createDailyRotateTransport("info", "application"),
                  createDailyRotateTransport("warn", "error"),
                ]
              : []),
          ],
        };
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
