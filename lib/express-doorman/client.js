'use strict';

var path = require('path');
var doorman = require('../doorman/doorman');
var doormanConfig = require('../doorman-config');
var configStrategy = doormanConfig.strategy;

// Factory method to create a client using a configuration only.
// The configuration provided to this factory is the final configuration.
function ClientFactory(config) {
  return new doorman.Client(
    new doormanConfig.Loader([
      new configStrategy.ExtendConfigStrategy(config)
    ])
  );
}

module.exports = function (config) {
  var configLoader = doorman.configLoader(config);

  // Load our integration config.
  configLoader.prepend(new configStrategy.LoadFileConfigStrategy(path.join(__dirname, '/config.yml'), true));
  // configLoader.add(new configStrategy.EnrichClientFromRemoteConfigStrategy(ClientFactory));
  // configLoader.add(new configStrategy.EnrichClientFromRemoteConfigStrategy(ClientFactory));
  // configLoader.add(new configStrategy.EnrichIntegrationFromRemoteConfigStrategy(ClientFactory));

  return new doorman.Client(configLoader);
};