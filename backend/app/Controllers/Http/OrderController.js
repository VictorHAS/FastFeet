'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Delivery = use('App/Models/Delivery')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const File = use('App/Models/File')

const { parseISO, getHours, isBefore, isAfter } = require('date-fns')

/**
 * Resourceful controller for interacting with deliveries
 */
class OrderController {
  /**
   * Show a list of all deliveries.
   * GET deliveryman/:id/deliveries
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index({ request, params }) {
    const { page, open } = request.headers(['page', 'open'])
    let delivery
    if (open) {
      delivery = await Delivery.query()
        .where('deliveryman_id', params.id)
        .whereNull('end_date')
        .with('deliveryman')
        .with('recipient')
        .paginate(page || 1)
    } else {
      delivery = await Delivery.query()
        .where('deliveryman_id', params.id)
        .whereNotNull('end_date')
        .with('deliveryman')
        .with('recipient')
        .paginate(page || 1)
    }

    return delivery
  }

  /**
   * Update delivery details.
   * PUT or PATCH deliveryman/deliveries/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const { start_date, end_date } = request.headers(['start_date', 'end_date'])
    const signature_id = request.input('signature_id')

    const delivery = await Delivery.find(params.id)

    if (start_date) {
      const hour = getHours(parseISO(start_date))
      if (!hour) {
        return response.status(401).send({
          error: { message: 'Invalid date!' }
        })
      }

      if (
        isBefore(hour, getHours(new Date().setHours(8))) ||
        isAfter(hour, getHours(new Date().setHours(18)))
      ) {
        return response.status(401).send({
          error: { message: 'Withdrawal time is outside the allowed limit' }
        })
      }

      const orderLength = await Delivery.query()
        .where('deliveryman_id', delivery.deliveryman_id)
        .getCount()

      if (orderLength >= 5) {
        return response.status(401).send({
          error: {
            message: 'You have already reached the limit of 5 withdrawals'
          }
        })
      }
      delivery.merge({ start_date })
    }

    if (end_date) {
      if (!signature_id) {
        return response.status(401).send({
          error: { message: 'Signature not provided' }
        })
      }

      const signature = await File.find(signature_id)

      if (!signature) {
        return response.status(401).send({
          error: { message: 'Signature not found' }
        })
      }

      if (!delivery.start_date) {
        return response.status(401).send({
          error: {
            message:
              "It's not possible to finish the delivery without first starting!"
          }
        })
      }

      if (isBefore(parseISO(end_date), delivery.start_date)) {
        return response.status(401).send({
          error: {
            message: 'Past dates are not permitted'
          }
        })
      }

      delivery.merge({ end_date, signature_id })
    }

    await delivery.save()
    return delivery
  }
}

module.exports = OrderController
