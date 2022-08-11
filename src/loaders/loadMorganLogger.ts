/* eslint-disable @typescript-eslint/no-unused-vars */
import { Express, Request, Response } from "express";
import morgan from "morgan";
import RapidApiHeaders from "../models/RepidApiHeaders";

const loadMorganLogger = (app: Express) => {
    morgan.token('body', (req: Request, res: Response): string => JSON.stringify(req.body));
    morgan.token('requestID', (req: Request, res: Response): string => req.requestID);
    morgan.token('rapidApiUser', (req: Request, res: Response): string => req.get(RapidApiHeaders.user) || "MissingUser");
    morgan.token('rapidApiSubscription', (req: Request, res: Response): string => req.get(RapidApiHeaders.subscription) || "MissingPlan");
    app.use(morgan('[:date[clf]] :method :url :status [:requestID] [:rapidApiUser;:rapidApiSubscription] :response-time ms - body = :body', {
        skip: (req, res) => {
            return req.url.includes('health')
        }
    }));
}

export default loadMorganLogger;