export declare class RedisService {
    private readonly redis;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<"OK">;
    lpush(key: string, value: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ltrim(key: string, start: number, stop: number): Promise<"OK">;
    smembers(key: string): Promise<string[]>;
    setex(key: string, seconds: number, value: string): Promise<"OK">;
    sadd(key: string, value: string): Promise<number>;
    sismember(key: string, value: string): Promise<number>;
    lrange(key: string, start: number, stop: number): Promise<string[]>;
    lrem(key: string, count: number, value: string): Promise<number>;
}
