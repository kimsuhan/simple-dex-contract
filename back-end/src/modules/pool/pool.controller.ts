import { PoolService } from '@/modules/pool/pool.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('pools')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

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

  //     // 풀 이벤트 히스토리 조회
  //     this.app.get('/api/pools/:tokenA/:tokenB/events', async (req, res) => {
  //       try {
  //         const { tokenA, tokenB } = req.params;
  //         const { type, limit = 50, offset = 0 } = req.query;

  //         const poolKey = this.getPoolKey(tokenA, tokenB);
  //         const events = await this.getPoolEvents(
  //           poolKey,
  //           type,
  //           parseInt(limit),
  //           parseInt(offset),
  //         );

  //         res.json({
  //           success: true,
  //           data: events,
  //         });
  //       } catch (error) {
  //         res.status(500).json({
  //           success: false,
  //           error: error.message,
  //         });
  //       }
  //     });
}
