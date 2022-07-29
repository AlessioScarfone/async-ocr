import path from "path";
import Tesseract from "tesseract.js";
import IProcessor from "../../models/IProcessor";

const langPath = path.join(__dirname, 'lang')
console.log("LANG LOCAL PATH:", langPath, "\n \n");

const recognize = async (imgUrl: string, lang: string) => {
    try {
        const worker = Tesseract.createWorker({ langPath })
        await worker.load();
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        const data = await worker.recognize(imgUrl);
        await worker.terminate();
        return data;
    } catch (error) {
        console.log("Tesseract recognize error: ", { imgUrl, lang }, error)
    }
}

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
    private worker: Tesseract.Worker;

    constructor(langPath: string, lang: string) {
        this.langPath = langPath;
        this.lang = lang;
        this.worker = Tesseract.createWorker({ langPath: this.langPath });
    }

    public async init(): Promise<string> {
        try {
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
            const ocrResult = await this.worker.recognize(input?.imgUrl);
            const result: TesseractProcessorOutput = {
                confidence: ocrResult?.data?.confidence,
                text: ocrResult?.data?.text
            }
            return result;
        } else {
            throw new Error("imgUrl not found");
        }
    }

}


export { recognize, TesseractProcessorInput, TesseractProcessorOutput }
export default TesseractProcessor