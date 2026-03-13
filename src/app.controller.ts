import { Controller, Get, Logger, Query, Version } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Configuration } from './commons/config/configuration';
import { ResponseDTO } from '@/commons/dto';
import { Result } from '@/commons/utils/result';

@Controller()
export class AppController {
  constructor(
    private logger: Logger,
    private readonly configService: ConfigService<Configuration>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiQuery({ name: 'name', required: false, description: '用户名称' })
  @ApiResponse({
    status: 200,
    description: 'Return hello message',
    type: ResponseDTO,
  })
  getHello(@Query('name') name?: string): ResponseDTO<string> {
    this.logger.log(
      `appName: ${this.configService.get('app', { infer: true })?.name}, name: ${name}`,
      AppController.name,
    );
    return Result.ok(`hello ${name}`);
  }

  @Get()
  @Version('2')
  getHelloV2() {
    return 'hello-v2';
  }
}
