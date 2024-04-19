import config from '../../src/config';
import { init } from '../../src/server';
import knex from '../../src/db';
import _ from 'ramda';

var testEnv: undefined | any;

async function resetDB() {
    const query = `
    truncate table users, session CASCADE;
    `;
    return knex.schema.raw(query);
}

async function initTestServer() {
    const updateConfig = _.mergeRight(config, {
        SENTRY_DSN: undefined,
    });

    const { server, handlers } = await init(updateConfig);

    await knex.migrate.rollback();
    await knex.migrate.latest();

    return {
        server,
        resetDB: resetDB,
        authHandler: handlers.authHandler,
    };
}

export async function getTestEnv() {
    if (testEnv === undefined) {
        testEnv = await initTestServer();
    }
    return testEnv;
}
