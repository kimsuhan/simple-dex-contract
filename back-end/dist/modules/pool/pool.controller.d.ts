import { PoolService } from '@/modules/pool/pool.service';
export declare class PoolController {
    private readonly poolService;
    constructor(poolService: PoolService);
    getPools(): Promise<string | null>;
    getStats(): Promise<{
        totalPools: number;
        recentSwaps24h: number;
        recentLiquidity24h: number;
        lastUpdate: string;
    }>;
    getEvent(tokenA: string, tokenB: string): Promise<import("./interface/liqudity-event.interface").LiquidityEvent[]>;
}
