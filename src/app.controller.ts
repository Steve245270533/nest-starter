import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration } from './commons/config/configuration';

@Controller()
export class AppController {
  constructor(
    private logger: Logger,
    private readonly configService: ConfigService<Configuration>,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log(
      `port: ${this.configService.get('db', { infer: true })?.port}`,
      AppController.name,
    );
    return 'hello';
  }
}
