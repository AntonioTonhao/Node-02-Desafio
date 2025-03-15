import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('meals_id').primary()
    table.uuid('id_user').references('user.user_id').notNullable()
    table.string('title').notNullable()
    table.string('description').notNullable()
    table.date('date').notNullable()
    table.boolean('is_on_diet').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
