import { EthersService } from '@/modules/ethers/ethers.service';
import { LiquidityEvent } from '@/modules/pool/interface/liqudity-event.interface';
import { SwapEvent } from '@/modules/pool/interface/swap-event.interface';
import { RedisService } from '@/modules/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { EventLog, Log } from 'ethers';

@Injectable()
export class PoolService {
  public readonly CACHE_KEYS = {
    POOLS: 'pools',
    LAST_BLOCK: 'last_processed_block',
    POOL_EVENTS: 'pool_events:',
    SWAP_EVENTS: 'swap_events:',
    LIQUIDITY_EVENTS: 'liquidity_events:',
    KNOWN_POOLS: 'known_pools',
  };

  private readonly CACHE_TTL = {
    POOLS: 300, // 5분
    EVENTS: 3600, // 1시간
  };

  constructor(
    private readonly ethers: EthersService,
    private readonly redis: RedisService,
  ) {}

  /**
   * 모든 캐시 삭제
   */
  async deleteAll() {
    await this.redis.flushall();
  }

  /**
   * 초기화
   */
  async init() {
    await this.initializeFromBlockchain();
    void this.setupEventListeners();
  }

  /**
   * 초기화: 과거 모든 이벤트 수집
   */
  private async initializeFromBlockchain() {
    console.log('🚀 초기화 시작: 과거 이벤트 수집 중...');

    try {
      // 마지막 처리된 블록 확인
      let fromBlock = await this.redis.get(this.CACHE_KEYS.LAST_BLOCK);
      if (!fromBlock) {
        // 컨트랙트 배포 블록부터 시작
        fromBlock = process.env.CONTRACT_DEPLOY_BLOCK || '0';
      }

      const currentBlock = await this.ethers.provider.getBlockNumber();
      console.log(`📦 블록 범위: ${fromBlock} → ${currentBlock}`);

      await this.syncEventsFromBlockchain(Number(fromBlock), currentBlock);
      // await this.updatePoolCache();

      console.log('✅ 초기화 완료!');
    } catch (error) {
      console.error('❌ 초기화 실패:', error);
    }
  }

