import { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { recognize } from "tesseract.js";
import { ACCEPTED_LANGUAGE } from "../../services/Tesseract/TesseractTypes";

const ocrRouter = Router();

const baseUrl = "/api/ocr"

ocrRouter.get(`${baseUrl}/recognize`,
    query('url').isURL({ protocols: ['https', 'http'] }).withMessage('Invalid URL'),
    query('lang').isString().isIn(ACCEPTED_LANGUAGE).withMessage('Invalid Lang'),
    async (request: Request, response: Response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            console.log(`Error : [${request.requestID}]`, errors.array());
            return response.status(400).json({ errors: errors.array() });
        }

        const { url, lang } = request.query;

        const ocrResult = await recognize(url as string, lang as string);
        const result = {
            confidence: ocrResult?.data?.confidence,
            text: ocrResult?.data?.text
        }

        console.log(`recognize [${request.requestID}] result:`, result)
        response.status(200).json(result);
    })

export default ocrRouter;