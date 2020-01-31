'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Deliveryman = use('App/Models/Deliveryman')

/**
 * Resourceful controller for interacting with deliverymen
 */
class DeliverymanController {
  /**
   * Show a list of all deliverymen.
   * GET deliverymen
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index() {
    const deliverymen = await Deliveryman.all()

    return deliverymen
  }

  /**
   * Create/save a new deliveryman.
   * POST deliverymen
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const data = request.only(['name', 'avatar_id', 'email'])

    const deliveryman = await Deliveryman.create(data)

    return response.status(201).json(deliveryman)
  }

  /**
   * Display a single deliveryman.
   * GET deliverymen/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params }) {
    const deliveryman = await Deliveryman.find(params.id)

    return deliveryman
  }

  /**
   * Update deliveryman details.
   * PUT or PATCH deliverymen/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a deliveryman with id.
   * DELETE deliverymen/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = DeliverymanController
