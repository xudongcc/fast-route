const Router = require('./lib/Router')
const route = new Router()

route.addRoute('GET', '/{name:string}/{id:int}', 'handler0')
route.addRoute('GET', '/{id:int}', 'handler1')
route.addRoute('GET', '/{name:string}', 'handler2')
route.addRoute('GET', '/post', 'handler3')
route.addRoute('GET', '/user', 'handler4')

const result = route.dispatch('GET', '/xudong')
console.log(result)
