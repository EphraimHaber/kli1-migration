import dotenv from 'dotenv';
import { cleanEnv, host, num, port, str, testOnly } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
    NODE_ENV: str({ devDefault: testOnly('test'), choices: ['development', 'production', 'test'] }),
    HOST: host({ devDefault: testOnly('localhost') }),
    PORT: port({ devDefault: testOnly(3000) }),
    DOMAIN_NAME: str(),
    CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3000') }),
    COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
    COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
    MONGODB_URI: str(),
    SESSION_SECRET: str(),
    CLOUDINARY_CLOUD_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    FACEBOOK_APP_ID: str(),
    FACEBOOK_APP_SECRET: str(),
    GOOGLE_APP_ID: str(),
    GOOGLE_APP_SECRET: str(),
    DB_NAME: str(),
});
