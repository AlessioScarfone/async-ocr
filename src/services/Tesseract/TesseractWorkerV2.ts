import path from "path";
import Tesseract from "tesseract.js";
import env from "../../config/env";
import { getErrorMessage } from "../../models/Error";
import IWorker from "../../models/IWorker";
import { OCRWorkerInput } from "./OCRWorkerInput";
import { OCRWorkerOutput } from "./OCRWorkerOutput";
import { ACCEPTED_LANGUAGE } from "./TesseractTypes";

class TesseractWorkerV2 implements IWorker<OCRWorkerInput, OCRWorkerOutput> {
    private langPath: string;
    private lang: string;
    private worker!: Tesseract.Worker;

    constructor(lang: string) {
        if (!ACCEPTED_LANGUAGE.includes(lang))
            throw new Error("lang '" + lang + "' not supported")

        this.langPath = path.join(__dirname, '..', '..', '..');
        this.lang = lang;
        console.log("TesseractWorkerV2 created:", { langPath: this.langPath, lang: this.lang })
    }

    public async init(): Promise<string> {
        try {
            this.worker = Tesseract.createWorker({
                langPath: this.langPath,
                gzip: false,
                errorHandler: (err) => {
                    const errorMessage = getErrorMessage(err);
                    console.log(" !! Tesseract Core ERROR:", errorMessage)
                },
                logger: m => {
                    if (env.log.tesseractCoreEnabled)
                        console.log(":: Tesseract Core:", m)
                }
            });
            await this.worker.load();
            await this.worker.loadLanguage(this.lang);
            await this.worker.initialize(this.lang);
            return `TesseractWorkerV2: init END - lang [${this.lang}]`
        } catch (err) {
            throw new Error("TesseractWorkerV2: Error init TesseractWorker: " + err)
        }
    }

    public async destroy(): Promise<Tesseract.ConfigResult> {
        return this.worker.terminate();
    }

    public async process(input: OCRWorkerInput) {
        if (env.log.tesseractCoreEnabled) {
            console.log("TesseractWorkerV2#process Start:", {
                lang: input.lang,
                img: typeof input?.img === 'string' ? input?.img : '< Buffer >',
                isFile: input.isFile,
                requestId: input.requestId
            });
        }

        if (input.img && input.lang) {
            const timerId = "process time [" + input.lang + " - " + input.requestId + "]";
            console.time(timerId)

            try {
                if (!ACCEPTED_LANGUAGE.includes(input.lang))
                    throw new Error(`lang '${input.lang}' not supported`)
                if (input.lang != this.lang)
                    throw new Error(`Wrong OCRWorkerInput lang [inputLang: ${input.lang}; workerLang: ${this.lang}]`)

                let inputImg = input.img;
                if (input.isFile) {
                    inputImg = Buffer.from(input.img);
                }

                const ocrResult = await this.worker.recognize(inputImg);
                const result: OCRWorkerOutput = {
                    confidence: ocrResult?.data?.confidence,
                    text: ocrResult?.data?.text
                }
                console.timeEnd(timerId)
                return result;
            } catch (err) {
                const errorMessage = getErrorMessage(err);
                console.error("TesseractWorkerV2 error: " + errorMessage)
                return Promise.reject(errorMessage)
            }
        } else {
            throw new Error("Processor: Input not valid");
        }
    }

}


export default TesseractWorkerV2