import { EthersService } from '@/modules/ethers/ethers.service';
import { RedisService } from '@/modules/redis/redis.service';
export declare class PoolService {
    private readonly ethers;
    private readonly redis;
    private readonly CACHE_KEYS;
    constructor(ethers: EthersService, redis: RedisService);
    init(): Promise<void>;
    initializeFromBlockchain(): Promise<void>;
    setupEventListeners(): void;
    syncEventsFromBlockchain(fromBlock: number, toBlock: number): Promise<void>;
    processBatchEvents(fromBlock: number, toBlock: number): Promise<void>;
}
