import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    return knex.schema.createTable('phone_numbers', table => {
        table.timestamps(true, true);
        table.increments('id').primary();
        table.text('number').unique().notNullable();
        table.integer('spam_count').defaultTo(0);
      })
        .then(() => {
          return knex.raw(`
            CREATE OR REPLACE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW."updated_at" = now();
              RETURN NEW;
            END;
            $$ LANGUAGE 'plpgsql';
          `);
        })
        .then(() => {
          return knex.raw(`
            CREATE TRIGGER number_updated
            BEFORE INSERT OR UPDATE ON phone_numbers
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at();
          `);
        })
}


export async function down(knex: Knex): Promise<void> {

    return knex.schema.dropTableIfExists('phone_numbers');
}

