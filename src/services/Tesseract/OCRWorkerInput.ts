export class OCRWorkerInput {
    url: string;
    lang: string;

    constructor(url: string, lang: string) {
        this.url = url;
        this.lang = lang;
    }
}
