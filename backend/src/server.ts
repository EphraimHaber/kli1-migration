import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';
import { pinoCaller } from 'pino-caller';

import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { userRouter } from '@/api/user/userRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { env } from '@/common/utils/envConfig';

// const logger = pinoCaller(
//     pino({
//         level: 'info',
// transport: {
//     target: 'pino-pretty',
// },

// transport: {
// target: 'pino-pretty',
// options: {
//     colorize: true,

//     ignore: 'pid,hostname',
//     messageFormat: '{msg} ({caller})',
// },
// },
// }),
// );
const logger = pinoCaller(
    pino({
        level: 'debug',
        transport: {
            target: 'pino-pretty',
            options: {
                ignore: 'pid,hostname',
                messageFormat: '{msg}',
                translateTime: 'SYS:hh:mm:ss',
            },
        },
    }),
);
// const logger = pino({
//     level: 'debug',
//     transport: {
//         target: 'pino-pretty',
//         options: {
//             colorize: true,
//             messageFormat: '{msg}',

//             ignore: 'pid,hostname',
//             translateTime: 'SYS:hh:mm:ss',
//         },
//     },
// });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/users', userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
