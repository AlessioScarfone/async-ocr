export class OCRWorkerInput {
    img: string | Buffer;
    lang: string;
    /**it indicates if the provided img is a file */
    isFile: boolean;
    requestId?: string;

    constructor(img: string | Buffer, lang: string, isFile = true, requestId = "") {
        this.img = img;
        this.lang = lang;
        this.isFile = isFile;
        this.requestId = requestId;
    }
}
