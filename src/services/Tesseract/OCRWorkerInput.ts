export class OCRWorkerInput {
    img: string | Buffer;
    lang: string;
    /**it indicates if the provided img is a file */
    isFile: boolean;

    constructor(img: string | Buffer, lang: string, isFile = true) {
        this.img = img;
        this.lang = lang;
        this.isFile = isFile;
    }
}
