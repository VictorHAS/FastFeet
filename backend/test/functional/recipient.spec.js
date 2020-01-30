const { test, trait } = use('Test/Suite')('Recipient')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

const Role = use('Adonis/Acl/Role')

test("it shouldn't create new recipient without admin role", async ({
  assert,
  client
}) => {
  const adminUser = await Factory.model('App/Models/User').create({
    email: 'admin@fastfeet.com',
    password: '123456'
  })

  const response = await client
    .post('/recipients')
    .loginVia(adminUser, 'jwt')
    .send({
      name: 'Victor',
      street: 'Rua Novo Oriente',
      number: '66A',
      state: 'RN',
      city: 'Parnamirim',
      CEP: '59147-140'
    })
    .end()

  response.assertStatus(403)
})

test('it shouldt create new recipient', async ({ assert, client }) => {
  const adminUser = await Factory.model('App/Models/User').create({
    email: 'admin@fastfeet.com',
    password: '123456'
  })

  const admin = await Role.create({
    slug: 'admin',
    name: 'administrator'
  })

  await adminUser.roles().attach([admin.id])

  const response = await client
    .post('/recipients')
    .loginVia(adminUser, 'jwt')
    .send({
      name: 'Victor',
      street: 'Rua Novo Oriente',
      number: '66A',
      state: 'RN',
      city: 'Parnamirim',
      CEP: '59147-140'
    })
    .end()

  response.assertStatus(200)
  assert.exists(response.body.id)
})
