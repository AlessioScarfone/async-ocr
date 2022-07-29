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
        this.init(client);
        this.initEventListener(this.client, "client")
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

    public async writeMessage(key: string, message: any) {
        if (this.ready) {
            return this.client.set(key, JSON.stringify(message), {
                EX: env.redis.expiracy,
                NX: true
            })
                .then(d => { console.log("Write OK:", d) })
                .catch(e => { console.log("Write KO:", e) })
        } else {
            throw new Error("Redis Client not ready");
        }
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }

        return RedisClient.instance;
    }
}
