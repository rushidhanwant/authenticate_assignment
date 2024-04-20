import * as Hapi from '@hapi/hapi';
import { isLeft } from 'fp-ts/lib/Either';
import * as _ from 'ramda';
import { contactDetailsSchema, searchQuerySchema, spamSchema } from './types';
import * as phonebookHandler from './handler';

export default function (server: Hapi.Server) {
    server.route({
        method: 'POST',
        path: '/phonebook/number/markspam',
        options: {
            handler: async (request, h) => {
                const spamDetails = request.payload;
                const userId = request.auth.credentials.userId;
                const response = await phonebookHandler.markNumberSpam({
                    ...spamDetails,
                    userId: userId,
                });
                if (isLeft(response)) {
                    return h.response({ errors: response.left }).code(400);
                }
                return h.response({ data: response.right }).code(200);
            },
            tags: ['api', 'phonebook', 'spam'],
            validate: {
                payload: spamSchema,
            },
            description: 'mark a number as spam',
            notes: 'mark spam',
        },
    });

    server.route({
        method: 'GET',
        path: '/phonebook/search/number',
        options: {
            handler: async (request, h) => {
                const searchQuery: string = request.query.query;
                const userId: number = request.auth.credentials.userId;
                const response = await phonebookHandler.searchContact({
                    query: searchQuery,
                    userId: userId,
                });
                if (isLeft(response)) {
                    return h.response({ errors: response.left }).code(400);
                }
                return h.response({ data: response.right }).code(200);
            },
            tags: ['api', 'phonebook', 'search'],
            validate: {
                query: searchQuerySchema,
            },
            description: 'search a contact',
            notes: 'search contact',
        },
    });

    server.route({
        method: 'POST',
        path: '/phonebook/contact-details',
        options: {
            handler: async (request, h) => {
                const contactDetails = request.payload;
                const userId = request.auth.credentials.userId;
                const response = await phonebookHandler.getContactDetails(
                    contactDetails,
                    userId,
                );
                if (isLeft(response)) {
                    return h.response({ errors: response.left }).code(400);
                }
                return h.response({ data: response.right }).code(200);
            },
            tags: ['api', 'phonebook', 'contact details'],
            validate: {
                payload: contactDetailsSchema,
            },
            description: 'get contact details',
            notes: 'contact details',
        },
    });
}
