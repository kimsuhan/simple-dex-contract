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
}
