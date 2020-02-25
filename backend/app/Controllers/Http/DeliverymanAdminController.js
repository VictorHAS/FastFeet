'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Deliveryman = use('App/Models/Deliveryman')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const File = use('App/Models/File')

/**
 * Resourceful controller for interacting with deliverymen
 */
class DeliverymanAdminController {
  /**
   * Show a list of all deliverymen.
   * GET deliverymen
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request }) {
    const page = request.header('page')
    const { q } = request.get()

    let deliverymen

    if (q) {
      deliverymen = await Deliveryman.query()
        .where('name', 'iLIKE', `%${q}%`)
        .with('avatar')
        .paginate(page || 1)
    } else {
      deliverymen = await Deliveryman.query()
        .with('avatar')
        .paginate(page || 1)
    }

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
    const { avatar_id, ...data } = request.only(['name', 'avatar_id', 'email'])

    if (avatar_id) {
      try {
        await File.findOrFail(avatar_id)
      } catch (err) {
        return response
          .status(err.status)
          .send({ error: { message: 'Avatar not found' } })
      }
    }

    try {
      const deliveryman = await Deliveryman.create(data)

      return deliveryman
    } catch (err) {
      return response.status(401).send({
        error: { message: 'Already exist Deliveryman with this name or email' }
      })
    }
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
  async show({ params, response }) {
    try {
      const deliveryman = await Deliveryman.findOrFail(params.id)

      await deliveryman.load('avatar')

      return deliveryman
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Deliveryman not found' } })
    }
  }

  /**
   * Update deliveryman details.
   * PUT or PATCH deliverymen/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const data = request.only(['name', 'email', 'avatar_id'])

    const deliveryman = await Deliveryman.find(params.id)

    if (!deliveryman) {
      return response
        .status(404)
        .send({ error: { message: 'Deliveryman not found' } })
    }

    deliveryman.merge(data)

    await deliveryman.save()
    await deliveryman.load('avatar')

    return deliveryman
  }

  /**
   * Delete a deliveryman with id.
   * DELETE deliverymen/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    try {
      const deliveryman = await Deliveryman.findOrFail(params.id)

      await deliveryman.delete()
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Deliveryman not found' } })
    }
  }
}

module.exports = DeliverymanAdminController
