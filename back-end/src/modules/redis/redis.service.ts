import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  /**
   * Redis 키 목록 조회
   *
   * @returns Key list
   */
  async getKeys(): Promise<string[]> {
    return this.redis.keys('*');
  }

  /**
   * Redis 키 값 조회
   *
   * @param key
   * @returns Value or null
   */
  async get(key: string): Promise<string | null> {
    const value = await this.redis.get(key);
    this.logger.verbose(`Redis Get: ${key} -> ${value}`);
    return value;
  }

  /**
   * Redis 키 값 조회
   *
   * @param key
   * @returns Value or null
   */
  async gets<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;

    try {
      if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value) as T;
      }

      return value as T;
    } catch {
      Logger.error(`Failed to parse JSON for key: ${key}`);
      return value as T;
    }
  }

  /**
   * Redis 키 값 설정
   *
   * @param key
   * @param value
   */
  async set(key: string, value: string | number) {
    return this.redis.set(key, value);
  }

  async lpush(key: string, value: string) {
    return this.redis.lpush(key, value);
  }

  async expire(key: string, seconds: number) {
    return this.redis.expire(key, seconds);
  }

  async ltrim(key: string, start: number, stop: number) {
    return this.redis.ltrim(key, start, stop);
  }

  async smembers(key: string) {
    return this.redis.smembers(key);
  }

  async setex(key: string, seconds: number, value: string) {
    return this.redis.setex(key, seconds, value);
  }

  async sadd(key: string, value: string) {
    return this.redis.sadd(key, value);
  }

  async sismember(key: string, value: string) {
    return this.redis.sismember(key, value);
  }

  async lrange(key: string, start: number, stop: number) {
    return this.redis.lrange(key, start, stop);
  }

  async lrem(key: string, count: number, value: string) {
    return this.redis.lrem(key, count, value);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  async flushall() {
    return this.redis.flushall();
  }
}
