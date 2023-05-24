import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const UserDecorator = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const jwt = new JwtService();
    const req = ctx.switchToHttp().getRequest();

    if (!!req.user) {
      return !!data ? req.user[data] : req.user;
    }

    const token = req.headers.authorization
      ? (req.headers.authorization as string).split(' ')
      : null;

    if (token && token[1]) {
      const decoded: any = jwt.verify(token[1], {
        secret: process.env.JWT_SECRET_KEY,
      });

      return !!data ? decoded[data] : decoded;
    }
  },
);
