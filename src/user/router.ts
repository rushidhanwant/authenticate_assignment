import * as Hapi from '@hapi/hapi';
import { isLeft } from 'fp-ts/lib/Either';
import Joi from 'joi';
import * as _ from 'ramda';
import { signUpSchema } from './types';

function wrapError(errorCode) {
    if (errorCode === 'userAlreadyExist') {
        return {
            code: 'email-taken',
        };
    }
    return {
        code: errorCode,
    };
}

export default function (server: Hapi.Server, userHandler) {
    server.route({
        method: 'POST',
        path: '/user/signup',
        options: {
            handler: async (request, h) => {
                const signUpDetails = request.payload;
                const response = await userHandler.signUpUser(signUpDetails);
                if (isLeft(response)) {
                    return h
                        .response({ errors: [wrapError(response.left)] })
                        .code(400);
                }
                return h.response({ userID: response.right }).code(200);
            },
            auth: false,
            tags: ['api', 'user'],
            validate: {
                payload: signUpSchema,
            },
            description: 'user',
            notes: 'sign up',
        },
    });
}
