import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Result } from '@/commons/utils/result';

/**
 * HTTP异常过滤器
 */
@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const message: string | string[] = (exception.getResponse() as any).message;

    const msg =
      typeof message === 'string'
        ? message
        : message.length !== 0
          ? message[0]
          : exception.name;

    const res = Result.fail(status, msg, null);

    response.status(status).json(res);
  }
}
