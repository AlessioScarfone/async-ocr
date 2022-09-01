import { NextFunction, Request, RequestHandler, Response } from "express";
import RapidApiHeaders from "../models/RapidApiHeaders";

export default function subscriptionPlanEndpointRestiction(
    /** List of subscription plans that CANNOT access the resource */
    notAllowedPlan: string[]
): RequestHandler {

    return (request: Request, response: Response, next: NextFunction): void => {
        notAllowedPlan = notAllowedPlan.map(p => p.toUpperCase())
        const subscriptionPlanHeader = request.get(RapidApiHeaders.subscription)?.toUpperCase();
        if (!subscriptionPlanHeader || notAllowedPlan.includes(subscriptionPlanHeader))
            response.status(403).json({ error: "Not allowed. Insufficient permissions" });
        else {
            next();
        }
    }
    
}




