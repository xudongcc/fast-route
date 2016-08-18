const _ = require('lodash');
const routeParser = require('./routeParser');
const routeDataBuild = require('./routeDataBuild');

module.exports = class FastRoute {
  constructor() {
    this.routesMap = {};
  }

  addRoute(method, route, handler) {
    const routeData = routeParser(route);
    const routeBuild = routeDataBuild(routeData);

    const regex = routeBuild.regex;
    const variables = routeBuild.variables;

    if (!this.routesMap[method]) {
      this.routesMap[method] = {};
    }

    if (this.routesMap[method][regex]) {
      throw new Error('Cannot register two routes matching "' + method + '" for method "' + regex + '"');
    }

    this.routesMap[method][regex] = {
      method: method,
      handler: handler,
      regex: regex,
      variables: variables
    };
  }

  routesMapCombined() {
    const routesMap = this.routesMap;
    const routesMapCombined = {};

    _.forEach(routesMap, (routesMap, method) => {
      // 合并正则表达式
      var regex = [];
      var routeMap = [];
      var routeMapCount = 0;

      _.forEach(routesMap, (route) => {
        // 合并正则表达式
        regex.push(route.regex);

        // 合并方法和变量
        routeMap[routeMapCount] = {
          handler: route.handler,
          variables: route.variables
        };

        routeMapCount = routeMapCount + route.variables.length;
      });

      routesMapCombined[method] = {
        regex: new RegExp('^(?:' + regex.join('|') + ')$'),
        routeMap: routeMap
      }
    });

    return routesMapCombined;
  }

  dispatch(method, url) {
    const routesMapCombined = this.routesMapCombined();
    const methodRoutesMapCombined = routesMapCombined[method];

    // 请求方法未定义任何路由返回 false
    if (typeof methodRoutesMapCombined == 'undefined') return false;

    var result = url.match(methodRoutesMapCombined.regex);

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

      if (result[i] != undefined && firstKey != null) {
        var varName = methodRoutesMapCombined.routeMap[firstKey].variables[i - firstKey];
        variables[varName] = result[i];
      }
    }

    return {
      handler: methodRoutesMapCombined.routeMap[firstKey].handler,
      variables: variables
    }
  }
};