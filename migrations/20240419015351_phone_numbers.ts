import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    const query = `

    CREATE TABLE phone_numbers (
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        id serial PRIMARY KEY,
        number TEXT UNIQUE NOT NULL,
        spam_count INTEGER DEFAULT 0
    );
    
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS trigger AS
    $$      
    begin
     NEW."updated_at" = now();
     RETURN NEW;
    END;
    $$
    LANGUAGE 'plpgsql';
        
    CREATE TRIGGER number_updated
    BEFORE INSERT OR UPDATE
    ON phone_numbers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();
    
    `;
    return knex.schema.raw(query);    
}


export async function down(knex: Knex): Promise<void> {

    const query = `
    DROP TABLE IF EXISTS phone_numbers cascade;
    `;
    return knex.schema.raw(query);
}

