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
const Role = use('Adonis/Acl/Role')

class AdminUserSeeder {
  async run() {
    const adminUser = await User.create({
      name: 'Distribuidora FastFeet',
      email: 'admin@fastfeet.com',
      password: '123456'
    })

    const admin = await Role.create({
      slug: 'admin',
      name: 'administrator'
    })

    await adminUser.roles().attach([admin.id])
  }
}

module.exports = AdminUserSeeder
