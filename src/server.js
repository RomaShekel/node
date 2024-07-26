import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';

import { env } from './utils/env.js'
import router from './routes/index.js'
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { UPLOAD_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = env('PORT');

export const startServer = () => {

    const app = express();

    app.use(cors());
    app.use(express.json({
        type: ['application/json', 'application/vnd.api+json'],
    }))
    app.use('/uploads', express.static(UPLOAD_DIR))
    app.use('/api-docs', swaggerDocs())
    app.use(cookieParser())

    app.use((req, res, next) => {
        console.log(`DATA: ${new Date().toLocaleString()}`);
        next();
    })

    app.use(
        pino({
        transport: {
            target: 'pino-pretty',
        },
        }),
    );

    app.get('/', (req, res) => {
        res.json({
            'massage': 'THE WORLD',
        })
    })

    app.use(router);

    app.use('*', notFoundHandler)

    app.use(errorHandler)

    app.listen(PORT, () => {
        console.log('awada kedawra');
        console.log(PORT)
    })
}