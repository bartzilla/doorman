'use-strict';

var _ = require('lodash');

module.exports =  function extend(config, data){
  return _.merge({}, config, data);
};