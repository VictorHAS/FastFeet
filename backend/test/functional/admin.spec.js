const { test, trait, before } = use('Test/Suite')('Admin management')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/mail/src/Mail')} */
const Helpers = use('Helpers')
const Role = use('Adonis/Acl/Role')
const Deliveryman = use('App/Models/Deliveryman')
const Delivery = use('App/Models/Delivery')
const Recipient = use('App/Models/Recipient')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

let adminUser

before(async () => {
  adminUser = await Factory.model('App/Models/User').create()

  const admin = await Role.create({
    slug: 'admin',
    name: 'administrator'
  })

  await adminUser.roles().attach([admin.id])
})

test("it shouldn't be able to use admin routes without admin role", async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const deliveryman = await client
    .post('/deliveryman')
    .loginVia(user, 'jwt')
    .send({
      name: 'Victor Entregador',
      email: 'victorhermes@gmail.com'
    })
    .end()

  deliveryman.assertStatus(403)

  const recipient = await client
    .post('/recipient')
    .loginVia(user, 'jwt')
    .send({
      name: 'Victor',
      street: 'Rua Novo Oriente',
      number: '66A',
      state: 'RN',
      city: 'Parnamirim',
      zip_code: '59147-140'
    })
    .end()

  recipient.assertStatus(403)
})

test('it should be able to create new deliveryman if not exists with avatar', async ({
  assert,
  client
}) => {
  const avatar = await client
    .post('/file')
    .loginVia(adminUser, 'jwt')
    .attach('file', Helpers.tmpPath('test/avatar.png'))
    .end()

  const response = await client
    .post('/deliveryman')
    .loginVia(adminUser, 'jwt')
    .send({
      name: 'Victor Entregador',
      avatar_id: avatar.body.id,
      email: 'victorhermes@gmail.com'
    })
    .end()

  response.assertStatus(201)
  assert.exists(response.body.id)
})

test('it should be able to list deliverymen', async ({ assert, client }) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .get('/deliveryman')
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)
  assert.exists(response.body.data[0].name, deliveryman.name)
  assert.exists(response.body.data[0].email, deliveryman.email)
})

test('it should be able to show single deliveryman', async ({
  assert,
  client
}) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .get(`/deliveryman/${deliveryman.id}`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)

  assert.equal(response.body.name, deliveryman.name)
  assert.equal(response.body.email, deliveryman.email)
})

test('it should be able to update deliveryman informations', async ({
  assert,
  client
}) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .put(`/deliveryman/${deliveryman.id}`)
    .loginVia(adminUser, 'jwt')
    .send({
      name: 'Victor',
      email: 'victor@deliveryman.com'
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.name, 'Victor')
  assert.equal(response.body.email, 'victor@deliveryman.com')
  assert.equal(response.body.id, deliveryman.id)
})

test('it should be able to update deliveryman avatar', async ({
  assert,
  client
}) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const response = await client
    .put(`/deliveryman/${deliveryman.id}`)
    .loginVia(adminUser, 'jwt')
    .attach('avatar', Helpers.tmpPath('test/avatar.png'))
    .end()

  response.assertStatus(200)
  assert.exists(response.body.avatar.name)
  assert.exists(response.body.avatar.path)
})

test('it should be able to delete a deliveryman', async ({
  assert,
  client
}) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .delete(`/deliveryman/${deliveryman.id}`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(204)

  const checkDeliveryman = await Deliveryman.find(deliveryman.id)

  assert.isNull(checkDeliveryman)
})

test('it should create new recipient', async ({ assert, client }) => {
  const response = await client
    .post('/recipient')
    .loginVia(adminUser, 'jwt')
    .send({
      name: 'Victor',
      street: 'Rua Novo Oriente',
      number: '66A',
      state: 'RN',
      city: 'Parnamirim',
      zip_code: '59147-140'
    })
    .end()

  response.assertStatus(200)
  assert.exists(response.body.id)
})

test('it should be able to list recipient', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()

  const response = await client
    .get('/recipient')
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)
  assert.exists(response.body.data[0].name, recipient.name)
})

test('it should be able to show single recipient', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()

  const response = await client
    .get(`/recipient/${recipient.id}`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)

  assert.equal(response.body.name, recipient.name)
})

test('it should be able to update recipient address', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()

  const response = await client
    .put(`/recipient/${recipient.id}`)
    .loginVia(adminUser, 'jwt')
    .send({
      name: 'Victor',
      street: 'Rua Novo Oriente'
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.name, 'Victor')
  assert.equal(response.body.street, 'Rua Novo Oriente')
  assert.equal(response.body.id, recipient.id)
})

