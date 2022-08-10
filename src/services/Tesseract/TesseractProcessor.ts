import Queue, { Job } from "bull";
import { getErrorMessage } from "../../models/Error";
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
        let tesseractOutput: TesseractWorkerOutput | null = null;
        try {
            tesseractOutput = await tesseractWorker.process(input);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            if (errorMessage.match(/.*reason:.*getaddrinfo.*ENOTFOUND.*/)) {
                const errorToReturn = errorMessage.substring(errorMessage.indexOf("reason")).replace(/"|'/g,"");
                // console.log("Fetch Image Error: ", err);
                tesseractOutput = { error: errorToReturn }
            }
        }
        job.returnvalue = tesseractOutput
        console.log(`Process job [${job?.id}] - Result - id: [${msg.key}]`,  tesseractOutput, job.returnvalue);
        job.log("Process complete; write result on redis: " + JSON.stringify(tesseractOutput));
        await redisClient.writeMessage(msg.key, tesseractOutput);
        await job.progress(100);
        return Promise.resolve();
    }
}

export default tesseractProcessorFactory