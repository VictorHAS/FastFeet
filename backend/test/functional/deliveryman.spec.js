const { test, trait, before } = use('Test/Suite')('Deliveryman')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use('Adonis/Acl/Role')
const Deliveryman = use('App/Models/Deliveryman')
const Helpers = use('Helpers')

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

test("it shouldn't be able to use deliveryman routes without admin role", async ({
  client
}) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client
    .post('/deliveryman')
    .loginVia(user, 'jwt')
    .send({
      name: 'Victor Entregador',
      email: 'victorhermes@gmail.com'
    })
    .end()

  response.assertStatus(403)
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
  assert.exists(response.body[0].name, deliveryman.name)
  assert.exists(response.body[0].email, deliveryman.email)
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
