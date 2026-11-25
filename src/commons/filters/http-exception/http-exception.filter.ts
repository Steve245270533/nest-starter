import { Catch, HttpException } from "@nestjs/common";

import { Result } from "../../utils/result.js";

import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();
    const message =
      typeof payload === "string"
        ? payload
        : (payload as { message?: unknown }).message;
    const firstMessage: unknown = Array.isArray(message) ? message[0] : message;

    response
      .status(status)
      .json(
        Result.fail(
          status,
          typeof firstMessage === "string" ? firstMessage : exception.message,
        ),
      );
  }
}
