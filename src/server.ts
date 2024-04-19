/* eslint-disable import/prefer-default-export */
import * as Hapi from '@hapi/hapi';
import * as HapiSwagger from 'hapi-swagger';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import * as Jwt2 from 'hapi-auth-jwt2';
import _ from 'ramda';
import Path from 'path';
const Inert = require('@hapi/inert');

import AuthenticationRouter from './authentication/router';
import DiagnosticRouter from './diagnostic/router';
import UserRouter from './user/router';
import phoneBookRouter from './phonebook/router';

import authenticationHandler from './authentication/handler';
import userHandler from './user/handler';

export const init = async (config) => {
    // Hapi JS server initialization
    const server = Hapi.server({
        port: config.PORT,
        host: '0.0.0.0',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '..', 'user-media'),
            },
            cors: {
                origin: ['*'],
                // an array of origins or 'ignore'
            },
        },
    });

    // Swagger configuration
    const swaggerOptions = {
        info: {
            title: 'Hapi API Documentation',
            version: '0.0.1',
        },
        host: `${config.BASE_URL}`,
        securityDefinitions: {
            jwt: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
            },
        },
        security: [{ jwt: [] }],
    };

    // Hapi js plugins
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions,
        },
        {
            plugin: Jwt2,
        },
    ]);

    const env = {
        config: config,
    };

    // Handlers

    const userHandlerObj = userHandler(env);

    const authenticationHandlerObj = authenticationHandler(env);
    // Authentications
    server.auth.strategy('jwt', 'jwt', {
        key: config.JWT_SECRET,
        validate: authenticationHandlerObj.validateJWTToken,
    });

    server.auth.default('jwt');

    // Setup router

    AuthenticationRouter(server, authenticationHandlerObj);
    DiagnosticRouter(server);
    UserRouter(server, userHandlerObj);
    phoneBookRouter(server);

    await server.initialize();
    return {
        server,
        handlers: {
            authHandler: authenticationHandlerObj,
            userHandler: userHandlerObj,
        },
    };
};
