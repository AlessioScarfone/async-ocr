export default class GetResultResponse {
    private url: string;
    private lang: string;

    constructor(url: string, lang: string) {
        this.url = url;
        this.lang = lang;
    }
}