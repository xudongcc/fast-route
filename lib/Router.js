const PARAMS_ROUTES_MAP = Symbol('Router#paramsRoutesMap')
const PARAMS_ROUTES_DATA = Symbol('Router#paramsRoutesData')
const PARAMS_ROUTES_REGEX = Symbol('Router#paramsRoutesRegex')

const STATIC_ROUTES_MAP = Symbol('Router#staticRoutesMap')
const STATIC_ROUTES_REGEX = Symbol('Router#staticRoutesRegex')

const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head']

function autoProp (PropType) {
  return new Proxy({}, {
    get (obj, prop) {
      if (typeof obj[prop] === 'undefined') obj[prop] = PropType ? new PropType() : null
      return obj[prop]
    }
  })
}

class Router {
  static get FOUND () { return 200 }
  static get NOT_FOUND () { return 404 }
  static get METHOD_NOT_ALLOWED () { return 405 }

  constructor () {
    this[PARAMS_ROUTES_MAP] = autoProp(Object)
    this[STATIC_ROUTES_MAP] = autoProp(Object)
    this[PARAMS_ROUTES_DATA] = autoProp(Array)
    this[PARAMS_ROUTES_REGEX] = autoProp()
    this[STATIC_ROUTES_REGEX] = autoProp()

    httpMethods.forEach((httpMethod) => {
      const httpMethodUpperCase = httpMethod.toUpperCase()
      this[httpMethod] = (...args) => this.addRoute(httpMethodUpperCase, ...args)
    })
  }

  buildRegexForRoute (route) {
    const paramTypes = { int: '\\d+', string: '[^/]+' }
    const paramNames = []
    const regex = route.replace(/{([a-zA-Z_]\w*)(|:(\w*))}/g, (...args) => {
      const paramName = args[1]
      const regexPart = args[3]

      paramNames.push(paramName)

      if (typeof regexPart !== 'undefined') {
        return `(${paramTypes[regexPart] || regexPart})`
      }

      return `(${paramTypes.string})`
    })

    return { regex, paramNames }
  }

  generateParamsRouteData (httpMethod) {
    let offset = 1

    const regex = Object.keys(this[PARAMS_ROUTES_MAP][httpMethod]).map((regex) => {
      const route = this[PARAMS_ROUTES_MAP][httpMethod][regex]
      this[PARAMS_ROUTES_DATA][httpMethod][offset] = route
      offset += route.paramNames.length
      return regex
    }).join('|')

    this[PARAMS_ROUTES_REGEX][httpMethod] = new RegExp(`^(?:${regex})$`)
  }

  generateStaticRouteData (httpMethod) {
    const regex = Object.keys(this[STATIC_ROUTES_MAP][httpMethod]).join('|')
    this[STATIC_ROUTES_REGEX][httpMethod] = new RegExp(`^(?:${regex})$`)
  }

  addParamsRoute (httpMethod, regex, paramNames, handler) {
    if (typeof this[PARAMS_ROUTES_MAP][httpMethod][regex] !== 'undefined') {
      throw new Error(`Cannot register two routes matching ${regex} for method ${httpMethod}`)
    }

    this[PARAMS_ROUTES_MAP][httpMethod][regex] = { httpMethod, handler, regex, paramNames }

    this.generateParamsRouteData(httpMethod)
  }

  addStaticRoute (httpMethod, route, handler) {
    if (typeof this[STATIC_ROUTES_MAP][httpMethod][route] !== 'undefined') {
      throw new Error(`Cannot register two routes matching ${route} for method ${httpMethod}`)
    }

    this[STATIC_ROUTES_MAP][httpMethod][route] = { httpMethod, handler, route }

    this.generateStaticRouteData(httpMethod)
  }

  addRoute (httpMethod, route, handler) {
    const { regex, paramNames } = this.buildRegexForRoute(route)

    if (paramNames.length > 0) {
      this.addParamsRoute(httpMethod, regex, paramNames, handler)
    } else {
      this.addStaticRoute(httpMethod, route, handler)
    }
  }

  paramsDispatch (httpMethod, uri) {
    const matches = uri.match(this[PARAMS_ROUTES_REGEX][httpMethod])
    if (!matches) return { status: Router.NOT_FOUND }

    for (var i = 1; matches[i] === undefined; ++i) {}

    const params = {}
    const route = this[PARAMS_ROUTES_DATA][httpMethod][i]
    route.paramNames.forEach((paramName) => { params[paramName] = matches[i++] })

    return { status: Router.FOUND, handler: route.handler, params }
  }

  staticDispatch (httpMethod, uri) {
    const route = this[STATIC_ROUTES_MAP][httpMethod][uri]
    if (!route) return { status: Router.NOT_FOUND }
    return { status: Router.FOUND, handler: route.handler }
  }

  dispatch (httpMethod, uri) {
    const staticResult = this.staticDispatch(httpMethod, uri)
    if (staticResult.status === Router.FOUND) return staticResult

    const paramsResult = this.paramsDispatch(httpMethod, uri)
    if (paramsResult.status === Router.FOUND) return paramsResult

    const allowedMethods = []
    Object.keys(this[STATIC_ROUTES_MAP]).forEach((method) => {
      if (method === httpMethod) return

      const { status } = this.staticDispatch(method, uri)
      if (status === Router.FOUND) allowedMethods.push(method)
    })

    Object.keys(this[PARAMS_ROUTES_MAP]).forEach((method) => {
      if (method === httpMethod) return
      if (allowedMethods.find(allowedMethod => allowedMethod === method)) return

      const { status } = this.paramsDispatch(method, uri)
      if (status === Router.FOUND) allowedMethods.push(method)
    })

    if (allowedMethods.length > 0) {
      return { status: Router.METHOD_NOT_ALLOWED, allowedMethods }
    }

    return { status: Router.NOT_FOUND }
  }
}

module.exports = Router
