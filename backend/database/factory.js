'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker, i, data = {}) => {
  return {
    name: faker.name(),
    email: faker.email(),
    password: faker.string(),
    ...data
  }
})

Factory.blueprint('App/Models/Deliveryman', (faker, i, data = {}) => {
  return {
    name: faker.name(),
    email: faker.email(),
    ...data
  }
})

Factory.blueprint('App/Models/Recipient', (faker, i, data = {}) => {
  return {
    name: faker.name(),
    street: faker.street(),
    number: faker.geohash(),
    state: faker.state(),
    city: faker.city(),
    zip_code: faker.zip(),
    ...data
  }
})

Factory.blueprint('App/Models/Delivery', (faker, i, data = {}) => {
  return {
    product: faker.sentence({ words: 2 }),
    ...data
  }
})

Factory.blueprint('App/Models/DeliveryProblem', (faker, i, data = {}) => {
  return {
    description: faker.sentence(),
    ...data
  }
})
