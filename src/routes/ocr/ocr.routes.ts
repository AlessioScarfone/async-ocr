import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import RedisRequestModel from "../../models/RedisRequest.model";
import RedisClient from "../../services/Redis/RedisClient";
import RedisPublisher from "../../services/Redis/RedisPublisher";
import { ACCEPTED_LANGUAGE } from "../../services/Tesseract/TesseractTypes";

const NOT_FOUND_ERROR = "NOT FOUND";
const GENERIC_ERROR = "GENERIC ERROR";

const ocrRouter = Router();

const baseUrl = "/api/ocr"

/**
 * Ask for OCR recognition
 */
ocrRouter.post(`${baseUrl}/recognition`,
    body('url').exists().isURL({ protocols: ['https', 'http'] }).withMessage('Invalid URL'),
    body('lang').exists().isString().isIn(ACCEPTED_LANGUAGE).withMessage('Invalid Lang'),
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

        const redisPublisher = request.app.get('redisPublisher') as RedisPublisher<RedisRequestModel>;
        try {
            const redisMsg: RedisRequestModel = {
                key: requestID,
                value: {
                    url: url,
                    lang: lang
                }
            };
            await redisPublisher.publish(redisMsg);
            // console.log("Publish on redis:", redisMsg);
            response.status(200).json({ id: requestID, ...request.body });
        } catch (err) {
            console.log("recognize POST error: [" + requestID + "]: " + err)
            response.status(500).json({ error: GENERIC_ERROR });
        }
    })

/**
 * Retrieve OCR result
 */
ocrRouter.get(`${baseUrl}/recognition/result`,
    query('id').exists().isString().notEmpty().withMessage('Invalid requestId'),
    async (request: Request, response: Response) => {
        // ==== START: input validation ===
        const errors = validationResult(request);
        const requestID = request.requestID;
        if (!errors.isEmpty()) {
            console.log(`Error : [${requestID}]`, errors.array());
            return response.status(400).json({ errors: errors.array() });
        }
        // ==== END: input validation ===

        const id = request.query?.id as string;

        try {
            const redisClient = request.app.get('redisClient') as RedisClient;
            let record = await redisClient.readMessage(id);
            //TODO: cancella i record o lasciali scadere ?? 
            record = record ? JSON.parse(record) : NOT_FOUND_ERROR;

            return response.status(200).json({ result: record });
        } catch (err) {
            console.log("recognize GET error: [" + requestID + "]: " + err)
            response.status(500).json({ error: 'Generic Error' });
        }
    })

export default ocrRouter;