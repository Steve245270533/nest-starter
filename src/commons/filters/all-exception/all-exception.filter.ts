import { ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request, Response } from 'express';

import * as requestIp from 'request-ip';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      headers: request.headers as unknown,
      query: request.query as unknown,
      body: request.body as unknown,
      params: request.params as unknown,
      timestamp: new Date().toISOString(),
      ip: requestIp.getClientIp(request),
      exceptioin: exception instanceof Error ? exception : 'UnknownError',
      error:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal Server Error',
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
