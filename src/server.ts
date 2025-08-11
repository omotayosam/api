import http from 'http';
import express from 'express';
import './config/logging';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { server } from './config/config';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import path from 'path';
import rootRouter from './routes/routes';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    logging.log('----------------------------------------');
    logging.log('Initializing API');
    logging.log('----------------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());

    // CORS - allow all origins (no credentials); switch to an allowlist if needed via CORS_ORIGIN
    const rawOrigins = process.env.CORS_ORIGIN; // comma-separated list or '*' for all
    const hasAllowList = rawOrigins && rawOrigins.trim() !== '' && rawOrigins.trim() !== '*';
    const corsOptions: any = hasAllowList
        ? {
            origin: rawOrigins.split(',').map((o) => o.trim()),
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: false,
            optionsSuccessStatus: 204,
        }
        : {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: false,
            optionsSuccessStatus: 204,
        };

    // Debug: log configured CORS options once on startup
    logging.log('CORS configuration', { rawOrigins, hasAllowList, corsOrigin: corsOptions.origin });

    // Debug: log per-request origin and method
    application.use((req, res, next) => {
        const originHeader = req.headers.origin;
        const acrm = req.headers['access-control-request-method'];
        logging.log('CORS request', { method: req.method, url: req.originalUrl, originHeader, acrm });
        res.on('finish', () => {
            const allowOrigin = res.get('Access-Control-Allow-Origin');
            logging.log('CORS response', { url: req.originalUrl, status: res.statusCode, allowOrigin });
        });
        next();
    });

    application.use(cors(corsOptions));

    // Serve static avatars whether running from src or build
    const avatarsPath = path.join(__dirname, '../avatars');
    application.use('/avatars', express.static(avatarsPath));

    logging.log('----------------------------------------');
    logging.log('Logging & Configuration');
    logging.log('----------------------------------------');
    application.use(loggingHandler);

    logging.log('----------------------------------------');
    logging.log('Define Controller Routing');
    logging.log('----------------------------------------');
    application.get('/main/healthcheck', (req, res, next) => {
        return res.status(200).json({ hello: 'world!' });
    });

    application.use('/api', rootRouter)

    logging.log('----------------------------------------');
    logging.log('Define Routing Error');
    logging.log('----------------------------------------');
    application.use(routeNotFound);

    logging.log('----------------------------------------');
    logging.log('Starting Server');
    logging.log('----------------------------------------');
    httpServer = http.createServer(application);
    const port = process.env.PORT ? Number(process.env.PORT) : server.SERVER_PORT;
    httpServer.listen(port, () => {
        logging.log('----------------------------------------');
        logging.log(`Server started on ${server.SERVER_HOSTNAME}:${port}`);
        logging.log('----------------------------------------');
    });
};

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();