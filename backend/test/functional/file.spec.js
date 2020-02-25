'use strict'

const { test, trait } = use('Test/Suite')('File')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Helpers = use('Helpers')

trait('Test/ApiClient')
trait('Test/Browser')
trait('DatabaseTransactions')
trait('Auth/Client')

test('it should be able to download file', async ({ client, browser }) => {
  const adminUser = await Factory.model('App/Models/User').create()
  await adminUser.roles().attach([1])

  const file = await client
    .post('/file')
    .loginVia(adminUser, 'jwt')
    .attach('file', Helpers.tmpPath('test/avatar.png'))
    .end()

  file.assertStatus(200)

  const page = await browser.visit(`/files/${file.body.name}`)
  await page.assertExists('img')
})
