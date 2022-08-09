import { Server } from "http";
import env from "./config/env";
import createApp, { EXPRESS_CONTEXT_KEY } from "./app";
import RedisClient from "./services/Redis/RedisClient";
import TesseractWorker, { TesseractWorkerInput, TesseractWorkerOutput } from "./services/Tesseract/TesseractWorker";
import RedisRequestModel from "./models/RedisRequest.model";
import RedisBullQueueManger from "./services/Redis/RedisBullQueueManager";
import { Job } from "bull";

const app = createApp();

const redisClient: RedisClient = RedisClient.getInstance();
const tesseractWorker_eng: TesseractWorker = new TesseractWorker('eng');
const RECOGNIZE_QUEUE_ENG = env.redis.queuePrefix + "eng";
const bullQueueManger = new RedisBullQueueManger();

Promise.all([
    redisClient.connect(),
]).then(async () => {
    try {
        bullQueueManger.createQueue(RECOGNIZE_QUEUE_ENG);
        // bullQueueManger.addProcessorOnQueue(RECOGNIZE_QUEUE_ENG,  (j,done) => {console.log("process", j.data); done()})

        bullQueueManger.addProcessorOnQueue(RECOGNIZE_QUEUE_ENG,
            async (job: Job) => {
                console.log("START JOB PROCESSOR", job?.id);
                const msg = job?.data as RedisRequestModel;
                console.log(`Process job [${job?.id}] - Message: `, msg);

                const input: TesseractWorkerInput = {
                    ...msg.value
                }
                // console.log("TesseractProcessorInput:", input);
                const tesseractOutput: TesseractWorkerOutput = await tesseractWorker_eng.process(input);
                console.log(`Process job [${job?.id}] - Result`, msg.key, tesseractOutput)
                await redisClient.writeMessage(msg.key, tesseractOutput);
                return Promise.resolve();
            }
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








