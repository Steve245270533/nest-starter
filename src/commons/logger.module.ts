import { type INestApplication, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import 'winston-daily-rotate-file';
import { Configuration } from './config/configuration';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => {
        const appName =
          configService.get('app', { infer: true })?.name ?? 'winston';

        return {
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp({
                  format: 'YYYY/MM/DD, hh:mm:ss',
                }),
                nestWinstonModuleUtilities.format.nestLike(appName),
              ),
            }),
            new winston.transports.DailyRotateFile({
              dirname: 'logs',
              filename: 'app-%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              maxSize: '20m',
              maxFiles: '14d',
            }),
          ],
        };
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}

export function useLogger(app: INestApplication) {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
}
