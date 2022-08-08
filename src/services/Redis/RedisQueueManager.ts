import RedisSMQ from "rsmq";
import env from "../../config/env";

export default class RedisQueueManger {
    rsmq: RedisSMQ;

    constructor() {
        this.rsmq = new RedisSMQ({
            host: env.redis.host,
            port: parseInt(env.redis.port, 10),
            password: env.redis.password,
            options: {
                username: env.redis.user,
            }
        });
    }

    public async createQueue(qname: string): Promise<1 | undefined> {
        try {
            return await this.rsmq.createQueueAsync({ qname })
        } catch (err: any) {
            if (err) {
                if (err.name !== "queueExists") {
                    console.error(err?.message);
                } else {
                    console.log(`RedisQueueManager: the queue [${qname}] already exists.`);
                }
            }
        }
        console.log(`> Queue [${qname}] ready`)
    }

    public disconnect(): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise((resolve, reject) => {
            this.rsmq.quit(() => {
                console.log("RedisQueueManager Disconnected");
                resolve("RedisQueueManager Disconnected")
            });
        })
    }

}