module.exports = function (route) {
  const types = {
    int: '\\d+',
    string: '[^/]+'
  };

  const variableRegex = /{([a-zA-Z_][a-zA-Z0-9_-]*|[a-zA-Z_][a-zA-Z0-9_-]*:.*?)}/;
  const defaultDispatchRegex = '[^/]+';

  const re = new RegExp(variableRegex, 'g');
  const segments = route.split(re);

  const result = [];

  segments.forEach((segment, key) => {
    if (segment != '') {
      if (segment.indexOf('/') < 0) {
        const segmentSplit = segment.split(':');
        if (segmentSplit[1]) {
          if (typeof types[segmentSplit[1]] != 'undefined') segmentSplit[1] = types[segmentSplit[1]];

          result.push({
            varName: segmentSplit[0],
            regexPart: segmentSplit[1]
          });
        } else {
          result.push({
            varName: segmentSplit[0],
            regexPart: defaultDispatchRegex
          });
        }
      } else {
        result.push(segment);
      }
    }
  });

  return result;
}