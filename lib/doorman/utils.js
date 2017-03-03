'use strict';
var util = require('util');

var doormanConfig = require('../doorman-config');
function isConfigLoader(value) {
  if (value instanceof doormanConfig.Loader) {
    return true;
  }

  if (value && value.constructor && value.constructor.name === 'ConfigLoader') {
    return true;
  }

  return false;
}

function take(source, fromRight) {
  return fromRight ? source.pop() : source.shift();
}

/**
 * @private
 *
 * @description
 *
 * Takes a list of arguments and maps them to a list of names
 * in an alternating either a left-to-right, or right-to-left direction.
 */
function resolveArgs(argumentsObject, nameMap, rightToLeft) {
  var result = {};

  var takeFromRight = rightToLeft;
  var args = Array.prototype.slice.call(argumentsObject);

  while (nameMap.length) {
    var value = null;
    var name = take(nameMap, takeFromRight);

    if (args.length > 0) {
      value = take(args, takeFromRight);
      takeFromRight = !takeFromRight;
    }

    result[name] = value;
  }

  return result;
}

module.exports = {
  resolveArgs: resolveArgs,
  isConfigLoader: isConfigLoader,
  inherits: util.inherits
};
