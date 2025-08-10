export declare class RedisService {
    private readonly redis;
    constructor();
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<"OK">;
}
