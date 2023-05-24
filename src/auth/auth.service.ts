import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from 'src/users/users.repository';
import { BusinessException } from 'src/common/errors/BusinessException';
import { ErrorCode } from 'src/common/errors/ErrorCode';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/roles/role.enum';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedError } from 'src/common/errors/UnauthorizedError';
import { USER_REGISTER_TOKEN } from 'src/common/constants/CacheKeyConsts';
import { MailService } from 'src/common/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserPayload } from 'src/users/types/UserPayload';

const FIFTEEN_MINUTES = 60 * 15; // in seconds
@Injectable()
export class AuthService {
  constructor(
    private userRepo: UsersRepository,
    private jwtService: JwtService,
    private mailService: MailService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async register(registerDto: RegisterDto) {
    const userInDB = await this.userRepo.findOneByFilter({
      email: registerDto.email,
    });

    if (userInDB) {
      throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
    }

    const user = new User();
    user.password = await this._hashPassword(registerDto.password);
    user.email = registerDto.email;

    await Promise.all([
      this.userRepo.createOrUpdateUser(user),
      this._sendVerifyEmail(user),
    ]);

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOneByFilter({ email: loginDto.email });

    if (!user) {
      throw new UnauthorizedError(ErrorCode.USER_NOT_FOUND);
    }

    const passwordOk = await this._comparePassword(
      loginDto.password,
      user.password,
    );

    if (!passwordOk) {
      throw new UnauthorizedError(ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new UnauthorizedError(ErrorCode.USER_NOT_VERIFIED);
    }

    const now = Date.now().valueOf();
    this._cacheUserLoginSession(user, now);

    const payload = {
      userId: user.id,
      email: user.email,
      roles: [Role.User],
      timestamp: now,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN_DAYS,
      }),
    };
  }

  async _cacheUserLoginSession(user: User, now: number) {
    const key = `LOGIN_SESSION:${user.email}:${now}`;
    await this.redis.set(key, user.email, 'EX', FIFTEEN_MINUTES);
  }

  async _sendVerifyEmail(user: User) {
    const verifyToken = uuidv4();
    const key = `VERIFY_TOKEN::${verifyToken}`;
    await this.redis.set(key, user.email, 'EX', FIFTEEN_MINUTES);

    this.mailService.sendVerifyToken(verifyToken, user.email);
  }

  async verifyEmail(token: string) {
    const key = `VERIFY_TOKEN::${token}`;
    const email = await this.redis.get(key);

    if (!email) {
      throw new UnauthorizedError(ErrorCode.VERIFY_TOKEN_INVALID);
    }

    const user = await this.userRepo.findOneByFilter({ email });
    if (!user) {
      throw new UnauthorizedError(ErrorCode.USER_NOT_FOUND);
    }

    user.isVerified = true;
    this.userRepo.verifyUser(email);

    return 'success';
  }

  async changePassword(
    user: UserPayload,
    changePasswordDto: ChangePasswordDto,
  ) {
    const userInDB = await this.userRepo.findOneByFilter({ id: user.userId });

    if (!user) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND);
    }

    const passwordOk = await this._comparePassword(
      changePasswordDto.password,
      userInDB.password,
    );

    if (!passwordOk) {
      throw new UnauthorizedError(ErrorCode.INVALID_CREDENTIALS);
    }

    const hashedPassword = await this._hashPassword(
      changePasswordDto.newPassword,
    );

    return await this.userRepo.updatePassword(user.userId, hashedPassword);
  }

  async _hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async _comparePassword(password: string, userPassword: string) {
    return await bcrypt.compare(password, userPassword);
  }
}
