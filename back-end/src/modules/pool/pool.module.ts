import { EthersModule } from '@/modules/ethers/ethers.module';
import { PoolController } from '@/modules/pool/pool.controller';
import { PoolSchedule } from '@/modules/pool/pool.schedule';
import { RedisModule } from '@/modules/redis/redis.module';
import { Module } from '@nestjs/common';
import { PoolService } from './pool.service';

@Module({
  imports: [EthersModule, RedisModule],
  controllers: [PoolController],
  providers: [PoolService, PoolSchedule],
  exports: [PoolService],
})
export class PoolModule {}
