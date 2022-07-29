import env from "./config/env";
import createApp from "./app";
import RedisClient from "./services/Redis/RedisClient";
import RedisPublisher from "./services/Redis/RedisPublisher";
import RedisSubscriber from "./services/Redis/RedisSubscriber";
import { Server } from "http";

const app = createApp();

const redisClient: RedisClient = RedisClient.getInstance();
const redisPublisher = new RedisPublisher(redisClient.client, env.redis.channelPubSub);
const redisSubscriber = new RedisSubscriber(redisClient.client, env.redis.channelPubSub);

Promise.all([
    redisClient.connect(),
    redisPublisher.connect(),
    redisSubscriber.connect(),
]).then(async () => {
    //TODO: define ocr worker + write response on redis
    try {
        await redisSubscriber.subscribe((msg: string) => { console.log("subscribe msg handler", msg) })
    } catch (err) {
        throw new Error("Redis Subscription Error: " + err);
    }

    app.set("redisPublisher", redisPublisher);
    app.set("redisClient", redisClient);

    //start server
    const server = app.listen(
        env.port,
        () => {
            console.log(`🚀 Server ready at http://localhost:${env.port}`);
            console.log(`🗒 Node Env: ${env.node_env}`)
        }
    );

    addSIGTERMListener(server);

}).catch(err => {
    console.log("Redis connection error", err);
});



const addSIGTERMListener = (server: Server) => {
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close((er: Error | undefined) => {
            console.log('HTTP server closed. Error:', er);

            Promise.all([
                redisClient.disconnect(),
                redisPublisher.disconnect(),
                redisSubscriber.unsubscribe()
            ]).then(() => {
                redisSubscriber.disconnect().then(() => {
                    process.exit(0);
                }).catch(err => {
                    console.log("SIGTERM ERROR 2:", err);
                    process.exit(1);
                })
            }).catch(err => {
                console.log("SIGTERM ERROR 1:", err);
                process.exit(1);
            })
        })
    })
}







