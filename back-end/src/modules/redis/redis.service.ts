import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string) {
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
}
