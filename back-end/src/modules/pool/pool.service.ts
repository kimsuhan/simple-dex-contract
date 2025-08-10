// const express = require('express');
// const { ethers } = require('ethers');
// const Redis = require('redis');
// const cron = require('node-cron');

import { EthersService } from '@/modules/ethers/ethers.service';
import { RedisService } from '@/modules/redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PoolService {
  private readonly CACHE_KEYS = {
    POOLS: 'pools',
    LAST_BLOCK: 'last_processed_block',
    POOL_EVENTS: 'pool_events:',
    SWAP_EVENTS: 'swap_events:',
    LIQUIDITY_EVENTS: 'liquidity_events:',
  };

  constructor(
    private readonly ethers: EthersService,
    private readonly redis: RedisService,
  ) {}
  // constructor(private readonly redisService: RedisService) {
  // this.app = express();
  // this.redis = Redis.createClient();
  // this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  // this.contract = new ethers.Contract(
  //   process.env.DEX_CONTRACT_ADDRESS,
  //   require('./abi/SimpleDEX.json'),
  //   this.provider,
  // );
  // this.CACHE_TTL = {
  //   POOLS: 300, // 5분
  //   EVENTS: 3600, // 1시간
  // };
  // this.init();

  async init() {
    await this.initializeFromBlockchain();
    void this.setupEventListeners();
    // this.setupRoutes();
    // this.setupCronJobs();
  }
  /**
   * 초기화: 과거 모든 이벤트 수집
   */
  async initializeFromBlockchain() {
    console.log('🚀 초기화 시작: 과거 이벤트 수집 중...');

    try {
      // 마지막 처리된 블록 확인
      // let fromBlock = await this.redis.get(this.CACHE_KEYS.LAST_BLOCK);
      let fromBlock: number = 0;
      if (!fromBlock) {
        // 컨트랙트 배포 블록부터 시작
        fromBlock = Number(process.env.CONTRACT_DEPLOY_BLOCK) || 0;
      }

      const currentBlock = await this.ethers.provider.getBlockNumber();
      console.log(`📦 블록 범위: ${fromBlock} → ${currentBlock}`);

      await this.syncEventsFromBlockchain(fromBlock, currentBlock);
      // await this.updatePoolCache();

      console.log('✅ 초기화 완료!');
    } catch (error) {
      console.error('❌ 초기화 실패:', error);
    }
  }

  //   // 실시간 이벤트 리스너 설정
  setupEventListeners() {
    console.log('🎧 실시간 이벤트 리스너 설정...');

    void this.ethers.dexContract.on(
      'LiquidityAdded',
      (provider, tokenA, tokenB, amountA, amountB, liquidity) => {
        console.log(
          `LiquidityAdded: ${provider} -> ${tokenA} ${tokenB} ${amountA} ${amountB} ${liquidity}`,
        );
      },
    );

    // 유동성 추가 이벤트
    void this.ethers.dexContract.on(
      'LiquidityAdded',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (
        _provider,
        tokenA,
        tokenB,
        _amountA,
        _amountB,
        _liquidity,
        _event,
      ) => {
        console.log('📈 새 유동성 추가:', tokenA, tokenB);
        // await this.processLiquidityEvent(event);
        // await this.updatePoolCache();
      },
    );

    // 연결 에러 처리
    void this.ethers.provider.on('error', (error) => {
      console.error('❌ Provider 에러:', error);
    });
  }

  /**
   * 블록체인에서 이벤트 동기화
   *
   * @param fromBlock
   * @param toBlock
   * @returns void
   */
  async syncEventsFromBlockchain(fromBlock: number, toBlock: number) {
    const BATCH_SIZE = 1000; // 한 번에 처리할 블록 수

    for (let start = fromBlock; start <= toBlock; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, toBlock);
      console.log(`🔄 처리 중: 블록 ${start} - ${end}`);

      try {
        await this.processBatchEvents(start, end);

        // 마지막 처리된 블록 업데이트
        await this.redis.set(this.CACHE_KEYS.LAST_BLOCK, end.toString());

        // Rate limiting을 위한 딜레이
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ 블록 ${start}-${end} 처리 실패:`, error);
        break;
      }
    }
  }

  /**
   * 배치 이벤트 처리
   *
   * @param fromBlock
   * @param toBlock
   * @returns void
   */
  async processBatchEvents(fromBlock: number, toBlock: number) {
    // LiquidityAdded 이벤트 수집
    const liquidityFilter = this.ethers.dexContract.filters.LiquidityAdded();
    const liquidityEvents = await this.ethers.dexContract.queryFilter(
      liquidityFilter,
      fromBlock,
      toBlock,
    );

    console.log(liquidityEvents);

    // Swap 이벤트 수집
    // const swapFilter = this.ethers.dexContract.filters.Swap();
    // const swapEvents = await this.ethers.dexContract.queryFilter(
    //   swapFilter,
    //   fromBlock,
    //   toBlock,
    // );

    // 이벤트 처리
    // for (const event of liquidityEvents) {
    //   await this.processLiquidityEvent(event);
    // }

    // for (const event of swapEvents) {
    //   await this.processSwapEvent(event);
    // }
  }
}

//   // 유동성 이벤트 처리
//   async processLiquidityEvent(event) {
//     const block = await event.getBlock();
//     const eventData = {
//       id: `${event.transactionHash}-${event.logIndex}`,
//       transactionHash: event.transactionHash,
//       blockNumber: event.blockNumber,
//       timestamp: block.timestamp,
//       provider: event.args.provider,
//       tokenA: event.args.tokenA,
//       tokenB: event.args.tokenB,
//       amountA: event.args.amountA.toString(),
//       amountB: event.args.amountB.toString(),
//       liquidity: event.args.liquidity.toString(),
//       type: 'LIQUIDITY_ADDED',
//     };

//     // 풀별 이벤트 저장
//     const poolKey = this.getPoolKey(event.args.tokenA, event.args.tokenB);
//     await this.addEventToPool(poolKey, eventData, 'liquidity');

//     // 새 풀 확인 및 추가
//     await this.addPoolIfNew(event.args.tokenA, event.args.tokenB);
//   }

//   // 스왑 이벤트 처리
//   async processSwapEvent(event) {
//     const block = await event.getBlock();
//     const eventData = {
//       id: `${event.transactionHash}-${event.logIndex}`,
//       transactionHash: event.transactionHash,
//       blockNumber: event.blockNumber,
//       timestamp: block.timestamp,
//       user: event.args.user,
//       tokenIn: event.args.tokenIn,
//       tokenOut: event.args.tokenOut,
//       amountIn: event.args.amountIn.toString(),
//       amountOut: event.args.amountOut.toString(),
//       type: 'SWAP',
//     };

//     // 풀별 이벤트 저장
//     const poolKey = this.getPoolKey(event.args.tokenIn, event.args.tokenOut);
//     await this.addEventToPool(poolKey, eventData, 'swap');
//   }

//   // API 라우트 설정
//   setupRoutes() {
//     this.app.use(express.json());

//     // 모든 풀 목록 조회
//     this.app.get('/api/pools', async (req, res) => {
//       try {
//         const cachedPools = await this.redis.get(this.CACHE_KEYS.POOLS);

//         if (cachedPools) {
//           return res.json({
//             success: true,
//             data: JSON.parse(cachedPools),
//             cached: true,
//           });
//         }

//         await this.updatePoolCache();
//         const pools = await this.redis.get(this.CACHE_KEYS.POOLS);

//         res.json({
//           success: true,
//           data: JSON.parse(pools),
//           cached: false,
//         });
//       } catch (error) {
//         res.status(500).json({
//           success: false,
//           error: error.message,
//         });
//       }
//     });

//     // 특정 풀 정보 조회
//     this.app.get('/api/pools/:tokenA/:tokenB', async (req, res) => {
//       try {
//         const { tokenA, tokenB } = req.params;
//         const poolKey = this.getPoolKey(tokenA, tokenB);

//         // 풀 기본 정보
//         const poolData = await this.getPoolData(tokenA, tokenB);

//         // 풀 이벤트 기록
//         const events = await this.getPoolEvents(poolKey);

//         res.json({
//           success: true,
//           data: {
//             pool: poolData,
//             events: events,
//           },
//         });
//       } catch (error) {
//         res.status(500).json({
//           success: false,
//           error: error.message,
//         });
//       }
//     });

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

//     // 통계 정보 조회
//     this.app.get('/api/stats', async (req, res) => {
//       try {
//         const stats = await this.getStats();
//         res.json({
//           success: true,
//           data: stats,
//         });
//       } catch (error) {
//         res.status(500).json({
//           success: false,
//           error: error.message,
//         });
//       }
//     });

//     // 헬스 체크
//     this.app.get('/health', (req, res) => {
//       res.json({ status: 'OK', timestamp: new Date().toISOString() });
//     });
//   }

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
//       const lastBlock = await this.redis.get(this.CACHE_KEYS.LAST_BLOCK);
//       const currentBlock = await this.provider.getBlockNumber();

//       if (currentBlock > parseInt(lastBlock) + 10) {
//         await this.syncEventsFromBlockchain(
//           parseInt(lastBlock) + 1,
//           currentBlock,
//         );
//       }
//     });
//   }

//   // 유틸리티 메서드들
//   getPoolKey(tokenA, tokenB) {
//     // 토큰 순서 정규화
//     return tokenA.toLowerCase() < tokenB.toLowerCase()
//       ? `${tokenA.toLowerCase()}-${tokenB.toLowerCase()}`
//       : `${tokenB.toLowerCase()}-${tokenA.toLowerCase()}`;
//   }

//   async addPoolIfNew(tokenA, tokenB) {
//     const poolKey = this.getPoolKey(tokenA, tokenB);
//     const exists = await this.redis.sismember('known_pools', poolKey);

//     if (!exists) {
//       await this.redis.sadd('known_pools', poolKey);
//       console.log(`🆕 새 풀 발견: ${poolKey}`);
//     }
//   }

//   async addEventToPool(poolKey, eventData, eventType) {
//     const eventKey = `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:${eventType}`;
//     await this.redis.lpush(eventKey, JSON.stringify(eventData));
//     await this.redis.expire(eventKey, this.CACHE_TTL.EVENTS);

//     // 최대 1000개 이벤트만 보관
//     await this.redis.ltrim(eventKey, 0, 999);
//   }

//   async getPoolData(tokenA, tokenB) {
//     try {
//       const poolData = await this.contract.pools(tokenA, tokenB);
//       return {
//         tokenA,
//         tokenB,
//         tokenAReserve: poolData.tokenAReserve.toString(),
//         tokenBReserve: poolData.tokenBReserve.toString(),
//         totalLiquidity: poolData.totalLiquidity.toString(),
//       };
//     } catch (error) {
//       throw new Error(`풀 데이터 조회 실패: ${error.message}`);
//     }
//   }

//   async getPoolEvents(poolKey, type = null, limit = 50, offset = 0) {
//     const events = [];

//     const eventTypes = type ? [type] : ['liquidity', 'swap'];

//     for (const eventType of eventTypes) {
//       const eventKey = `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:${eventType}`;
//       const eventList = await this.redis.lrange(
//         eventKey,
//         offset,
//         offset + limit - 1,
//       );

//       events.push(...eventList.map((e) => JSON.parse(e)));
//     }

//     // 시간순 정렬
//     return events.sort((a, b) => b.timestamp - a.timestamp);
//   }

//   async updatePoolCache() {
//     try {
//       const poolKeys = await this.redis.smembers('known_pools');
//       const pools = [];

//       for (const poolKey of poolKeys) {
//         const [tokenA, tokenB] = poolKey.split('-');
//         try {
//           const poolData = await this.getPoolData(tokenA, tokenB);
//           pools.push(poolData);
//         } catch (error) {
//           console.warn(`⚠️  풀 ${poolKey} 데이터 조회 실패:`, error.message);
//         }
//       }

//       await this.redis.setex(
//         this.CACHE_KEYS.POOLS,
//         this.CACHE_TTL.POOLS,
//         JSON.stringify(pools),
//       );

//       console.log(`📊 풀 캐시 업데이트 완료: ${pools.length}개 풀`);
//     } catch (error) {
//       console.error('❌ 풀 캐시 업데이트 실패:', error);
//     }
//   }

//   async getStats() {
//     const poolKeys = await this.redis.smembers('known_pools');
//     const totalPools = poolKeys.length;

//     // 최근 24시간 이벤트 수 계산
//     const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
//     let recentSwaps = 0;
//     let recentLiquidity = 0;

//     for (const poolKey of poolKeys.slice(0, 10)) {
//       // 샘플링
//       const swapEvents = await this.redis.lrange(
//         `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:swap`,
//         0,
//         -1,
//       );
//       const liquidityEvents = await this.redis.lrange(
//         `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:liquidity`,
//         0,
//         -1,
//       );

//       recentSwaps += swapEvents.filter(
//         (e) => JSON.parse(e).timestamp > oneDayAgo,
//       ).length;
//       recentLiquidity += liquidityEvents.filter(
//         (e) => JSON.parse(e).timestamp > oneDayAgo,
//       ).length;
//     }

//     return {
//       totalPools,
//       recentSwaps24h: recentSwaps,
//       recentLiquidity24h: recentLiquidity,
//       lastUpdate: new Date().toISOString(),
//     };
//   }

//   start(port = 3000) {
//     this.app.listen(port, () => {
//       console.log(`🚀 DEX 백엔드 서비스 시작: http://localhost:${port}`);
//     });
//   }
// }

// 환경 변수 설정 예시
/*
.env 파일:
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
DEX_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
CONTRACT_DEPLOY_BLOCK=18500000
REDIS_URL=redis://localhost:6379
*/

// 서비스 시작
// const dexService = new DEXDataService();
// dexService.start(3000);

// module.exports = DEXDataService;
