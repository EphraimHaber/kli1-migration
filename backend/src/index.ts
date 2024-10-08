import { env } from '@/common/utils/envConfig';
import { httpServer } from '@/server';

import mongoose from 'mongoose';
import { logger } from './common/utils/logger';

const connectToMongo = async () => {
    const { MONGODB_URI, NODE_ENV } = env;
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('db success connect');
        if (NODE_ENV === 'development') {
            // mongoose.set('debug', true);
        }
    } catch (err) {
        logger.error(`MongoDB connection error ${err}`);
        process.exit();
    }
};

httpServer.listen(env.PORT, () => {
    const { NODE_ENV, HOST, PORT } = env;
    logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    connectToMongo();
});
