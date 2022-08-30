import path from "path";
import Tesseract from "tesseract.js";
import env from "../../config/env";
import { getErrorMessage } from "../../models/Error";
import IWorker from "../../models/IWorker";
import { OCRWorkerInput } from "./OCRWorkerInput";
import { OCRWorkerOutput } from "./OCRWorkerOutput";
import { ACCEPTED_LANGUAGE } from "./TesseractTypes";

class TesseractWorker implements IWorker<OCRWorkerInput, OCRWorkerOutput> {
    private langPath: string;
    private worker!: Tesseract.Worker;

    constructor(langPath?: string) {

        // this.langPath = langPath || path.join(__dirname, 'lang');
        //Lang traindata in root folder
        this.langPath = langPath || path.join(__dirname, '..','..','..');
        console.log("TesseractWorker created:", { langPath: this.langPath })
    }

    public async destroy(): Promise<Tesseract.ConfigResult> {
        return this.worker.terminate();
    }

    public async process(input: OCRWorkerInput) {
        if (env.log.tesseractCoreEnabled) {
            console.log("TesseractWorker#process Start:", { 
                lang: input.lang, 
                img: typeof input?.img === 'string' ? input?.img : '< Buffer >', 
                isFile: input.isFile,
                requestId: input.requestId
            });
        }
        
        if (input.img && input.lang) {
            const timerId= "process time [" + input.lang + " - " + input.requestId + "]";
            console.time(timerId)
            
            try {
                if (!ACCEPTED_LANGUAGE.includes(input.lang))
                    throw new Error("lang '" + input.lang + "' not supported")
                
                let inputImg = input.img;
                if(input.isFile) {
                    inputImg = Buffer.from(input.img);
                }

                const ocrResult = await Tesseract.recognize(inputImg, input.lang, {
                    gzip: false,
                    langPath: this.langPath,
                    errorHandler: (err) => {
                        const errorMessage = getErrorMessage(err);
                        console.log(" !! Tesseract Core ERROR:", errorMessage, "; INPUT:", input)
                    },
                    logger: m => {
                        if (env.log.tesseractCoreEnabled)
                            console.log(":: Tesseract Core:", m)
                    }
                });
                const result: OCRWorkerOutput = {
                    confidence: ocrResult?.data?.confidence,
                    text: ocrResult?.data?.text
                }
                console.timeEnd(timerId)
                return result;
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                console.error("TesseractWorker error: " + errorMessage)
                return Promise.reject(errorMessage)
            }
        } else {
            throw new Error("Processor: Input not valid");
        }
    }

}

export default TesseractWorker