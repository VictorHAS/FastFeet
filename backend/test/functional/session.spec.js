const { test, trait } = use('Test/Suite')('Session')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('it should return JWT token when session created', async ({
  assert,
  client
}) => {
  const sessionPayload = {
    email: 'victor@gmail.com',
    password: '123456'
  }

  await Factory.model('App/Models/User').create(sessionPayload)

  const response = await client
    .post('/sessions')
    .send(sessionPayload)
    .end()

  response.assertStatus(200)
  assert.exists(response.body.token)
})

test("it shouldn't return JWT, wrong credentials", async ({
  assert,
  client
}) => {
  await Factory.model('App/Models/User').create()

  const response = await client
    .post('/sessions')
    .send({
      email: 'teste@gmail.com',
      password: 'asdasd'
    })
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error.message, "Email or password doesn't match")
})
