import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {

    return knex.schema.createTable('session', table => {
        table.string('sessionId', 50).primary();
        table.timestamps(true, true);
        table.integer('userId').references('id').inTable('users').onDelete('CASCADE');
      })
}


export async function down(knex: Knex): Promise<void> {

    return knex.schema.dropTableIfExists('session');

}



