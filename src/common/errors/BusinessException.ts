import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './ErrorCode';

export class BusinessException extends HttpException {
  constructor(code: ErrorCode) {
    super(ErrorCode[code], HttpStatus.BAD_REQUEST);
  }
}
