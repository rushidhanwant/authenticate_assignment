import db from '../db';

const sessionTableName = 'session';

export async function saveSession(sessionId) {
    return await db(sessionTableName).insert({ sessionId: sessionId });
}

export async function getSessionById(sessionId) {
    return db(sessionTableName).select('*').where({ sessionId }).first();
}

export async function deleteSession(sessionId: string) {
    return db(sessionTableName).delete().where({ sessionId: sessionId });
}
