import { Server } from "http";
import env from "./config/env";
import createApp, { EXPRESS_CONTEXT_KEY } from "./app";
import RedisClient from "./services/Redis/RedisClient";
import RedisBullQueueManger from "./services/Redis/RedisBullQueueManager";
import tesseractProcessorFactory from "./services/Tesseract/TesseractProcessor";

const app = createApp();

const redisClient: RedisClient = RedisClient.getInstance();
const RECOGNIZE_QUEUE_ENG = env.redis.queuePrefix + "eng";
const bullQueueManger = new RedisBullQueueManger();

Promise.all([
    redisClient.connect(),
]).then(async () => {
    try {
        bullQueueManger.createQueue(RECOGNIZE_QUEUE_ENG);
        // bullQueueManger.addProcessorOnQueue(RECOGNIZE_QUEUE_ENG,  (j,done) => {console.log("process", j.data); done()})

        bullQueueManger.addProcessorOnQueue(
            RECOGNIZE_QUEUE_ENG,
            tesseractProcessorFactory('eng', redisClient)
        )

    } catch (err) {
        throw new Error("Redis Subscription Error: " + err);
    }

    app.set(EXPRESS_CONTEXT_KEY.REDIS_QUEUE_MANAGER, bullQueueManger);
    app.set(EXPRESS_CONTEXT_KEY.REDIS_CLIENT, redisClient);

    //start server
    const server = app.listen(
        env.port,
        () => {
            console.log(`🚀 Server ready at http://localhost:${env.port}`);
            console.log(`🗒 Node Env: ${env.node_env} \n`)
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
            ]).then(() => {
                //
            }).catch(err => {
                console.log("SIGTERM ERROR 1:", err);
                process.exit(1);
            })
        })
    })
}








