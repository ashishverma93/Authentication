// const app = express()
// import winston from "winston";

import { logger } from "../config/logConfig.js";

// const consoleTransport = new winston.transports.Console()
// const myWinstonOptions = { transports: [consoleTransport] }
// const logger = new winston.createLogger(myWinstonOptions)

export const logRequest = (req, res, next) => {
    const startTime = Date.now();

    // Capture the request body
    const requestData = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
    };

    // Store original send function
    const oldSend = res.send;

    // Capture response body
    res.send = function (data) {
        const responseTime = Date.now() - startTime;

        const responseData = {
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            body: data,
        };

        logger.info({
            request: requestData
        });
        logger.info({
            response: responseData
        })

        // Call original send with the data
        return oldSend.apply(res, arguments);
    };

    next();
    // logger.info(`[logRequest]request url: ${req.url}`);
    // logger.info(`[logRequest]request: ${JSON.stringify(req)}`);
    // logger.info(`[logRequest]response: ${JSON.stringify(res)}`);
    // next();
}

export const logError = (err, req, res, next) => {
    logger.error(`[logError]request url: ${req.url}`);
    logger.error(`[logError]request: ${JSON.stringify(req)}`);
    logger.error(`[logError]response: ${JSON.stringify(res)}`);
    next();
}

export const logInfo = (name, ...data) => {
    logger.info(`[${name}]: ${data}`);
}