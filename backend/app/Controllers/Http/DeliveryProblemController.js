'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const DeliveryProblem = use('App/Models/DeliveryProblem')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Delivery = use('App/Models/Delivery')

const Bull = use('Rocketseat/Bull')
const Job = use('App/Jobs/CancelDeliveryEmail')

/**
 * Resourceful controller for interacting with problems in deliveries
 */
class DeliveryProblemController {
  /**
   * Show a list of all deliveries with problems.
   * GET problem
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request }) {
    const page = request.header('page')
    const problem = await DeliveryProblem.query().paginate(page || 1)

    return problem
  }

  /**
   * Create/save a new problem.
   * POST delivery/:id/problems
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ params, request }) {
    const description = request.input('description')
    const problem = await DeliveryProblem.create({
      description,
      delivery_id: params.id
    })

    return problem
  }

  /**
   * Display a single problem.
   * GET delivery/:id/problems
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request }) {
    const page = request.header('page')
    const problem = await DeliveryProblem.query()
      .where('delivery_id', params.id)
      .paginate(page || 1)

    return problem
  }

  /**
   * Cancel a problem with id.
   * DELETE problem/:id/cancel-delivery
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params }) {
    const problem = await DeliveryProblem.find(params.id)
    const delivery = await Delivery.query()
      .where('id', problem.delivery_id)
      .with('deliveryman')
      .first()

    delivery.canceled_at = new Date()

    await delivery.save()
    const deliveryJson = delivery.toJSON()

    Bull.add(Job.key, {
      product: delivery.product,
      description: problem.description,
      deliveryman: deliveryJson.deliveryman.name,
      to: deliveryJson.deliveryman.email,
      id: deliveryJson.id
    })
  }
}

module.exports = DeliveryProblemController
