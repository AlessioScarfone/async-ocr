import { createClient } from "redis";

export type CreateRedisClientType = ReturnType<typeof createClient>;

export default abstract class AbstractRedisService {
    public client!: CreateRedisClientType
    protected ready = false;
    protected connected = false;
    private label = "";


    public init(client: CreateRedisClientType, label = "") {
        this.client = client;
        this.label = label;
    }

    public initEventListener(client: CreateRedisClientType) {
        client.on('connect', () => {
            console.log(`>> Redis Client [${this.label}] : connect <<`);
            this.connected = true;
        });

        client.on('ready', () => {
            console.log(`>> Redis Client [${this.label}] : ready <<`);
            this.ready = true;
        });

        client.on('error', () => {
            console.log(`>> Redis Client [${this.label}] : error <<`);
            this.ready = false;
            this.connected = false;
        });

        client.on('end', () => {
            console.log(`>> Redis Client [${this.label}] : end <<`);
            this.ready = false;
            this.connected = false;
        });
        // this.client.on('reconnecting', () => console.log('Redis Client reconnecting'));
    }

    public disconnect(): Promise<void> {
        if (this.connected)
            return this.disconnectMethod();
        else {
            console.log(`>> Redis Client [${this.label}] : Already Disconnected <<`)
            return Promise.resolve();
        }
    }

    protected abstract disconnectMethod(): Promise<void>;

    public abstract connect(): Promise<void>;
}