'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DeliveryProblemSchema extends Schema {
  up() {
    this.create('delivery_problems', table => {
      table.increments()
      table
        .integer('delivery_id')
        .unsigned()
        .references('id')
        .inTable('deliveries')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.text('description')
      table.timestamps()
    })
  }

  down() {
    this.drop('delivery_problems')
  }
}

module.exports = DeliveryProblemSchema
