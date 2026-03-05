import { Controller, Get, Logger, Version } from '@nestjs/common';
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
      `appName: ${this.configService.get('app', { infer: true })?.name}`,
      AppController.name,
    );
    return 'hello';
  }

  @Get()
  @Version('2')
  getHelloV2() {
    return 'hello-v2';
  }
}
