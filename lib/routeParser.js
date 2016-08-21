module.exports = function (route) {
  // 类型约束 -> 正则表达式 对应关系对象
  const types = {
    int: '\\d+',
    string: '[^/]+'
  };

  // 路由分割
  const segments = route.split(/{([a-zA-Z_][a-zA-Z0-9_-]*(?:|[^{}]*?))}/);

  // 组合路由正则表达式和提取路由变量
  var regex = '', variables = [];

  segments.forEach((segment) => {
    if (segment != '' && segment.indexOf('/') < 0) {
      var segmentSplit = segment.split(':');
      var varName = segmentSplit[0];
      var regexPart = segmentSplit[1];

      // 判断是否有变量约束
      if (regexPart) {
        // 替换类型约束为正则表达式
        regexPart = types[regexPart] || regexPart;
      } else {
        // 默认约束
        regexPart = types.string;
      }

      regex += '(' + regexPart + ')';
      variables.push(varName);
    } else {
      regex += segment;
    }
  });

  return {
    regex: regex,
    variables: variables
  };
};