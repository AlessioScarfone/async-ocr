import AbstractRedisService, { CreateRedisClientType } from "./AbstractRedisService";

export default abstract class AbstractRedisServiceQueue extends AbstractRedisService {
    protected channel: string;

    constructor(client: CreateRedisClientType, channel: string) {
        super();
        this.init(client);
        this.channel = channel;
    }

}