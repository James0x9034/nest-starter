import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './ErrorCode';

export class UnauthorizedError extends HttpException {
  constructor(code: ErrorCode) {
    super(ErrorCode[code], HttpStatus.UNAUTHORIZED);
  }
}
