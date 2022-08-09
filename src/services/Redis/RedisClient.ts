import { createClient } from "redis";
import env from "../../config/env";
import AbstractRedisService from "./AbstractRedisService";

export default class RedisClient extends AbstractRedisService {
    private static instance: RedisClient;

    private constructor() {
        super();
        const client = createClient({
            url: `redis://${env.redis.host}:${env.redis.port}`,
            password: env.redis.password,
            username: env.redis.user,
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
            if(key) {
                return this.client.set(key, JSON.stringify(message), {
                    EX: env.redis.expiracy || 21600,
                    NX: true
                })
            } else {
                return Promise.reject(`Redis Client writeMessage - key is missing. msg [ ${message} ]`);  
            }
        } else {
            return Promise.reject("Redis Client not ready");
        }
    }

    public async readMessage(key: string): Promise<string | null> {
        if (this.ready) {
            return this.client.get(key)
        } else {
            return Promise.reject("Redis Client not ready");
        }
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }

        return RedisClient.instance;
    }
}
