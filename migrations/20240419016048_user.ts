import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    const query = `

    CREATE TABLE users (
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        id serial PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone_id INTEGER REFERENCES phone_numbers(id),
        password TEXT
    );
        
    CREATE TRIGGER users_updated
    BEFORE INSERT OR UPDATE
    ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();
    `;
    return knex.schema.raw(query);    
}


export async function down(knex: Knex): Promise<void> {

    const query = `
    DROP TABLE IF EXISTS users cascade;
    `;
    return knex.schema.raw(query);
}

