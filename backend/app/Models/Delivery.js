'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Delivery extends Model {
  recipient() {
    return this.belongsTo('App/Models/Recipient')
  }

  deliveryman() {
    return this.belongsTo('App/Models/Deliveryman')
  }

  signature() {
    return this.belongsTo('App/Models/File', 'signature_id', 'id')
  }
}

module.exports = Delivery
