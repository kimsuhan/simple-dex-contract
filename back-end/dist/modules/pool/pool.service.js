"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolService = void 0;
const ethers_service_1 = require("../ethers/ethers.service");
const redis_service_1 = require("../redis/redis.service");
const common_1 = require("@nestjs/common");
let PoolService = class PoolService {
    constructor(ethers, redis) {
        this.ethers = ethers;
        this.redis = redis;
        this.CACHE_KEYS = {
            POOLS: 'pools',
            LAST_BLOCK: 'last_processed_block',
            POOL_EVENTS: 'pool_events:',
            SWAP_EVENTS: 'swap_events:',
            LIQUIDITY_EVENTS: 'liquidity_events:',
        };
        this.CACHE_TTL = {
            POOLS: 300,
            EVENTS: 3600,
        };
    }
    async init() {
        await this.initializeFromBlockchain();
        void this.setupEventListeners();
    }
    async initializeFromBlockchain() {
        console.log('🚀 초기화 시작: 과거 이벤트 수집 중...');
        try {
            let fromBlock = await this.redis.get(this.CACHE_KEYS.LAST_BLOCK);
            if (!fromBlock) {
                fromBlock = process.env.CONTRACT_DEPLOY_BLOCK || '0';
            }
            const currentBlock = await this.ethers.provider.getBlockNumber();
            console.log(`📦 블록 범위: ${fromBlock} → ${currentBlock}`);
            await this.syncEventsFromBlockchain(Number(fromBlock), currentBlock);
            console.log('✅ 초기화 완료!');
        }
        catch (error) {
            console.error('❌ 초기화 실패:', error);
        }
    }
    setupEventListeners() {
        console.log('🎧 실시간 이벤트 리스너 설정...');
        void this.ethers.dexContract.on('LiquidityAdded', (provider, tokenA, tokenB, amountA, amountB, liquidity) => {
            console.log(`LiquidityAdded: ${provider} -> ${tokenA} ${tokenB} ${amountA} ${amountB} ${liquidity}`);
        });
        void this.ethers.dexContract.on('LiquidityAdded', async (_provider, tokenA, tokenB, _amountA, _amountB, _liquidity, _event) => {
            console.log('📈 새 유동성 추가:', tokenA, tokenB);
        });
        void this.ethers.provider.on('error', (error) => {
            console.error('❌ Provider 에러:', error);
        });
    }
    async syncEventsFromBlockchain(fromBlock, toBlock) {
        const BATCH_SIZE = 1000;
        for (let start = fromBlock; start <= toBlock; start += BATCH_SIZE) {
            const end = Math.min(start + BATCH_SIZE - 1, toBlock);
            console.log(`🔄 처리 중: 블록 ${start} - ${end}`);
            try {
                await this.processBatchEvents(start, end);
                await this.redis.set(this.CACHE_KEYS.LAST_BLOCK, end.toString());
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            catch (error) {
                console.error(`❌ 블록 ${start}-${end} 처리 실패:`, error);
                break;
            }
        }
    }
    async processBatchEvents(fromBlock, toBlock) {
        const liquidityFilter = this.ethers.dexContract.filters.LiquidityAdded();
        const liquidityEvents = await this.ethers.dexContract.queryFilter(liquidityFilter, fromBlock, toBlock);
        for (const event of liquidityEvents) {
            await this.processLiquidityEvent(event);
        }
    }
    async processLiquidityEvent(event) {
        const block = await event.getBlock();
        const arg = event['args'];
        const eventData = {
            id: `${event.transactionHash}-${event.index}`,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: block.timestamp,
            provider: arg.provider,
            tokenA: arg.tokenA,
            tokenB: arg.tokenB,
            amountA: arg.amountA.toString(),
            amountB: arg.amountB.toString(),
            liquidity: arg.liquidity.toString(),
            type: 'LIQUIDITY_ADDED',
        };
        const poolKey = this.getPoolKey(arg.tokenA, arg.tokenB);
        await this.addEventToPool(poolKey, eventData, 'liquidity');
        await this.addPoolIfNew(arg.tokenA, arg.tokenB);
    }
    getPoolKey(tokenA, tokenB) {
        return tokenA.toLowerCase() < tokenB.toLowerCase()
            ? `${tokenA.toLowerCase()}-${tokenB.toLowerCase()}`
            : `${tokenB.toLowerCase()}-${tokenA.toLowerCase()}`;
    }
    async addEventToPool(poolKey, eventData, eventType) {
        const eventKey = `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:${eventType}`;
        await this.redis.lpush(eventKey, JSON.stringify(eventData));
        await this.redis.expire(eventKey, this.CACHE_TTL.EVENTS);
        await this.redis.ltrim(eventKey, 0, 999);
    }
    async getPools() {
        const cachedPools = await this.redis.get(this.CACHE_KEYS.POOLS);
        console.log('cachedPools', cachedPools);
        if (!cachedPools) {
            await this.updatePoolCache();
        }
        return cachedPools;
    }
    async updatePoolCache() {
        try {
            const poolKeys = await this.redis.smembers('known_pools');
            console.log('poolKeys', poolKeys);
            const pools = [];
            for (const poolKey of poolKeys) {
                const [tokenA, tokenB] = poolKey.split('-');
                try {
                    const poolData = await this.getPoolData(tokenA, tokenB);
                    pools.push(poolData);
                }
                catch (error) {
                    console.warn(`⚠️  풀 ${poolKey} 데이터 조회 실패:`, String(error));
                }
            }
            await this.redis.setex(this.CACHE_KEYS.POOLS, this.CACHE_TTL.POOLS, JSON.stringify(pools));
            console.log(`📊 풀 캐시 업데이트 완료: ${pools.length}개 풀`);
        }
        catch (error) {
            console.error('❌ 풀 캐시 업데이트 실패:', error);
        }
    }
    async getPoolData(tokenA, tokenB) {
        try {
            const poolData = (await this.ethers.dexContract.pools(tokenA, tokenB));
            return {
                tokenA,
                tokenB,
                tokenAReserve: poolData.tokenAReserve.toString(),
                tokenBReserve: poolData.tokenBReserve.toString(),
                totalLiquidity: poolData.totalLiquidity.toString(),
            };
        }
        catch (error) {
            throw new Error(`풀 데이터 조회 실패: ${String(error)}`);
        }
    }
    async addPoolIfNew(tokenA, tokenB) {
        const poolKey = this.getPoolKey(tokenA, tokenB);
        const exists = await this.redis.sismember('known_pools', poolKey);
        if (!exists) {
            await this.redis.sadd('known_pools', poolKey);
            console.log(`🆕 새 풀 발견: ${poolKey}`);
        }
    }
    async getStats() {
        const poolKeys = await this.redis.smembers('known_pools');
        const totalPools = poolKeys.length;
        const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
        let recentSwaps = 0;
        let recentLiquidity = 0;
        for (const poolKey of poolKeys.slice(0, 10)) {
            const swapEvents = await this.redis.lrange(`${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:swap`, 0, -1);
            const liquidityEvents = await this.redis.lrange(`${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:liquidity`, 0, -1);
            recentSwaps += swapEvents.filter((e) => JSON.parse(e).timestamp > oneDayAgo).length;
            recentLiquidity += liquidityEvents.filter((e) => JSON.parse(e).timestamp > oneDayAgo).length;
        }
        return {
            totalPools,
            recentSwaps24h: recentSwaps,
            recentLiquidity24h: recentLiquidity,
            lastUpdate: new Date().toISOString(),
        };
    }
    async getPoolEvents(poolKey, type = null, limit = 50, offset = 0) {
        const events = [];
        const eventTypes = type ? [type] : ['liquidity', 'swap'];
        for (const eventType of eventTypes) {
            const eventKey = `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:${eventType}`;
            const eventList = await this.redis.lrange(eventKey, offset, offset + limit - 1);
            events.push(...eventList.map((e) => JSON.parse(e)));
        }
        return events.sort((a, b) => b.timestamp - a.timestamp);
    }
};
exports.PoolService = PoolService;
exports.PoolService = PoolService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ethers_service_1.EthersService,
        redis_service_1.RedisService])
], PoolService);
//# sourceMappingURL=pool.service.js.map