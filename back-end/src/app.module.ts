import { EthersModule } from '@/modules/ethers/ethers.module';
import { PoolModule } from '@/modules/pool/pool.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [RedisModule, EthersModule, PoolModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
