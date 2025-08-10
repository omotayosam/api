import { Request, Response, NextFunction } from 'express';

export function loggingHandler(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl || req.url;
    const ip = req.socket.remoteAddress;

    logging.log(`Incomming - METHOD: [${req.method}] - URL: [${originalUrl}] - IP: [${ip}]`);

    res.on('finish', () => {
        logging.log(`Result - METHOD: [${req.method}] - URL: [${originalUrl}] - IP: [${ip}] - STATUS: [${res.statusCode}]`);
    });

    next();
}