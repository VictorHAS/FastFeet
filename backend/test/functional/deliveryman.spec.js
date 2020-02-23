'use strict'

const { test, trait } = use('Test/Suite')('Deliveryman')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Helpers = use('Helpers')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('it should be able to list only pending deliveries ', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })
  const delivery2 = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const response = await client
    .get(`/deliveryman/${deliveryman.id}/deliveries`)
    .header('open', true)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].product, delivery.product)
  assert.equal(response.body.data[1].product, delivery2.product)
})

test('it should be able to list only deliveries already delivered', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const date = new Date()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id,
    end_date: date
  })
  const delivery2 = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id,
    end_date: date
  })

  const response = await client
    .get(`/deliveryman/${deliveryman.id}/deliveries`)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].product, delivery.product)
  assert.equal(response.body.data[1].product, delivery2.product)
})

test('it should be able to update start_date', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const start_date = '2020-02-22T18:29:38.291Z'

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('start_date', start_date)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.product, delivery.product)
  assert.equal(response.body.start_date, start_date)
})

test("it shouldn't be able to update start_date, Invalid date!", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const start_date = '2020-02-22T2:29:38.291Z'

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('start_date', start_date)
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error.message, 'Invalid date!')
})

test("it shouldn't be able to update start_date, outside limit time", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const start_date = '2020-02-22T22:29:38.291Z'

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('start_date', start_date)
    .end()

  response.assertStatus(401)
  assert.equal(
    response.body.error.message,
    'Withdrawal time is outside the allowed limit'
  )
})

test("it shouldn't be able to update start_date, limit of 5 withdrawals", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').createMany(5, {
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const start_date = '2020-02-22T18:29:38.291Z'

  const response = await client
    .put(`/deliveryman/deliveries/${delivery[0].id}`)
    .header('start_date', start_date)
    .end()

  response.assertStatus(401)
  assert.equal(
    response.body.error.message,
    'You have already reached the limit of 5 withdrawals'
  )
})

test('it should be able to finish a delivery', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id,
    start_date: '2020-02-22T18:00:00.000Z'
  })

  const end_date = '2020-02-22T19:00:00.000Z'

  const signature = await client
    .post('/file')
    .attach('file', Helpers.tmpPath('test/avatar.png'))
    .end()

  signature.assertStatus(200)

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('end_date', end_date)
    .send({
      signature_id: signature.body.id
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.product, delivery.product)
  assert.equal(response.body.end_date, end_date)
})

test("it shouldn't be able to finish a delivery, Signature not provided", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id,
    start_date: '2020-02-22T18:00:00.000Z'
  })

  const end_date = '2020-02-22T19:00:00.000Z'

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('end_date', end_date)
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error.message, 'Signature not provided')
})

test("it shouldn't be able to finish a delivery, Signature not found", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id,
    start_date: '2020-02-22T18:00:00.000Z'
  })

  const end_date = '2020-02-22T19:00:00.000Z'

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('end_date', end_date)
    .send({
      signature_id: 1
    })
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error.message, 'Signature not found')
})

test("it shouldn't be able to finish a delivery, Without start_date", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const end_date = '2020-02-22T19:00:00.000Z'

  const signature = await client
    .post('/file')
    .attach('file', Helpers.tmpPath('test/avatar.png'))
    .end()

  signature.assertStatus(200)

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('end_date', end_date)
    .send({
      signature_id: signature.body.id
    })
    .end()

  response.assertStatus(401)
  assert.equal(
    response.body.error.message,
    "It's not possible to finish the delivery without first starting!"
  )
})

test("it shouldn't be able to finish a delivery, Past dates", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id,
    start_date: '2020-02-22T18:00:00.000Z'
  })

  const end_date = '2020-02-22T17:00:00.000Z'

  const signature = await client
    .post('/file')
    .attach('file', Helpers.tmpPath('test/avatar.png'))
    .end()

  signature.assertStatus(200)

  const response = await client
    .put(`/deliveryman/deliveries/${delivery.id}`)
    .header('end_date', end_date)
    .send({
      signature_id: signature.body.id
    })
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error.message, 'Past dates are not permitted')
})
