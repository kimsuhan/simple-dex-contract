import { EthersService } from '@/modules/ethers/ethers.service';
import { PoolService } from '@/modules/pool/pool.service';
import { RedisService } from '@/modules/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PoolSchedule {
  constructor(
    private readonly poolService: PoolService,
    private readonly redis: RedisService,
    private readonly ethers: EthersService,
  ) {}

  //   // 정기 작업 설정
  //   setupCronJobs() {
  //     // 5분마다 캐시 업데이트
  //     cron.schedule('*/5 * * * *', async () => {
  //       console.log('🔄 정기 캐시 업데이트...');
  //       await this.updatePoolCache();
  //     });

  //     // 1시간마다 이벤트 동기화 확인
  //     cron.schedule('0 * * * *', async () => {
  //       console.log('🔍 이벤트 동기화 확인...');
  //     });

  @Cron(CronExpression.EVERY_MINUTE)
  async updatePoolCache() {
    console.log('🔄 정기 캐시 업데이트...');
    await this.poolService.updatePoolCache();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncEventsFromBlockchain() {
    console.log('🔍 이벤트 동기화 확인...');

    const lastBlock =
      (await this.redis.get(this.poolService.CACHE_KEYS.LAST_BLOCK)) || '0';

    const currentBlock = await this.ethers.provider.getBlockNumber();

    if (currentBlock > parseInt(lastBlock) + 10) {
      await this.poolService.syncEventsFromBlockchain(
        parseInt(lastBlock) + 1,
        currentBlock,
      );
    }
  }
}
