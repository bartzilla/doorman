'use strict';

var utils = require('./utils');


function Client(config) {
  var self = this;

  // Call the constructor of the EventEmitter class -- this, allows us to
  // initialize our Client object as an EventEmitter, and allows us to fire off
  // events later on.
  // events.EventEmitter.call(self);

  // We'll maintain this class variable as an in-memory singleton for caching
  // purposes. We do this because Tenants never ever change once a Client has
  // been initialized, so it makes sense to cache the Tenant object so we don't
  // make unnecessary API requests if this object is looked up more than once.
  // self._currentTenant = null;

  // Indicates whether or not this client is ready yet.
  // self._isReady = false;

  // Setup how we load our configuration.
  var configLoader = null;

  // If the config is a config loader, then use that.
  if (utils.isConfigLoader(config)) {
    configLoader = config;
    // Just use our default client config loader.
  } else {
    configLoader = require('./configLoader')(config);
  }

  // Load our configuration.
  process.nextTick(function () {
    configLoader.load(function (err, loadedConfig) {
      if (err) {
        // self.emit('error', err);
      } else {
        self.config = loadedConfig;
      }
    });
  });
}

module.exports = Client;
