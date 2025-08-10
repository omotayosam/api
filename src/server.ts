import http from 'http';
import express from 'express';
import './config/logging';
import cors from 'cors';


import { server } from './config/config';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import path from 'path';
import rootRouter from './routes/routes';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    logging.log('----------------------------------------');
    logging.log('Initializing API');
    logging.log('----------------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());

    // CORS
    const rawOrigins = process.env.CORS_ORIGIN; // comma-separated list or '*' for all
    const origins = rawOrigins
        ? rawOrigins.split(',').map((o) => o.trim())
        : '*';

    application.use(
        cors({
            origin: origins,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: false,
        })
    );


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