import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import RedisRequestModel from "../../models/RedisRequest.model";
import RedisPublisher from "../../services/Redis/RedisPublisher";
import { ACCEPTED_LANGUAGE } from "../../services/Tesseract/TesseractTypes";

const ocrRouter = Router();

const baseUrl = "/api/ocr"

ocrRouter.post(`${baseUrl}/recognize`,
    body('url').isURL({ protocols: ['https', 'http'] }).withMessage('Invalid URL'),
    body('lang').isString().isIn(ACCEPTED_LANGUAGE).withMessage('Invalid Lang'),
    async (request: Request, response: Response) => {
        // ==== START: input validation ===
        const errors = validationResult(request);
        const requestID = request.requestID;
        if (!errors.isEmpty()) {
            console.log(`Error : [${requestID}]`, errors.array());
            return response.status(400).json({ errors: errors.array() });
        }
        // ==== END: input validation ===

        const { url, lang } = request.body;

        const redisPublisher = request.app.get('redisPublisher') as RedisPublisher;
        try {
            const redisMsg: RedisRequestModel = {
                key: requestID,
                value: {
                    url: url,
                    lang: lang
                }
            };
            await redisPublisher.publish(redisMsg)
            response.status(200).json({ id: requestID, ...request.body });
        } catch (err) {
            console.log("recognize route error: [" + requestID + "]: " + err)
            response.status(500).json({ error: 'Generic Error' });
        }
    })

export default ocrRouter;