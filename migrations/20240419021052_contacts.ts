import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    const query = `

    CREATE TABLE contacts (
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        id serial PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        phone_id INTEGER REFERENCES phone_numbers(id),
        contact_name TEXT
    );
    
        
    CREATE TRIGGER contact_updated
    BEFORE INSERT OR UPDATE
    ON contacts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();
    
    `;
    return knex.schema.raw(query);    
}


export async function down(knex: Knex): Promise<void> {

    const query = `
    DROP TABLE IF EXISTS contacts cascade;
    `;
    return knex.schema.raw(query);
}

