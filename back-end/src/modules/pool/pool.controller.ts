import { PoolService } from '@/modules/pool/pool.service';
import { Controller, Delete, Get, Param } from '@nestjs/common';

@Controller('pools')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Delete('all')
  async deleteAll() {
    return this.poolService.deleteAll();
  }

  @Get()
  async getPools() {
    return this.poolService.getPools();
  }

  @Get('stats')
  async getStats() {
    return this.poolService.getStats();
  }

  @Get(':tokenA/:tokenB/events')
  async getEvent(
    @Param('tokenA') tokenA: string,
    @Param('tokenB') tokenB: string,
  ) {
    const poolKey = this.poolService.getPoolKey(tokenA, tokenB);
    return this.poolService.getPoolEvents(poolKey);
  }
}
