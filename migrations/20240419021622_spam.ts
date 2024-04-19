import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    const query = `

    CREATE TABLE spam_details (
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        id serial PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        phone_id INTEGER REFERENCES phone_numbers(id)
    );
    
        
    CREATE TRIGGER spam_updated
    BEFORE INSERT OR UPDATE
    ON spam_details
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();
    
    `;
    return knex.schema.raw(query);    
}


export async function down(knex: Knex): Promise<void> {

    const query = `
    DROP TABLE IF EXISTS spam_details cascade;
    `;
    return knex.schema.raw(query);
}

