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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const message: string | string[] = (exception.getResponse() as any).message;

    const res: ResponseDTO<null> = {
      code: status,
      msg:
        typeof message === 'string'
          ? message
          : message.length !== 0
            ? message[0]
            : exception.name,
      data: null,
    };

    response.status(status).json(res);
  }
}
