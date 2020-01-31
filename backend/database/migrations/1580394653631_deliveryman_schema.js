'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DeliverymanSchema extends Schema {
  up() {
    this.create('deliverymen', table => {
      table.increments()
      table
        .string('name')
        .notNullable()
        .unique()
      table
        .string('email')
        .notNullable()
        .unique()
      table
        .integer('avatar_id')
        .unsigned()
        .references('id')
        .inTable('files')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down() {
    this.drop('deliverymen')
  }
}

module.exports = DeliverymanSchema
