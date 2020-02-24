'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Recipient = use('App/Models/Recipient')

/**
 * Resourceful controller for interacting with recipients
 */
class RecipientAdminController {
  /**
   * Show a list of all recipients.
   * GET recipients
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request }) {
    const page = request.header('page')
    const { q } = request.get()

    let recipients
    if (q) {
      recipients = await Recipient.query()
        .where('name', 'iLIKE', `%${q}%`)
        .paginate(page || 1)
    } else {
      recipients = await Recipient.query().paginate(page || 1)
    }

    return recipients
  }

  /**
   * Create/save a new recipient.
   * POST recipients
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request }) {
    const data = request.only([
      'name',
      'street',
      'number',
      'complement',
      'state',
      'city',
      'zip_code'
    ])

    const recipient = await Recipient.create(data)

    return recipient
  }

  /**
   * Display a single recipient.
   * GET recipients/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, response }) {
    try {
      const delivery = await Recipient.findOrFail(params.id)

      return delivery
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Recipient not found' } })
    }
  }

  /**
   * Update recipient details.
   * PUT or PATCH recipients/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    const data = request.only([
      'name',
      'street',
      'number',
      'state',
      'city',
      'zip_code'
    ])

    try {
      const recipient = await Recipient.findOrFail(params.id)

      recipient.merge(data)
      await recipient.save()

      return recipient
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Recipient not found' } })
    }
  }

  /**
   * Delete a recipient with id.
   * DELETE recipients/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response }) {
    try {
      const recipient = await Recipient.findOrFail(params.id)

      await recipient.delete()
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Recipient not found' } })
    }
  }
}

module.exports = RecipientAdminController
