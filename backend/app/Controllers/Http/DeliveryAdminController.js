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

const Bull = use('Rocketseat/Bull')
const Job = use('App/Jobs/NewDeliveryEmail')

/**
 * Resourceful controller for interacting with deliveries
 */
class DeliveryAdminController {
  /**
   * Show a list of all deliveries.
   * GET delivery
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request }) {
    const page = request.headers('page')
    const { q } = request.get()

    let deliveries
    if (q) {
      deliveries = await Delivery.query()
        .where('product', 'iLIKE', `%${q}%`)
        .with('recipient')
        .with('deliveryman')
        .paginate(page || 1)
    } else {
      deliveries = await Delivery.query()
        .with('recipient')
        .with('deliveryman')
        .paginate(page || 1)
    }

    return deliveries
  }

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

    const deliveryman = await Deliveryman.find(deliveryman_id)
    if (!deliveryman)
      return response
        .status(404)
        .send({ error: { message: 'Deliveryman not found' } })
    const recipient = await Recipient.find(recipient_id)
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

    Bull.add(
      Job.key,
      {
        name: deliveryman.name,
        product,
        to: deliveryman.email
      },
      { delay: 2000, attempts: 3 }
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
  async show({ params, response }) {
    try {
      const delivery = await Delivery.findOrFail(params.id)

      await delivery.loadMany(['recipient', 'deliveryman'])

      return delivery
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Delivery not found' } })
    }
  }

  /**
   * Update delivery details.
   * PUT or PATCH delivery/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const data = request.only(['product', 'deliveryman_id', 'recipient_id'])

    try {
      const delivery = await Delivery.findOrFail(params.id)
      delivery.merge(data)
      await delivery.save()
      await delivery.loadMany(['recipient', 'deliveryman'])

      return delivery
    } catch (err) {
      return request
        .status(err.status)
        .send({ error: { message: 'Delivery not found' } })
    }
  }

  /**
   * Delete a delivery with id.
   * DELETE delivery/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    try {
      const delivery = await Delivery.findOrFail(params.id)

      await delivery.delete()
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Delivery not found' } })
    }
  }
}

module.exports = DeliveryAdminController
