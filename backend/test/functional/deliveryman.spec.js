const { test, trait, before } = use('Test/Suite')('Deliveryman')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use('Adonis/Acl/Role')
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

test('it should create new deliveryman if not exists', async ({
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