test('it should be able to delete a recipient', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()

  const response = await client
    .delete(`/recipient/${recipient.id}`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(204)

  const checkRecipient = await Recipient.find(recipient.id)

  assert.isNull(checkRecipient)
})

test("it shouldn't create new delivery, Wrong id deliveryman", async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()

  const response = await client
    .post('/delivery')
    .loginVia(adminUser, 'jwt')
    .send({
      product: 'Produto test',
      deliveryman_id: 3,
      recipient_id: recipient.id
    })
    .end()

  response.assertStatus(404)

  assert.equal(response.body.error.message, 'Deliveryman not found')
})

test("it shouldn't create new delivery, Wrong id recipient", async ({
  assert,
  client
}) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .post('/delivery')
    .loginVia(adminUser, 'jwt')
    .send({
      product: 'Produto test',
      deliveryman_id: deliveryman.id,
      recipient_id: 3
    })
    .end()

  response.assertStatus(404)

  assert.equal(response.body.error.message, 'Recipient not found')
})

test('it should create new delivery', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .post('/delivery')
    .loginVia(adminUser, 'jwt')
    .send({
      product: 'Produto test',
      deliveryman_id: deliveryman.id,
      recipient_id: recipient.id
    })
    .end()

  response.assertStatus(200)

  assert.exists(response.body.id)
  assert.equal(response.body.deliveryman.email, deliveryman.email)
  assert.equal(response.body.recipient.name, recipient.name)
})

test('it should be able to list deliveries', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const response = await client
    .get('/delivery')
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].deliveryman.name, deliveryman.name)
  assert.equal(response.body.data[0].recipient.name, recipient.name)
  assert.equal(response.body.data[0].product, delivery.product)
})

test('it should be able to show single delivery', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const response = await client
    .get(`/delivery/${delivery.id}`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)

  assert.equal(response.body.product, delivery.product)
  assert.equal(response.body.deliveryman.name, deliveryman.name)
  assert.equal(response.body.recipient.name, recipient.name)
})

test('it should be able to update delivery informations', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const deliveryman2 = await Factory.model('App/Models/Deliveryman').create()

  const response = await client
    .put(`/delivery/${delivery.id}`)
    .loginVia(adminUser, 'jwt')
    .send({
      product: 'Produto atualizado',
      deliveryman_id: deliveryman2.id
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.product, 'Produto atualizado')
  assert.equal(response.body.deliveryman.id, deliveryman2.id)
})

test('it should be able to delete a delivery', async ({ assert, client }) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const response = await client
    .delete(`/delivery/${delivery.id}`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(204)

  const checkDelivery = await Delivery.find(delivery.id)

  assert.isNull(checkDelivery)
})

test('it should be able to list all problems with deliveries', async ({
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

  const response = await client
    .get('/problem')
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].description, problem.description)
})

test('it should be able to filter with name of Product', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create()
  const deliveryman = await Factory.model('App/Models/Deliveryman').create()
  const delivery = await Factory.model('App/Models/Delivery').create({
    product: 'Teste',
    deliveryman_id: deliveryman.id,
    recipient_id: recipient.id
  })

  const response = await client
    .get('/delivery?q=tes')
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].deliveryman.name, deliveryman.name)
  assert.equal(response.body.data[0].recipient.name, recipient.name)
  assert.equal(response.body.data[0].product, delivery.product)
})

test('it should be able to filter with name of Deliveryman', async ({
  assert,
  client
}) => {
  const deliveryman = await Factory.model('App/Models/Deliveryman').create({
    name: 'Teste'
  })

  const response = await client
    .get('/deliveryman?q=tes')
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data[0].name, deliveryman.name)
})

test('it should be able to filter with name of Recipient', async ({
  assert,
  client
}) => {
  const recipient = await Factory.model('App/Models/Recipient').create({
    name: 'Teste'
  })

  const response = await client
    .get('/recipient?q=tes')
    .loginVia(adminUser, 'jwt')
    .end()
  response.assertStatus(200)
  assert.equal(response.body.data[0].name, recipient.name)
})

test('it should be able to cancel delivery, and send mail', async ({
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

  const response = await client
    .delete(`/problem/${problem.id}/cancel-delivery`)
    .loginVia(adminUser, 'jwt')
    .end()

  response.assertStatus(204)

  const checkDelivery = await Delivery.find(delivery.id)
  assert.isNotNull(checkDelivery.canceled_at)
})
