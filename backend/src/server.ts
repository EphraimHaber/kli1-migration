import cors from 'cors';
import express, { type Express } from 'express';
import session from 'express-session';
import helmet from 'helmet';

import mongoose from 'mongoose';
import passport from 'passport';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import lusca from 'lusca';
import flash from 'express-flash';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { env } from '@/common/utils/envConfig';
import { socketFunctions } from './common/utils/socket-functions';
import { userRouter as exampleUserRouter } from './api/user-example-api-spec/userRouter';
import { authRouter } from './api/auth/authRouter';
import { IUser } from './api/user/types';
import { userRouter } from './api/user/userRouter';

export class Context {
    user: IUser | null;

    constructor(public someContextVariable: any) {
        this.user = null;
    }

    log(message: string) {
        console.log(this.someContextVariable, { message });
    }
}

declare global {
    namespace Express {
        interface Request {
            context: Context;
        }
    }
}

const app: Express = express();

app.use((req, res, next) => {
    req.context = new Context(req.url);
    next();
});

// Set the application to trust the reverse proxy
// app.set('trust proxy', true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
// app.use(rateLimiter);

// Request logging
app.use(requestLogger);

app.use(
    session({
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Routes
// this is an example for an open api spec
// app.use('/users', exampleUserRouter);
app.use('/health-check', healthCheckRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    // cors:
    allowEIO3: true,
});

socketFunctions(io);

export { app, httpServer };
