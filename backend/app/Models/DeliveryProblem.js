'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DeliveryProblem extends Model {
  delivery() {
    return this.belongsTo('App/Models/Delivery')
  }
}

module.exports = DeliveryProblem
