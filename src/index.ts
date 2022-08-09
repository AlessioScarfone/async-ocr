import { Server } from "http";
import env from "./config/env";
import createApp, { EXPRESS_CONTEXT_KEY } from "./app";
import RedisClient from "./services/Redis/RedisClient";
import RedisBullQueueManger from "./services/Redis/RedisBullQueueManager";
import tesseractProcessorFactory from "./services/Tesseract/TesseractProcessor";

const RECOGNIZE_QUEUE_ENG = env.redis.queuePrefix + "eng";

const redisClient: RedisClient = RedisClient.getInstance();
const bullQueueManger = RedisBullQueueManger.getInstance();

bullQueueManger.createQueue(RECOGNIZE_QUEUE_ENG);

const app = createApp();

Promise.all([
    redisClient.connect(),
]).then(async () => {

    // bullQueueManger.addProcessorOnQueue(RECOGNIZE_QUEUE_ENG,  (j,done) => {console.log("process", j.data); done()})
    bullQueueManger.addProcessorOnQueue(
        RECOGNIZE_QUEUE_ENG,
        tesseractProcessorFactory('eng', redisClient)
    )

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
                bullQueueManger.disconnect(),
            ]).then(() => {
                console.log("SIGTERM END")
            }).catch(err => {
                console.log("SIGTERM ERROR 1:", err);
                process.exit(1);
            })
        })
    })
}


