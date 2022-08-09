import Queue, { Job } from "bull";
import RedisRequestModel from "../../models/RedisRequest.model";
import RedisClient from "../Redis/RedisClient";
import TesseractWorker, { TesseractWorkerInput, TesseractWorkerOutput } from "./TesseractWorker";

const tesseractProcessorFactory = (lang: string, redisClient: RedisClient): Queue.ProcessPromiseFunction<any> => {
    const tesseractWorker: TesseractWorker = new TesseractWorker(lang);

    return async (job: Job) => {
        console.log("START JOB PROCESSOR", job?.id);
        const msg = job?.data as RedisRequestModel;
        console.log(`Process job [${job?.id}] - Message: `, msg);

        const input: TesseractWorkerInput = {
            ...msg.value
        }
        // console.log("TesseractProcessorInput:", input);
        const tesseractOutput: TesseractWorkerOutput = await tesseractWorker.process(input);
        console.log(`Process job [${job?.id}] - Result`, msg.key, tesseractOutput)
        await redisClient.writeMessage(msg.key, tesseractOutput);
        return Promise.resolve();
    }
}

export default tesseractProcessorFactory