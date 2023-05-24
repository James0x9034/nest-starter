import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RedisModule as RedisModuleN,
  RedisModuleOptions,
} from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    RedisModuleN.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            url: process.env.REDIS_PATH,
          },
        };
      },
    }),
  ],
})
export class RedisModule {}
