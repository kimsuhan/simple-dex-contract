import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('keys')
  @ApiOperation({ summary: 'Redis 키 목록 조회' })
  @ApiOkResponse({ description: 'Redis 키 목록', type: [String] })
  async getKeys() {
    return await this.redisService.getKeys();
  }

  @Get('keys/:key')
  @ApiOperation({ summary: 'Redis 키 값 조회' })
  @ApiOkResponse({ description: 'Redis 키 값', type: String })
  async getKey(@Param('key') key: string) {
    return await this.redisService.get(key);
  }
}
