import path from "path";
import Tesseract from "tesseract.js";
import { getErrorMessage } from "../../models/Error";
import IProcessor from "../../models/IProcessor";
import { OCRWorkerInput } from "./OCRWorkerInput";
import { OCRWorkerOutput } from "./OCRWorkerOutput";
import { ACCEPTED_LANGUAGE } from "./TesseractTypes";

class TesseractWorker implements IProcessor<OCRWorkerInput, OCRWorkerOutput> {
    private langPath: string;
    private worker!: Tesseract.Worker;

    constructor(langPath?: string) {

        this.langPath = langPath || path.join(__dirname, 'lang');
        console.log("TesseractProcessor created:", { langPath: this.langPath })
    }

    // public async init(): Promise<string> {
    //     try {
    //         this.worker = Tesseract.createWorker({ langPath: this.langPath });
    //         await this.worker.load();
    //         await this.worker.loadLanguage(this.lang);
    //         await this.worker.initialize(this.lang);
    //         return `TesseractProcessor: init END - lang [${this.lang}]`
    //     } catch (err) {
    //         throw new Error("TesseractProcessor: Error init TesseractWorker: " + err)
    //     }
    // }

    public async destroy(): Promise<Tesseract.ConfigResult> {
        return this.worker.terminate();
    }

    public async process(input: OCRWorkerInput) {
        if (input.url && input.lang) {
            // await this.init();
            // const ocrResult = await this.worker.recognize(input?.imgUrl);
            // const result: TesseractProcessorOutput = {
            //     confidence: ocrResult?.data?.confidence,
            //     text: ocrResult?.data?.text
            // }
            // await this.destroy();
            // return result;

            // V2
            try {
                if (!ACCEPTED_LANGUAGE.includes(input.lang))
                    throw new Error("lang '" + input.lang + "' not supported")

                const ocrResult = await Tesseract.recognize(input?.url, input.lang, {
                    gzip: true,
                    langPath: this.langPath,
                    errorHandler: (err) => {
                        const errorMessage = getErrorMessage(err);
                        console.log(" !! Nested tesseract ERROR:", errorMessage, "; INPUT:", input)
                    }
                });
                const result: OCRWorkerOutput = {
                    confidence: ocrResult?.data?.confidence,
                    text: ocrResult?.data?.text
                }
                return result;
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                console.error("Tesseract Worker error: " + errorMessage)
                return Promise.reject(errorMessage)
            }
        } else {
            throw new Error("Processor: Input not valid");
        }
    }

}


/*export class TesseractSchedulerProcessor implements IProcessor<TesseractProcessorInput, TesseractProcessorOutput> {
    private langPath: string;
    private lang: string;
    private worker: Tesseract.Worker;
    private scheduler: Tesseract.Scheduler;

    constructor(lang: string, langPath?: string) {
        if (!ACCEPTED_LANGUAGE.includes(lang))
            throw new Error("lang '" + lang + "' not supported")

        this.langPath = langPath || path.join(__dirname, 'lang');
        this.lang = lang;
        console.log("TesseractProcessor: constructor:", this.lang, this.langPath)

        this.scheduler = createScheduler();
        this.worker = Tesseract.createWorker({ langPath: this.langPath });
    }

    public async init(): Promise<string> {
        try {
            await this.worker.load();
            await this.worker.loadLanguage(this.lang);
            await this.worker.initialize(this.lang);
            this.scheduler.addWorker(this.worker);
            return `TesseractProcessor: init END - lang [${this.lang}]`
        } catch (err) {
            throw new Error("TesseractProcessor: Error init TesseractWorker: " + err)
        }
    }

    public async destroy(): Promise<Tesseract.ConfigResult> {
        
        return this.scheduler.terminate();
        
    }

    public async process(input: TesseractProcessorInput) {
        if (input.imgUrl) {
            const ocrResult: unknown = await this.scheduler.addJob('recognize', input.imgUrl);
            const result: TesseractProcessorOutput = {
                confidence: (ocrResult as RecognizeResult)?.data?.confidence,
                text: (ocrResult as RecognizeResult)?.data?.text
            }
            this.destroy();
            return result;
        } else {
            throw new Error("imgUrl not found");
        }
    }

}*/


export { OCRWorkerInput, OCRWorkerOutput as OCRWorkerOutput }
export default TesseractWorker