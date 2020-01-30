'use strict'

/*
|--------------------------------------------------------------------------
| AdminUserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')

class AdminUserSeeder {
  async run() {
    await User.create({
      name: 'Distribuidora FastFeet',
      email: 'admin@fastfeet.com',
      password: '123456'
    })
  }
}

module.exports = AdminUserSeeder
