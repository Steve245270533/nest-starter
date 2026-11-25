import { Catch, HttpException, HttpStatus, Logger } from "@nestjs/common";

import { Result } from "../../utils/result.js";

import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          Result.fail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Internal server error",
          ),
        );
      return;
    }

    const status = exception.getStatus();
    const payload = exception.getResponse();
    const message =
      typeof payload === "string"
        ? payload
        : "message" in payload
          ? payload.message
          : undefined;
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
