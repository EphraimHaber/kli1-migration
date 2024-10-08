import { pino } from 'pino';
import { pinoCaller } from 'pino-caller';

export const logger = pinoCaller(
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
