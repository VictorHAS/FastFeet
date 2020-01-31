'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SignatureSchema extends Schema {
  up() {
    this.create('signatures', table => {
      table.increments()
      table
        .integer('recipient_id')
        .unsigned()
        .references('id')
        .inTable('recipients')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('file_id')
        .unsigned()
        .references('id')
        .inTable('files')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.timestamps()
    })
  }

  down() {
    this.drop('signatures')
  }
}

module.exports = SignatureSchema
