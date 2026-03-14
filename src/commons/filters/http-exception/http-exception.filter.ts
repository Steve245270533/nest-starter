import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { Result } from '@/commons/utils/result';
import { ZodValidationException } from 'nestjs-zod';

/**
 * HTTP异常过滤器
 */
@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    let exceptionResponse = exception.getResponse();

    // 判断如果是由 nestjs-zod 抛出的数据校验异常
    if (exception instanceof ZodValidationException) {
      exceptionResponse = {
        statusCode: status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        message: exception.getResponse()?.errors?.map((e) => e.message),
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const message: string | string[] =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

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
