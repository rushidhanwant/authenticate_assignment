import dotenv from 'dotenv';
import _ from 'ramda';

dotenv.config();

// Without Trailing /
const BASE_URL = process.env.BASE_URL || 'http://0.0.0.0:4000';

const Config = {
    // Server Configs
    BASE_URL,
    PORT: process.env.PORT || 4000,
    JWT_SECRET:
        process.env.JWT_SECRET ||
        'pp~f}dbkwd]k1qpp@n1<:lljptymffd]k1q~f}dbkwdt>',

    LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'debug',

    SENTRY_DSN: process.env.SENTRY_DSN || undefined,
    RELEASE_VERSION: process.env.RELEASE_VERSION || 'undefined',
    SERVER_ENVIRONMENT: process.env.SERVER_ENVIRONMENT || 'production',
};

const Prod = _.merge(Config, {
    APP_ENV: 'Prod',
    DB_CONNECTION_URI: process.env.DB_CONNECTION_URI,
});

const Test = _.merge(Config, {
    APP_ENV: 'Test',
    DB_CONNECTION_URI: process.env.TEST_DB_CONNECTION_URI,
});

// eslint-disable-next-line fp/no-nil, func-names
export = (function () {
    console.log(`Env= ${process.env.NODE_ENV}`);
    switch (process.env.NODE_ENV) {
        case 'Production':
            return Prod;
        case 'Test':
            return Test;
        default:
            return Prod;
    }
})();
