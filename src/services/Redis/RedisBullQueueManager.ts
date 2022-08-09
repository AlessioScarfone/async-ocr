import Queue, { JobOptions } from "bull";
import env from "../../config/env";

const DEFAULT_QUEUE_OPTS = {
    removeOnComplete: true
}

/**
 * Bull Reference: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md
 */
export default class RedisBullQueueManger {

    private queueList: Map<string, Queue.Queue<any>> = new Map();

    public createQueue(qname: string): Queue.Queue<any> {
        if (!qname)
            throw new Error("Queue name not valid");

        const queue = new Queue(qname, {
            redis: {
                host: env.redis.host,
                port: parseInt(env.redis.port, 10),
                password: env.redis.password,
                username: env.redis.user,
            }
        })

        this.queueList.set(qname, queue);
        console.log(`> Queue [${queue.name}] ready`)

        return queue;
    }

    public getQueue(qname: string): Queue.Queue<any> | undefined {
        return this.queueList.get(qname)
    }

    /**
     * Add message to a specific queue
     * @param qname : queue name
     * @param msg : obj to add to the queue
     * @param addOpts : https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
     */
    public sendMessage(qname: string, msg: any, addOpts: JobOptions = {}): Promise<Queue.Job<any>> | undefined {
        this.checkIfQueueExist(qname);
        if (msg == null || msg == undefined)
            throw Error(`Message not valid`)

        addOpts = { ...addOpts, ...DEFAULT_QUEUE_OPTS }
        return this.queueList.get(qname)?.add(msg, addOpts);
    }

    public addProcessorOnQueue(qname: string, fn: Queue.ProcessCallbackFunction<any>) {
        this.checkIfQueueExist(qname);
        this.queueList.get(qname)?.process(fn);
    }

    public disconnect(): Promise<void>[] {
        if (this.queueList.size == 0)
            return [Promise.resolve()];

        const closePromise = Array.from(this.queueList).map(([key, value]) => {
            console.log(`Closing queue: ${key}`)
            return value.close()
        });
        return closePromise;
    }


    private checkIfQueueExist(qname: string) {
        if (!this.queueList.has(qname))
            throw Error(`[${qname}] queue not exist.`)
    }

}