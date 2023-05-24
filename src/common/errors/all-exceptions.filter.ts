import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from './BusinessException';

export const getStatusCode = (exception: unknown): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: any): any => {
  const status =
    exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
    if (JSON.stringify(exception) == '{}') {
      return exception;
    }

    return JSON.stringify(exception);
  }
  const message = exception.getResponse().message || exception.getResponse();

  if (typeof message == 'string') {
    return message;
  }

  return JSON.stringify(message);
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  private readonly logger = new Logger();

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const code = getStatusCode(exception);
    const message = getErrorMessage(exception);
    const { originalUrl, method, params, query, body } = request;

    if (exception instanceof BusinessException) {
      const dataError = exception.getResponse();
      this.logger.error(
        `[Error] Code:${code} Request: ${originalUrl} method: ${method} message: ${JSON.stringify(
          dataError,
        )} `,
      );
      response.status(code).json({ code: code, message: dataError });
      return;
    }

    this.logger.error(
      `[Error] Code:${code} Request: ${originalUrl} method: ${method} message: ${message} `,
    );
    response.status(code).json({ code, message });
  }
}
