'use strict'

const { test, trait } = use('Test/Suite')('Delivery Problems')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('it should be able to create new problem in delivery', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const lorem = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.'

  const response = await client
    .post(`/delivery/${delivery.id}/problems`)
    .send({
      description: lorem
    })
    .end()

  response.assertStatus(200)

  assert.equal(response.body.description, lorem)
})

test('it should be able to show all problems with single delivery', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })
  const problem = await Factory.model('App/Models/DeliveryProblem').create({
    delivery_id: delivery.id
  })

  const response = await client.get(`/delivery/${delivery.id}/problems`).end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].description, problem.description)
})
