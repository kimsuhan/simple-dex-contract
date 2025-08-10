import { EthersModule } from '@/modules/ethers/ethers.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { Module } from '@nestjs/common';
import { PoolService } from './pool.service';

@Module({
  imports: [EthersModule, RedisModule],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
