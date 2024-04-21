import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    return knex.schema.createTable('contacts', table => {
        table.timestamps(true, true);
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('phone_id').references('id').inTable('phone_numbers');
        table.text('contact_name');
      })
        .then(() => {
          return knex.raw(`
            CREATE TRIGGER contact_updated
            BEFORE INSERT OR UPDATE ON contacts
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at();
          `);
        })   
}


export async function down(knex: Knex): Promise<void> {

    return knex.schema.dropTableIfExists('contacts');

}

