import { CreateRedisClientType } from "./AbstractRedisService";
import AbstractRedisServiceQueue from "./AbstractRedisServiceQueue";

export default class RedisSubscriber extends AbstractRedisServiceQueue {
    private subscriber: CreateRedisClientType;

    constructor(client: CreateRedisClientType, channel: string) {
        super(client, channel);
        this.subscriber = this.client.duplicate();

        this.initEventListener(this.client, "client")
    }

    //** Call after connect */
    public async subscribe(handler: (msg: string) => void): Promise<void> {
        if (this.connected) {
            return this.subscriber.subscribe(this.channel, (message) => {
                // console.log("Subscriber Read:", message)
                handler(message);
            })
        } else {
            return Promise.reject("Redis Subscriber not connected");
        }
    }

    protected async disconnectMethod(): Promise<void> {
        return this.subscriber.disconnect();
    }

    public async unsubscribe(): Promise<void> {
        return this.subscriber.unsubscribe()
    }

    public async connect(): Promise<void> {
        return this.subscriber.connect();
    }

}