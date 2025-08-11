import { RedisController } from '@/modules/redis/redis.controller';
import { RedisService } from '@/modules/redis/redis.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [RedisService],
  exports: [RedisService],
  controllers: [RedisController],
})
export class RedisModule {}
