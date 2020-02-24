'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Deliveryman = use('App/Models/Deliveryman')
const Helpers = use('Helpers')
const File = use('App/Models/File')

const Env = use('Env')
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

    await deliveryman.load('avatar')

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
  async update({ params, request, response }) {
    const data = request.only(['name', 'email'])
    const avatar = request.file('avatar', {
      types: ['image'],
      size: '2mb'
    })
    const deliveryman = await Deliveryman.findOrFail(params.id)

    if (avatar) {
      await avatar.move(Helpers.tmpPath('uploads'), {
        name: `${new Date().getTime()}.${avatar.subtype}`
      })

      if (!avatar.moved()) {
        return avatar.error()
      }

      const avatarId = await File.create({
        name: avatar.fileName,
        path: `${Env.get('APP_URL')}/files/${avatar.fileName}`
      })

      deliveryman.avatar_id = avatarId.id
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
  async destroy({ params }) {
    const deliveryman = await Deliveryman.find(params.id)

    await deliveryman.delete()
  }
}

module.exports = DeliverymanAdminController
