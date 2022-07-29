import env from "./config/env";
import createApp from "./app";
import RedisClient from "./services/Redis/RedisClient";
import RedisPublisher from "./services/Redis/RedisPublisher";
import RedisSubscriber from "./services/Redis/RedisSubscriber";
import { Server } from "http";
import RedisRequestModel from "./models/RedisRequest.model";
import TesseractProcessor, { TesseractProcessorInput } from "./services/Tesseract/TesseractProcessor";

const app = createApp();

const redisClient: RedisClient = RedisClient.getInstance();
const redisPublisher = new RedisPublisher<RedisRequestModel>(redisClient.client, env.redis.channelPubSub);
const redisSubscriber = new RedisSubscriber<RedisRequestModel>(redisClient.client, env.redis.channelPubSub);
const tesseractProcessor_eng: TesseractProcessor = new TesseractProcessor('eng');
Promise.all([
    redisClient.connect(),
    redisPublisher.connect(),
    redisSubscriber.connect(),
]).then(async () => {
    try {
        await redisSubscriber.subscribe(async (msg: RedisRequestModel) => { 
            const input: TesseractProcessorInput = {
                imgUrl: msg.value.url
            }
            const res = await tesseractProcessor_eng.process(input)
            await redisClient.writeMessage(msg.key, res);
            console.log("Message Processsed: ", msg.key, input)
        })
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







