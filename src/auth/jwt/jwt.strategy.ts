import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { UnauthorizedError } from 'src/common/errors/UnauthorizedError';
import { ErrorCode } from 'src/common/errors/ErrorCode';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET_KEY}`,
    });
  }

  async validate(payload: any) {
    const key = `LOGIN_SESSION:${payload.email}:${payload.timestamp}`;

    const userSession = await this.redis.get(key);

    if (!userSession) {
      throw new UnauthorizedError(ErrorCode.TOKEN_EXPIRED);
    }

    return {
      userId: payload.userId,
      email: payload.emcail,
      roles: payload.roles,
      timestamp: payload.timestamp,
    };
  }
}
