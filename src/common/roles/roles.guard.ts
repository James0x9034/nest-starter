import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { ErrorCode } from '../errors/ErrorCode';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const jwt = new JwtService();

    const req = context.switchToHttp().getRequest();

    const token = req.headers.authorization
      ? (req.headers.authorization as string).split(' ')
      : null;

    if (token && token[1]) {
      try {
        const decoded: any = jwt.verify(token[1], {
          secret: process.env.JWT_SECRET_KEY,
        });

        return requiredRoles.some((role) => decoded.roles?.includes(role));
      } catch (err) {
        throw new UnauthorizedError(ErrorCode.TOKEN_EXPIRED);
      }
    }

    return false;
  }
}
