import { createClient } from "redis";
import env from "../../config/env";
import RedisConnectionOption from "../../config/redisConnection";
import AbstractRedisService from "./AbstractRedisService";

export default class RedisClient extends AbstractRedisService {
    private static instance: RedisClient;

    private constructor() {
        super();

        const connOption: any = {
            url: RedisConnectionOption.url,
        }

        if (RedisConnectionOption.password)
            connOption.password = RedisConnectionOption.password
        if (RedisConnectionOption.username)
            connOption.password = RedisConnectionOption.username

        const client = createClient({
            ...connOption
        });
        this.init(client, "Client");
        this.initEventListener(this.client)
    }

    protected async disconnectMethod(): Promise<void> {
        return this.client.disconnect();
    }

    public async connect(): Promise<void> {
        return this.client.connect();
    }

    public async ping(): Promise<string> {
        return this.client.ping();
    }

    public async writeMessage(key: string, message: any): Promise<string | null> {
        if (this.ready) {
            // console.log("Redis Write message", key, message);
            if (key) {
                return this.client.set(key, JSON.stringify(message), {
                    EX: env.redis.expiracy || 21600,
                    NX: true
                })
            } else {
                return Promise.reject(new Error(`Redis Client writeMessage - key is missing. msg [ ${message} ]`));
            }
        } else {
            return Promise.reject(new Error("Redis Client not ready"));
        }
    }

    public async readMessage(key: string): Promise<string | null> {
        if (this.ready) {
            return this.client.get(key)
        } else {
            return Promise.reject(new Error("Redis Client not ready"));
        }
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }

        return RedisClient.instance;
    }
}
