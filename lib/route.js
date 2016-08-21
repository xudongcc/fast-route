const _ = require('lodash');
const routeParser = require('./routeParser');

module.exports = class FastRoute {
  constructor() {
    this.addRouteLog = {};
    this.routeData = {};
    this.routeVariablesCount = 0;
  }

  addRoute(method, route, handler) {
    const routeData = routeParser(route);

    if (!this.addRouteLog[method]) {
      this.routeData[method] = {
        regex: '',
        routeMap: []
      };
      this.addRouteLog[method] = {};
    }

    if (this.addRouteLog[method][routeData.regex]) {
      throw new Error('Cannot register two routes matching "' + routeData.regex + '" for method "' + method + '"');
    }

    this.addRouteLog[method][routeData.regex] = {
      method: method,
      route: route,
      handler: handler,
      regex: routeData.regex,
      variables: routeData.variables
    };

    this.routeData[method]['regex'] = new RegExp('^(?:' + _.map(this.addRouteLog[method], 'regex').join('|') + ')$');
    this.routeData[method]['routeMap'][this.routeVariablesCount] = {
      handler: handler,
      variables: routeData.variables
    };

    this.routeVariablesCount += routeData.variables.length;
  }

  dispatch(method, url) {
    // 请求方法未定义任何路由返回 false
    if (typeof this.routeData[method]['regex'] == 'undefined') return false;

    var result = url.match(this.routeData[method]['regex']);

    // 没有匹配到路由返回 false
    if (!result) return false;

    result = result.slice(1);

    var variables = {};
    var firstKey = null;

    for (var i = 0; i < result.length; i++) {
      // 跳过空值
      if (result[i] == undefined && firstKey == null) {
        continue;
      }

      // 结束循环
      if (result[i] == undefined && firstKey != null) {
        break;
      }

      // 设置起始 KEY
      if (result[i] != undefined && firstKey == null) {
        firstKey = i;
      }

      // 提取组合路由变量键值
      if (result[i] != undefined && firstKey != null) {
        var varName = this.routeData[method]['routeMap'][firstKey]['variables'][i - firstKey];
        variables[varName] = result[i];
      }
    }

    return {
      handler: this.routeData[method]['routeMap'][firstKey]['handler'],
      variables: variables
    }
  }
};