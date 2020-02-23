'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DeliverySchema extends Schema {
  up() {
    this.create('deliveries', table => {
      table.increments()
      table
        .integer('recipient_id')
        .unsigned()
        .references('id')
        .inTable('recipients')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('deliveryman_id')
        .unsigned()
        .references('id')
        .inTable('deliverymen')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('signature_id')
        .unsigned()
        .references('id')
        .inTable('files')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.string('product')
      table.timestamp('canceled_at')
      table.timestamp('start_date')
      table.timestamp('end_date')
      table.timestamps()
    })
  }

  down() {
    this.drop('deliveries')
  }
}

module.exports = DeliverySchema
