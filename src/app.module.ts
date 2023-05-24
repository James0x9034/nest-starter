import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './modules/database.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from './modules/config.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [ConfigModule, DatabaseModule, UsersModule, AuthModule, RedisModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
