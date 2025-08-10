import { EthersService } from '@/modules/ethers/ethers.service';
import { LiquidityEvent } from '@/modules/pool/interface/liqudity-event.interface';
import { RedisService } from '@/modules/redis/redis.service';
import { EventLog, Log } from 'ethers';
export declare class PoolService {
    private readonly ethers;
    private readonly redis;
    private readonly CACHE_KEYS;
    private readonly CACHE_TTL;
    constructor(ethers: EthersService, redis: RedisService);
    init(): Promise<void>;
    initializeFromBlockchain(): Promise<void>;
    setupEventListeners(): void;
    syncEventsFromBlockchain(fromBlock: number, toBlock: number): Promise<void>;
    processBatchEvents(fromBlock: number, toBlock: number): Promise<void>;
    processLiquidityEvent(event: EventLog | Log): Promise<void>;
    getPoolKey(tokenA: string, tokenB: string): string;
    addEventToPool(poolKey: string, eventData: LiquidityEvent, eventType: string): Promise<void>;
    getPools(): Promise<string | null>;
    updatePoolCache(): Promise<void>;
    getPoolData(tokenA: string, tokenB: string): Promise<{
        tokenA: string;
        tokenB: string;
        tokenAReserve: string;
        tokenBReserve: string;
        totalLiquidity: string;
    }>;
    addPoolIfNew(tokenA: string, tokenB: string): Promise<void>;
    getStats(): Promise<{
        totalPools: number;
        recentSwaps24h: number;
        recentLiquidity24h: number;
        lastUpdate: string;
    }>;
    getPoolEvents(poolKey: string, type?: null, limit?: number, offset?: number): Promise<LiquidityEvent[]>;
}
