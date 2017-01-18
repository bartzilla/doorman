'use strict';

var parsers = require('./../parser');
var mergeConfig = require('../helpers/mergeConfig');
var fs = require('fs');

/**
 * Load File Config Strategy
 * Represents a strategy that loads configuration from either a JSON or YAML file into the configuration.
 * @constructor
 */
function LoadWebAuthConfigStrategy (filePath, encoding) {
  this.filePath = filePath;
  this.encoding = 'utf8';
}

LoadWebAuthConfigStrategy.prototype.process = function (config, callback) {
  var filePath = this.filePath;

  if(!filePath || filePath.length === 0) return callback(new Error("Config file path was not provided."));

  var extension = 'yml';
  var parser = parsers[extension];

  fs.readFile(this.filePath, { encoding: this.encoding  }, function (err, result) {

    if (err) {
      return callback(err);
    }

    parser(result, function (err, data) {
      if (err) {
        return callback(new Error("Error parsing file Config.yml. \nDetails: " + err));
      }

      if (data) {
        var mergedConfig = mergeConfig(config, data);
        callback(null, mergedConfig);
      }
      return;
    });

  });
};

module.exports = LoadWebAuthConfigStrategy;
