import RSMQWorker from 'rsmq-worker';
import env from '../../config/env';

export default class RedisQueueWorker {
    private queueName: string;
    worker: RSMQWorker.Client;

    constructor(queueName: string, onMessageCallback: (obj: any) => any) {
        this.queueName = queueName;
        this.worker = new RSMQWorker(this.queueName, {
            interval: .1,
            options: {
                host: env.redis.host,
                port: parseInt(env.redis.port, 10),
                password: env.redis.password,
                options: {
                    username: env.redis.user,
                }
            }
        });

        this.worker.on("message", function (msg, next, id) {
            // process your message
            console.log("Message id : " + id);
            console.log(msg);
            onMessageCallback(msg);
            next()
        });

        // optional error listeners
        this.worker.on('error', function (err, msg) {
            console.log("ERROR", err, msg.id);
        });

        this.worker.on('exceeded', function (msg) {
            console.log("EXCEEDED", msg.id);
        });

        this.worker.on('timeout', function (msg) {
            console.log("TIMEOUT", msg.id, msg.rc);
        });

        this.worker.start();
        console.log(`RSMQ WORKER START - queue: [${queueName}]` )
    }
}