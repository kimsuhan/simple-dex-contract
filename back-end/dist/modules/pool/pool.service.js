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
    }
    async init() {
        await this.initializeFromBlockchain();
        void this.setupEventListeners();
    }
    async initializeFromBlockchain() {
        console.log('🚀 초기화 시작: 과거 이벤트 수집 중...');
        try {
            let fromBlock = 0;
            if (!fromBlock) {
                fromBlock = Number(process.env.CONTRACT_DEPLOY_BLOCK) || 0;
            }
            const currentBlock = await this.ethers.provider.getBlockNumber();
            console.log(`📦 블록 범위: ${fromBlock} → ${currentBlock}`);
            await this.syncEventsFromBlockchain(fromBlock, currentBlock);
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
        console.log(liquidityEvents);
    }
};
exports.PoolService = PoolService;
exports.PoolService = PoolService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ethers_service_1.EthersService,
        redis_service_1.RedisService])
], PoolService);
//# sourceMappingURL=pool.service.js.map