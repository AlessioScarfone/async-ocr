import { Server } from "http";
import env from "./config/env";
import createApp, { EXPRESS_CONTEXT_KEY } from "./app";
import RedisClient from "./services/Redis/RedisClient";
// import RedisPublisher from "./services/Redis/RedisPublisher";
// import RedisSubscriber from "./services/Redis/RedisSubscriber";
// import RedisRequestModel from "./models/RedisRequest.model";
import TesseractProcessor, { TesseractProcessorInput } from "./services/Tesseract/TesseractProcessor";
import RedisQueueManger from "./services/Redis/RedisQueueManager";
import RedisQueueWorker from "./services/Redis/RedisQueueWorker";
import RedisRequestModel from "./models/RedisRequest.model";

const app = createApp();

const redisClient: RedisClient = RedisClient.getInstance();
// const redisPublisher = new RedisPublisher<RedisRequestModel>(redisClient.client, env.redis.channelPubSub);
// const redisSubscriber = new RedisSubscriber<RedisRequestModel>(redisClient.client, env.redis.channelPubSub);
const tesseractProcessor_eng: TesseractProcessor = new TesseractProcessor('eng');
const rqm: RedisQueueManger = new RedisQueueManger();
const RECOGNIZE_QUEUE_ENG = env.redis.queuePrefix + "eng";


Promise.all([
    redisClient.connect(),
    // redisPublisher.connect(),
    // redisSubscriber.connect(),
]).then(async () => {
    try {
        await rqm.createQueue(RECOGNIZE_QUEUE_ENG);

        new RedisQueueWorker(RECOGNIZE_QUEUE_ENG,
            async (msg: any) => {
                // console.log("RQW - Message: ", msg);
                const parsedMsg = JSON.parse(msg) as RedisRequestModel;
                
                const input: TesseractProcessorInput = {
                    ...parsedMsg.value
                }
                // console.log("TesseractProcessorInput:", input);
                const tesseractOutput = await tesseractProcessor_eng.process(input);
                await redisClient.writeMessage(parsedMsg.key, tesseractOutput);
                console.log("RQW - Message Processed: ", parsedMsg.key, tesseractOutput)
            }
        )

        // await redisSubscriber.subscribe(async (msg: RedisRequestModel) => { 
        //     const input: TesseractProcessorInput = {
        //         imgUrl: msg.value.url
        //     }
        //     console.log("Message: ", msg.key, input)
        //     const res = await tesseractProcessor_eng.process(input)
        //     await redisClient.writeMessage(msg.key, res);
        //     console.log("Message Processed: ", msg.key)
        // })
    } catch (err) {
        throw new Error("Redis Subscription Error: " + err);
    }

    app.set(EXPRESS_CONTEXT_KEY.REDIS_QUEUE_MANAGER, rqm);
    app.set(EXPRESS_CONTEXT_KEY.REDIS_CLIENT, redisClient);

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
                rqm.disconnect()
                // redisPublisher.disconnect(),
                // redisSubscriber.unsubscribe()
            ]).then(() => {
                // redisSubscriber.disconnect().then(() => {
                //     process.exit(0);
                // }).catch(err => {
                //     console.log("SIGTERM ERROR 2:", err);
                //     process.exit(1);
                // })
            }).catch(err => {
                console.log("SIGTERM ERROR 1:", err);
                process.exit(1);
            })
        })
    })
}







