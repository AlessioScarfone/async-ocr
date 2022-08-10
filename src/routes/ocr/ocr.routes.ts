import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { EXPRESS_CONTEXT_KEY } from "../../app";
import env from "../../config/env";
import RedisRequestModel from "../../models/RedisRequest.model";
import RedisBullQueueManger from "../../services/Redis/RedisBullQueueManager";
import RedisClient from "../../services/Redis/RedisClient";
import { ACCEPTED_LANGUAGE } from "../../services/Tesseract/TesseractTypes";
import { OCRWorkerOutput } from "../../services/Tesseract/OCRWorkerOutput";

const NOT_FOUND_ERROR: OCRWorkerOutput = { error: "NOT FOUND" };
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

        const redisQueueWriter = request.app.get(EXPRESS_CONTEXT_KEY.REDIS_QUEUE_MANAGER) as RedisBullQueueManger;
        try {
            const redisMsg: RedisRequestModel = {
                key: requestID,
                value: {
                    url: url,
                    lang: lang
                }
            };
            const queueName = env.redis.queuePrefix + lang;
            const queueJob = await redisQueueWriter.sendMessage(queueName, redisMsg);
            console.log(`Job added to queue [${queueName}] - jobId = `, queueJob?.id);
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
            const redisClient = request.app.get(EXPRESS_CONTEXT_KEY.REDIS_CLIENT) as RedisClient;
            const redisRecord = await redisClient.readMessage(id);
            //I record restano disponibili fino alla scadenza
            const ocrOutput = redisRecord ? JSON.parse(redisRecord) as OCRWorkerOutput : NOT_FOUND_ERROR;
            let statusCode = 200;
            if (!redisRecord)
                statusCode = 404;

            return response.status(statusCode).json(ocrOutput);
        } catch (err) {
            console.log("recognize GET error: [" + requestID + "]: " + err)
            response.status(500).json({ error: 'Generic Error' });
        }
    })

export default ocrRouter;