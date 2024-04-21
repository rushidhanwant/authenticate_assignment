import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    return knex.schema.createTable('users', table => {
        table.timestamps(true, true);
        table.increments('id').primary();
        table.text('name');
        table.text('email').unique();
        table.integer('phone_id').references('id').inTable('phone_numbers');
        table.text('password');
      })
        .then(() => {
          return knex.raw(`
            CREATE TRIGGER users_updated
            BEFORE INSERT OR UPDATE ON users
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at();
          `);
        });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists('users');
}

