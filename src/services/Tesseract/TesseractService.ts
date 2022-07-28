import path from "path";
import Tesseract from "tesseract.js";

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


export { recognize }