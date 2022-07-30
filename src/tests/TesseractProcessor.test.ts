import 'jest'
import TesseractProcessor from '../services/Tesseract/TesseractProcessor'
jest.setTimeout(15000);

describe('TesseractProcessor Client', () => {
    let processor: TesseractProcessor;
    const testImg1 = {
        url: "https://tesseract.projectnaptha.com/img/eng_bw.png",
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
        result: 'This is the first line of\n' +
            'this text example.\n' +
            '\n' +
            'This is the second line\n' +
            'of the same text.\n'
    }

    beforeAll(async () => {
        processor = new TesseractProcessor('eng');
    });

    it("process image by url (1)", async () => {
        const res = await processor.process({ imgUrl: testImg1.url });
        expect(res?.confidence).not.toBeNull();
        expect(res?.text).toEqual(testImg1.result);
    })

    it("process image by url (2)", async () => {
        const res = await processor.process({ imgUrl: testImg2.url });
        expect(res?.confidence).not.toBeNull();
        expect(res?.text).toEqual(testImg2.result);
    })

    it("Multiple process image by url (1) - 10 iterations", async () => {
        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
            const res = await processor.process({ imgUrl: testImg1.url });
            expect(res?.confidence).not.toBeNull();
            expect(res?.text).toEqual(testImg1.result);
            console.log("Done: " + i + "/" + iterations )
        }
    })

})