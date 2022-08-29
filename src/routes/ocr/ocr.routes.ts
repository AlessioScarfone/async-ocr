import { Router, Request, Response } from "express";
import { body, check, query, validationResult } from "express-validator";
import { EXPRESS_CONTEXT_KEY } from "../../app";
import env, { isProd } from "../../config/env";
import RedisRequestModel from "../../models/RedisRequest.model";
import RedisBullQueueManger from "../../services/Redis/RedisBullQueueManager";
import RedisClient from "../../services/Redis/RedisClient";
import { ACCEPTED_LANGUAGE } from "../../services/Tesseract/TesseractTypes";
import { OCRWorkerOutput } from "../../services/Tesseract/OCRWorkerOutput";
import multer from "multer";
import { customValidatorFileSize, customValidatorMimeType } from "../../utils/validator";
import { OCRWorkerInput } from "../../services/Tesseract/OCRWorkerInput";

const NOT_FOUND_ERROR: OCRWorkerOutput = { error: "NOT FOUND" };
const GENERIC_ERROR = "GENERIC ERROR";

const ocrRouter = Router();

const baseUrl = "/api/ocr"
const upload = multer();
const fileField = 'file';

/**
 * Ask for OCR recognition with file url
 * Params:
 * - url: string
 * - lang: string
 */
if (!isProd()) {
    ocrRouter.post(`${baseUrl}/recognition`,
        body('url')
            .exists().bail()
            .isURL({ protocols: ['https', 'http'] }).bail()
            .withMessage('Invalid URL')
            .matches(/^.*(bmp|jpg|png)$/).withMessage('Image extension not supported. (Supported format: bmp, jpg, png)'),
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
                const OCRInput = new OCRWorkerInput(url, lang, false, requestID);
                const redisMsg: RedisRequestModel = {
                    key: requestID,
                    value: OCRInput
                };
                const queueName = env.redis.queuePrefix + lang;
                const queueJob = await redisQueueWriter.sendMessage(queueName, redisMsg);
                console.log(`Job added to queue [${queueName}] - jobId = `, queueJob?.id);
                response.status(200).json({ id: requestID, ...request.body });
            } catch (err) {
                console.error("recognize POST error: [" + requestID + "]: " + err)
                response.status(500).json({ error: GENERIC_ERROR });
            }
        })
}

/**
 * Ask for OCR recognition
 * Params:
 * - file: Blob (multipart)
 * - lang: string
 */
ocrRouter.post(`${baseUrl}/recognition/file`,
    upload.single(fileField),  //multipart
    body('lang').exists().isString().isIn(ACCEPTED_LANGUAGE).withMessage('Invalid Lang'),
    check(fileField)
        .custom((value, { req }) => req.file ? true : false).withMessage('Missing file input').bail()
        .custom(customValidatorFileSize).withMessage('File too large').bail()
        .custom(customValidatorMimeType).withMessage('Mimetype not valid').bail(),
    async (request: Request, response: Response) => {
        // ==== START: input validation ===
        const errors = validationResult(request);
        const requestID = request.requestID;
        if (!errors.isEmpty()) {
            console.log(`Error : [${requestID}]`, errors.array());
            return response.status(400).json({ errors: errors.array() });
        }
        // ==== END: input validation ===
        const { lang } = request.body;
        const file = request.file;
        // console.log(file);

        const redisQueueWriter = request.app.get(EXPRESS_CONTEXT_KEY.REDIS_QUEUE_MANAGER) as RedisBullQueueManger;
        try {
            if (file?.buffer) {
                const OCRInput = new OCRWorkerInput(file.buffer, lang, true, requestID);
                const redisMsg: RedisRequestModel = {
                    key: requestID,
                    value: OCRInput
                };
                const queueName = env.redis.queuePrefix + lang;
                const queueJob = await redisQueueWriter.sendMessage(queueName, redisMsg);
                console.log(`Job added to queue [${queueName}] - jobId = `, queueJob?.id);
                response.status(200).json({ id: requestID, lang });
            } else {
                console.error(`Error : [${requestID}] file.buffer missing`);
                response.status(500).json({ error: GENERIC_ERROR });
            }
        } catch (err) {
            console.error("recognize POST error: [" + requestID + "]: " + err)
            response.status(500).json({ error: GENERIC_ERROR });
        }
    })

/**
 * Retrieve OCR result
 * Params:
 * - id: string
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
            console.error("recognize GET error: [" + requestID + "]: " + err)
            response.status(500).json({ error: 'Generic Error' });
        }
    })

export default ocrRouter;