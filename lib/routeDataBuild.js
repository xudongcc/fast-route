module.exports = function (routeData) {
  var i = 0;
  var regex = '';
  var variables = [];

  for (i in routeData) {
    const part = routeData[i];

    if (typeof part == 'string') {
      regex += part;
      continue;
    }

    var varName = part.varName;
    var regexPart = part.regexPart;

    if (variables[varName]) {
      throw new Error('Cannot use the same placeholder "' + varName + '" twice');
    }

    variables.push(varName);
    regex += '(' + regexPart + ')';
  }

  return {
    regex: regex,
    variables: variables
  };
};