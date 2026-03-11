import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDTO } from '@/commons/dto';

/**
 * HTTP异常过滤器
 */
@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const res: ResponseDTO<null> = {
      code: status,
      msg: exception.message || exception.name,
      data: null,
    };

    response.status(status).json(res);
  }
}
