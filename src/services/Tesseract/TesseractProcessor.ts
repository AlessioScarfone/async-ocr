import path from "path";
import Tesseract, { createScheduler, RecognizeResult } from "tesseract.js";
import IProcessor from "../../models/IProcessor";
import { ACCEPTED_LANGUAGE } from "./TesseractTypes";

// const langPath = path.join(__dirname, 'lang')
// console.log("LANG LOCAL PATH:", langPath, "\n \n");

// const recognize = async (imgUrl: string, lang: string) => {
//     try {
//         const worker = Tesseract.createWorker({ langPath })
//         await worker.load();
//         await worker.loadLanguage(lang);
//         await worker.initialize(lang);
//         const data = await worker.recognize(imgUrl);
//         await worker.terminate();
//         return data;
//     } catch (error) {
//         console.log("Tesseract recognize error: ", { imgUrl, lang }, error)
//     }
// }

type TesseractProcessorInput = {
    imgUrl: string;
}
type TesseractProcessorOutput = {
    confidence: number;
    text: string;
}

class TesseractProcessor implements IProcessor<TesseractProcessorInput, TesseractProcessorOutput> {
    private langPath: string;
    private lang: string;
    private worker!: Tesseract.Worker;

    constructor(lang: string, langPath?: string) {
        if (!ACCEPTED_LANGUAGE.includes(lang))
            throw new Error("lang '" + lang + "' not supported")

        this.langPath = langPath || path.join(__dirname, 'lang');
        this.lang = lang;
        console.log("TesseractProcessor: constructor:", { lang: this.lang, langPath: this.langPath })
    }

    public async init(): Promise<string> {
        try {
            this.worker = Tesseract.createWorker({ langPath: this.langPath });
            await this.worker.load();
            await this.worker.loadLanguage(this.lang);
            await this.worker.initialize(this.lang);
            return `TesseractProcessor: init END - lang [${this.lang}]`
        } catch (err) {
            throw new Error("TesseractProcessor: Error init TesseractWorker: " + err)
        }
    }

    public async destroy(): Promise<Tesseract.ConfigResult> {
        return this.worker.terminate();
    }

    public async process(input: TesseractProcessorInput) {
        if (input.imgUrl) {
            await this.init();
            const ocrResult = await this.worker.recognize(input?.imgUrl);
            const result: TesseractProcessorOutput = {
                confidence: ocrResult?.data?.confidence,
                text: ocrResult?.data?.text
            }
            await this.destroy()
            return result;
        } else {
            throw new Error("imgUrl not found");
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


export { TesseractProcessorInput, TesseractProcessorOutput }
export default TesseractProcessor