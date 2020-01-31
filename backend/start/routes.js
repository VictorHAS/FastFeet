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

Route.group(() => {
  Route.post('/file', 'FileController.store')
  Route.post('/recipients', 'RecipientController.store')
  Route.resource('/deliveryman', 'DeliverymanController')
}).middleware(['auth', 'is:admin'])
