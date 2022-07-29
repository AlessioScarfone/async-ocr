import { CreateRedisClientType } from "./AbstractRedisService";
import AbstractRedisServiceQueue from "./AbstractRedisServiceQueue";

export default class RedisPublisher extends AbstractRedisServiceQueue {
    private publisher: CreateRedisClientType;

    constructor(client: CreateRedisClientType, channel: string) {
        super(client, channel);
        this.publisher = this.client.duplicate();

        this.initEventListener(this.publisher, "Publisher-"+this.channel);
    }

    public async connect(): Promise<void> {
        return this.publisher.connect();
    }
    protected async disconnectMethod(): Promise<void> {
        return this.publisher.disconnect();
    }

    public async publish(message: any) {
        if (this.ready) {
            return this.publisher.publish(this.channel, message);
        } else {
            return Promise.reject("Redis Publisher not ready");
        }
    }
}