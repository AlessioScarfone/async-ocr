import Queue, { Job } from "bull";
import { getErrorMessage } from "../../models/Error";
import RedisRequestModel from "../../models/RedisRequest.model";
import RedisClient from "../Redis/RedisClient";
import TesseractWorker from "./TesseractWorker";
import { OCRWorkerOutput } from "./OCRWorkerOutput";
import { OCRWorkerInput } from "./OCRWorkerInput";
import IWorker from "../../models/IWorker";

const GENERIC_ERROR = "Generic error";

const tesseractProcessorFactory = (redisClient: RedisClient, worker?: IWorker<OCRWorkerInput, OCRWorkerOutput>): Queue.ProcessPromiseFunction<any> => {
    const tesseractWorker = worker || new TesseractWorker();

    return async (job: Job) => {
        const msg = job?.data as RedisRequestModel;
        console.log(`Start Process job [${job?.id}] - Message: `, msg);
        job.log("TeserractProcessor - Start");

        const input: OCRWorkerInput = {
            ...msg.value
        }
        // console.log("TesseractProcessorInput:", input);
        let tesseractOutput: OCRWorkerOutput | null = null;
        try {
            tesseractOutput = await tesseractWorker.process(input);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            if (errorMessage.match(/.*reason:.*getaddrinfo.*ENOTFOUND.*/)) {
                const errorToReturn = errorMessage.substring(errorMessage.indexOf("reason")).replace(/"|'/g,"");
                // console.log("Fetch Image Error: ", err);
                tesseractOutput = { error: errorToReturn }
            }
            else {
                tesseractOutput = { error: GENERIC_ERROR} 
            }
        }
        job.returnvalue = tesseractOutput
        console.log(`Process job [${job?.id}] - Result - id: [${msg.key}]`,  tesseractOutput);
        job.log("TeserractProcessor - END; write result on redis: " + JSON.stringify(tesseractOutput));
        await redisClient.writeMessage(msg.key, tesseractOutput);
        await job.progress(100);
        return Promise.resolve();
    }
}

export default tesseractProcessorFactory