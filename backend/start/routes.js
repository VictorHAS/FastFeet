'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('sessions', 'SessionController.store').validator('Session')

Route.get('/files/:file', 'FileController.show')

Route.post('/file', 'FileController.store')

Route.group('Deliveryman Routes', () => {
  Route.get('/deliveryman/:id/deliveries', 'OrderController.index')
  Route.put('/deliveryman/deliveries/:id', 'OrderController.update')
  Route.get('/delivery/:id/problems', 'DeliveryProblemController.show')
  Route.post('/delivery/:id/problems', 'DeliveryProblemController.store')
})

Route.group('Admin Routes', () => {
  Route.resource('/recipient', 'RecipientAdminController').apiOnly()
  Route.resource('/deliveryman', 'DeliverymanAdminController').apiOnly()
  Route.resource('/delivery', 'DeliveryAdminController').apiOnly()
  Route.get('/problem', 'DeliveryProblemController.index')
  Route.delete(
    '/problem/:id/cancel-delivery',
    'DeliveryProblemController.destroy'
  )
}).middleware(['auth', 'is:admin'])
