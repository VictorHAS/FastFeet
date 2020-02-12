'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Deliveryman = use('App/Models/Deliveryman')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Recipient = use('App/Models/Recipient')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Delivery = use('App/Models/Delivery')
const Mail = use('Mail')
/**
 * Resourceful controller for interacting with deliveries
 */
class DeliveryController {
  /**
   * Show a list of all deliveries.
   * GET delivery
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index() {}

  /**
   * Create/save a new delivery.
   * POST delivery
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const { product, deliveryman_id, recipient_id } = request.only([
      'product',
      'deliveryman_id',
      'recipient_id'
    ])

    const deliveryman = await Deliveryman.findOrFail(deliveryman_id)
    if (!deliveryman)
      return response
        .status(404)
        .send({ error: { message: 'Deliveryman not found' } })
    const recipient = await Recipient.findOrFail(recipient_id)
    if (!recipient)
      return response
        .status(404)
        .send({ error: { message: 'Recipient not found' } })

    const delivery = await Delivery.create({
      product,
      deliveryman_id,
      recipient_id
    })

    await delivery.loadMany(['deliveryman', 'recipient'])

    await Mail.send(
      ['emails.new_delivery'],
      {
        name: deliveryman.name,
        product
      },
      message => {
        message
          .to(deliveryman.email)
          .from('noreply@fastfeet.com.br', 'FastFeet')
          .subject('Novo produto disponível para retirada')
      }
    )

    return delivery
  }

  /**
   * Display a single delivery.
   * GET delivery/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params }) {}

  /**
   * Update delivery details.
   * PUT or PATCH delivery/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a delivery with id.
   * DELETE delivery/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params }) {}
}

module.exports = DeliveryController
