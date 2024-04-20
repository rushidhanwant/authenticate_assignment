import * as Hapi from '@hapi/hapi';
import { isLeft } from 'fp-ts/lib/Either';
import * as _ from 'ramda';
import { spamSchema } from './types';
import * as phonebookHandler from './handler';

export default function (server: Hapi.Server) {
    server.route({
        method: 'POST',
        path: '/phonebook/number/markspam',
        options: {
            handler: async (request, h) => {
                const spamDetails = request.payload;
                const userId = request.auth.credentials.userId;
                const response =
                    await phonebookHandler.markNumberSpam({...spamDetails, userId:userId});
                if (isLeft(response)) {
                    return h.response({ errors: response.left }).code(400);
                }
                return h.response({ user: response.right }).code(200);
            },
            tags: ['api', 'phonebook', 'spam'],
            validate: {
                payload: spamSchema,
            },
            description: 'mark a number as spam',
            notes: 'mark spam',
        },
    });
}