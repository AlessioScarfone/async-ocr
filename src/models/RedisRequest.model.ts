import { OCRWorkerInput } from "../services/Tesseract/OCRWorkerInput";

export default interface RedisRequestModel {
    //requestId
    key: string,
    value: OCRWorkerInput
}