'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RecipientSchema extends Schema {
  up() {
    this.create('recipients', table => {
      table.increments()
      table.string('name').notNullable()
      table.string('street').notNullable()
      table.string('number').notNullable()
      table.string('complement').nullable()
      table.string('state').notNullable()
      table.string('city').notNullable()
      table.string('zip_code').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('recipients')
  }
}

module.exports = RecipientSchema
