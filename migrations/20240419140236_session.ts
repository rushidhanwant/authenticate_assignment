import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    const query = `

    CREATE TABLE session (
        "sessionId" VARCHAR (50) PRIMARY KEY,
        "createdAt" timestamptz DEFAULT now(),
        "lastUsed" timestamptz DEFAULT now(),
        "userId" INT REFERENCES users(id) ON DELETE CASCADE 
    );
    `;
    return knex.schema.raw(query);    
}


export async function down(knex: Knex): Promise<void> {

    const query = `
    DROP TABLE IF EXISTS session cascade;
    `;
    return knex.schema.raw(query);
}