  /**
   * 실시간 이벤트 리스너 설정
   */
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
        amountA,
        amountB,
        liquidity,
        event: EventLog,
      ) => {
        console.log('📈 새 유동성 추가:', tokenA, tokenB);
        await this.processLiquidityEvent(event);
        await this.updatePoolCache();
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

    // Swap 이벤트 수집
    const swapFilter = this.ethers.dexContract.filters.Swap();
    const swapEvents = await this.ethers.dexContract.queryFilter(
      swapFilter,
      fromBlock,
      toBlock,
    );

    // 이벤트 처리
    for (const event of liquidityEvents) {
      await this.processLiquidityEvent(event);
    }

    for (const event of swapEvents) {
      await this.processSwapEvent(event);
    }
  }

  // 유동성 이벤트 처리

  async processLiquidityEvent(event: EventLog | Log) {
    const block = await event.getBlock();

    const arg = event['args'] as {
      provider: string;
      tokenA: string;
      tokenB: string;
      amountA: string;
      amountB: string;
      liquidity: string;
    };

    const eventData: LiquidityEvent = {
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

    // 풀별 이벤트 저장
    const poolKey = this.getPoolKey(arg.tokenA, arg.tokenB);
    await this.addEventToPool(poolKey, eventData, 'liquidity');

    // // 새 풀 확인 및 추가
    await this.addPoolIfNew(arg.tokenA, arg.tokenB);
  }

  /**
   * 토큰 순서 정규화 해서 풀 키 생성
   *
   * @param tokenA
   * @param tokenB
   * @returns
   */
  getPoolKey(tokenA: string, tokenB: string) {
    // 토큰 순서 정규화
    return tokenA.toLowerCase() < tokenB.toLowerCase()
      ? `${tokenA.toLowerCase()}-${tokenB.toLowerCase()}`
      : `${tokenB.toLowerCase()}-${tokenA.toLowerCase()}`;
  }

  /**
   * 이벤트 데이터 저장
   *
   * @param poolKey
   * @param eventData
   * @param eventType
   */
  async addEventToPool(
    poolKey: string,
    eventData: LiquidityEvent | SwapEvent,
    eventType: string,
  ) {
    const eventKey = `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:${eventType}`;
    await this.redis.lpush(eventKey, JSON.stringify(eventData));
    await this.redis.expire(eventKey, this.CACHE_TTL.EVENTS);

    // 최대 1000개 이벤트만 보관
    await this.redis.ltrim(eventKey, 0, 999);
  }

  /**
   * 모든 풀 목록 조회
   */
  async getPools() {
    let cachedPools = await this.redis.get(this.CACHE_KEYS.POOLS);
    if (!cachedPools || cachedPools === '[]') {
      await this.updatePoolCache();
      cachedPools = await this.redis.get(this.CACHE_KEYS.POOLS);
    }

    if (!cachedPools) {
      return [];
    }

    const returnPools = JSON.parse(cachedPools) as {
      tokenA: string;
      tokenB: string;
      tokenAReserve: string;
      tokenBReserve: string;
      totalLiquidity: string;
    }[];

    return { data: returnPools };
  }

  /**
   * 풀 캐시 업데이트
   */
  async updatePoolCache() {
    try {
      const poolKeys = await this.redis.smembers(this.CACHE_KEYS.KNOWN_POOLS);
      console.log('poolKeys', poolKeys);
      const pools: {
        tokenA: string;
        tokenB: string;
        tokenAReserve: string;
        tokenBReserve: string;
        totalLiquidity: string;
      }[] = [];

      for (const poolKey of poolKeys) {
        const [tokenA, tokenB] = poolKey.split('-');
        try {
          const poolData = await this.getPoolData(tokenA, tokenB);
          pools.push(poolData);
        } catch (error) {
          console.warn(`⚠️  풀 ${poolKey} 데이터 조회 실패:`, String(error));
        }
      }

      await this.redis.setex(
        this.CACHE_KEYS.POOLS,
        this.CACHE_TTL.POOLS,
        JSON.stringify(pools),
      );

      console.log(`📊 풀 캐시 업데이트 완료: ${pools.length}개 풀`);
    } catch (error) {
      console.error('❌ 풀 캐시 업데이트 실패:', error);
    }
  }

  /**
   * 풀 데이터 조회
   *
   * @param tokenA
   * @param tokenB
   * @returns
   */
  async getPoolData(tokenA: string, tokenB: string) {
    try {
      const poolData = (await this.ethers.dexContract.pools(
        tokenA,
        tokenB,
      )) as {
        tokenAReserve: string;
        tokenBReserve: string;
        totalLiquidity: string;
      };

      return {
        tokenA,
        tokenB,
        tokenAReserve: poolData.tokenAReserve.toString(),
        tokenBReserve: poolData.tokenBReserve.toString(),
        totalLiquidity: poolData.totalLiquidity.toString(),
      };
    } catch (error) {
      throw new Error(`풀 데이터 조회 실패: ${String(error)}`);
    }
  }

  /**
   * 새 풀 추가
   *
   * @param tokenA
   * @param tokenB
   */
  async addPoolIfNew(tokenA: string, tokenB: string) {
    const poolKey = this.getPoolKey(tokenA, tokenB);
    const exists = await this.redis.sismember(
      this.CACHE_KEYS.KNOWN_POOLS,
      poolKey,
    );

    if (!exists) {
      await this.redis.sadd(this.CACHE_KEYS.KNOWN_POOLS, poolKey);
      console.log(`🆕 새 풀 발견: ${poolKey}`);
    }
  }

  /**
   * 통계 정보 조회
   *
   * @returns
   */
  async getStats() {
    const poolKeys = await this.redis.smembers(this.CACHE_KEYS.KNOWN_POOLS);
    const totalPools = poolKeys.length;

    // 최근 24시간 이벤트 수 계산
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
    let recentSwaps = 0;
    let recentLiquidity = 0;

    for (const poolKey of poolKeys.slice(0, 10)) {
      // 샘플링
      const swapEvents = await this.redis.lrange(
        `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:swap`,
        0,
        -1,
      );
      const liquidityEvents = await this.redis.lrange(
        `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:liquidity`,
        0,
        -1,
      );

      recentSwaps += swapEvents.filter(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (e) => JSON.parse(e).timestamp > oneDayAgo,
      ).length;
      recentLiquidity += liquidityEvents.filter(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (e) => JSON.parse(e).timestamp > oneDayAgo,
      ).length;
    }

    return {
      totalPools,
      recentSwaps24h: recentSwaps,
      recentLiquidity24h: recentLiquidity,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * 풀 이벤트 조회
   *
   * @param poolKey
   * @param type
   * @param limit
   * @param offset
   */
  async getPoolEvents(poolKey: string, type = null, limit = 50, offset = 0) {
    const events: LiquidityEvent[] = [];

    const eventTypes = type ? [type] : ['liquidity', 'swap'];

    for (const eventType of eventTypes) {
      const eventKey = `${this.CACHE_KEYS.POOL_EVENTS}${poolKey}:${eventType}`;
      const eventList = await this.redis.lrange(
        eventKey,
        offset,
        offset + limit - 1,
      );

      events.push(...eventList.map((e) => JSON.parse(e) as LiquidityEvent));
    }

    // 시간순 정렬
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  //   // 스왑 이벤트 처리
  async processSwapEvent(event: EventLog | Log) {
    const block = await event.getBlock();
    const arg = event['args'] as {
      user: string;
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      amountOut: string;
    };

    const eventData: SwapEvent = {
      id: `${event.transactionHash}-${event.index}`,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      timestamp: block.timestamp,
      user: arg.user,
      tokenIn: arg.tokenIn,
      tokenOut: arg.tokenOut,
      amountIn: arg.amountIn.toString(),
      amountOut: arg.amountOut.toString(),
    };

    // 풀별 이벤트 저장
    const poolKey = this.getPoolKey(arg.tokenIn, arg.tokenOut);
    await this.addEventToPool(poolKey, eventData, 'swap');
  }
}

//   }
