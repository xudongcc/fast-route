const _ = require('lodash');
const routeParser = require('./routeParser');

module.exports = class FastRoute {
  constructor() {
    this.staticRoutesData = {};
    this.variableRoutesData = {};

    this.staticRoutesMap = {};
    this.variableRoutesMap = {};
  }

  addRoute(method, route, handler) {
    const routeData = routeParser(route);

    // 判断变量路由还是静态路由
    if(this.isStaticRoute(routeData)) {
      this.addStaticRoute(method, routeData, handler);
    } else {
      this.addVariableRoute(method, routeData, handler);
    }
  }

  isStaticRoute(routeData) {
    if (routeData.variables.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  addStaticRoute(method, routeData, handler) {
    if (!this.staticRoutesMap[method]) {
      this.staticRoutesMap[method] = {};
      this.staticRoutesData[method] = {
        regex: '',
        routeMap: []
      };
    }

    // 判断是否重复添加路由
    if (this.staticRoutesMap[method][routeData.regex]) {
      throw new Error('Cannot register two routes matching "' + routeData.regex + '" for method "' + method + '"');
    }

    // 添加路由到路由表
    this.staticRoutesMap[method][routeData.regex] = {
      method: method,
      regex: routeData.regex,
      handler: handler
    };

    // 合并路由
    this.staticRoutesData[method]['regex'] = new RegExp('^(?:(' + _.map(this.staticRoutesMap[method], 'regex').join(')|(') + '))$');
    this.staticRoutesData[method]['routeMap'].push(handler);
  }

  addVariableRoute(method, routeData, handler) {
    if (!this.variableRoutesMap[method]) {
      this.variableRoutesData[method] = {
        regex: '',
        routeMap: [],
        count: 0
      };
      this.variableRoutesMap[method] = {};
    }

    // 判断是否重复添加路由
    if (this.variableRoutesMap[method][routeData.regex]) {
      throw new Error('Cannot register two routes matching "' + routeData.regex + '" for method "' + method + '"');
    }

    // 添加路由到路由表
    this.variableRoutesMap[method][routeData.regex] = {
      method: method,
      routeData: routeData,
      handler: handler,
      regex: routeData.regex,
      variables: routeData.variables
    };

    // 合并路由
    this.variableRoutesData[method]['regex'] = new RegExp('^(?:' + _.map(this.variableRoutesMap[method], 'regex').join('|') + ')$');
    this.variableRoutesData[method]['routeMap'][this.variableRoutesData[method]['count']] = {
      handler: handler,
      variables: routeData.variables
    };

    // 统计变量数量
    this.variableRoutesData[method]['count'] += routeData.variables.length;
  }

  dispatch(method, url) {
    // 检查静态路由
    var staticResult = this.staticDispatch(method, url);
    if (staticResult) {
      return staticResult;
    }

    // 检查变量路由
    var variableResult = this.variableDispatch(method, url);
    if (variableResult) {
      return variableResult;
    }

    return false;
  }

  staticDispatch(method, url) {
    // 请求方法未定义任何路由返回 false
    if (typeof this.staticRoutesData[method] == 'undefined') return false;

    var result = url.match(this.staticRoutesData[method]['regex']);

    if (result) {
      const route = this.staticRoutesMap[method][result[0]];

      return {
        handler: route.handler,
        params: {}
      }
    } else {
      return false;
    }
  }

  variableDispatch(method, url) {
    // 请求方法未定义任何路由返回 false
    if (typeof this.variableRoutesData[method] == 'undefined') return false;

    var result = url.match(this.variableRoutesData[method]['regex']);

    // 没有匹配到路由返回 false
    if (!result) return false;

    result = result.slice(1);

    var params = {};
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
        var paramName = this.variableRoutesData[method]['routeMap'][firstKey]['params'][i - firstKey];
        params[paramName] = result[i];
      }
    }

    return {
      handler: this.variableRoutesData[method]['routeMap'][firstKey]['handler'],
      params: params
    }
  }
};