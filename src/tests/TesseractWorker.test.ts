import { readFileSync } from 'fs';
import 'jest'
import path from 'path';
import { OCRWorkerInput } from '../services/Tesseract/OCRWorkerInput';
import TesseractWorker from '../services/Tesseract/TesseractWorker'
import TesseractWorkerV2 from '../services/Tesseract/TesseractWorkerV2';
jest.setTimeout(15000);

const testImg1 = {
    url: "https://tesseract.projectnaptha.com/img/eng_bw.png",
    lang: 'eng',
    result: 'Mild Splendour of the various-vested Night!\n' +
        'Mother of wildly-working visions! hail!\n' +
        'I watch thy gliding, while with watery light\n' +
        'Thy weak eye glimmers through a fleecy veil;\n' +
        'And when thou lovest thy pale orb to shroud\n' +
        'Behind the gather’d blackness lost on high;\n' +
        'And when thou dartest from the wind-rent cloud\n' +
        'Thy placid lightning o’er the awaken’d sky.\n'
}

const testImg2 = {
    url: "https://docs.unity3d.com/Packages/com.unity.textmeshpro@3.2/manual/images/TMP_RichTextLineIndent.png",
    lang: 'eng',
    result: 'This is the first line of\n' +
        'this text example.\n' +
        '\n' +
        'This is the second line\n' +
        'of the same text.\n'
}

describe('TesseractWorker V1 Test', () => {
    let worker: TesseractWorker;

    beforeAll(async () => {
        worker = new TesseractWorker();
    });

    it.skip("process image by url (1)", async () => {
        const res = await worker.process(new OCRWorkerInput(testImg1.url, 'eng', false));
        expect(res?.confidence).not.toBeNull();
        expect(res?.text).toEqual(testImg1.result);
    })

    it.skip("process image by url (2)", async () => {
        const res = await worker.process(new OCRWorkerInput(testImg2.url, 'eng', false));
        expect(res?.confidence).not.toBeNull();
        expect(res?.text).toEqual(testImg2.result);
    })

    it.skip("multiple process image by url (1) - 10 iterations", async () => {
        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
            const res = await worker.process(new OCRWorkerInput(testImg1.url, 'eng', false));
            expect(res?.confidence).not.toBeNull();
            expect(res?.text).toEqual(testImg1.result);
            console.log("Done: " + i + "/" + iterations)
        }
    })

    it("process image from file", async () => {
        const buf = readFileSync(path.join(__dirname, "assets/eng_bw.png"));
        const res = await worker.process(new OCRWorkerInput(buf, 'eng', true));
        expect(res?.confidence).not.toBeNull();
        expect(res?.text).toEqual(testImg1.result);
    })
})


describe('TesseractWorker V2 Test', () => {
    let worker: TesseractWorkerV2;

    beforeAll(async () => {
        worker = new TesseractWorkerV2('eng');
        await worker.init();
    });

    afterAll(async () => {
        await worker.destroy()
    })

    it("process image from file", async () => {
        const buf = readFileSync(path.join(__dirname, "assets/eng_bw.png"));
        const res = await worker.process(new OCRWorkerInput(buf, 'eng', true));
        expect(res?.confidence).not.toBeNull();
        expect(res?.text).toEqual(testImg1.result);
    })

    it("process image from file (multiple time)", async () => {
        const buf = readFileSync(path.join(__dirname, "assets/eng_bw.png"));
        for (let it = 0; it < 5; it++) {
            const res = await worker.process(new OCRWorkerInput(buf, 'eng', true));
            expect(res?.confidence).not.toBeNull();
            expect(res?.text).toEqual(testImg1.result);
        }
    })
});