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

module.exports = {
  isConfigLoader: isConfigLoader,
  inherits: util.inherits
};
