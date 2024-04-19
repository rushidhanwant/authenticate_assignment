import * as Hapi from '@hapi/hapi';

export default function (server: Hapi.Server) {
    server.route({
        method: 'GET',
        path: '/internal/ping',
        options: {
            handler: (request, h) => 'pong',
            tags: ['api', 'auth'],
            auth: false,
            description: 'Returns pong',
            notes: 'Diagnostic API responding to ping',
        },
    });
}
