import { NextFunction, Request, Response } from "express";
import env from "../config/env";
import RapidApiHeaders from "../models/RapidApiHeaders";

/**
 * Express middleware that block all request without correct X-RapidAPI-Proxy-Secret header
 * @param request 
 * @param response 
 * @param next 
 * @returns 
 */
const rapidApiProxyCheckMiddleware = (request: Request, response: Response, next: NextFunction): void => {
    const proxySecret = request.get(RapidApiHeaders.proxySecret);

    // skip rapidApi check on admin route:
    if(request?.originalUrl?.match(/admin|socket|favicon/) || !env.rapidApi.proxySecret){
        // console.log(`Skip rapidApiHeader check - url [${request?.originalUrl}]`)
        next();
        return;
    }

    if(proxySecret == env.rapidApi.proxySecret)
        next();
    else {
        console.log(`ProxySecret error - url [${request?.originalUrl}]:`, proxySecret, )
        response.status(403).json({error: "Not allowed"});
    }
}


export { rapidApiProxyCheckMiddleware }