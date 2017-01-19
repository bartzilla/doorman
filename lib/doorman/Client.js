'use strict';

var utils = require('./utils');
var events = require('events');

function Client(config) {
  var self = this;

  // Call the constructor of the EventEmitter class -- this, allows us to
  // initialize our Client object as an EventEmitter, and allows us to fire off
  // events later on.
  events.EventEmitter.call(self);

  // We'll maintain this class variable as an in-memory singleton for caching
  // purposes. We do this because Tenants never ever change once a Client has
  // been initialized, so it makes sense to cache the Tenant object so we don't
  // make unnecessary API requests if this object is looked up more than once.
  self._currentTenant = null;

  // Indicates whether or not this client is ready yet.
  self._isReady = false;

  // Setup how we load our configuration.
  var configLoader = null;

  // If the config is a config loader, then use that.
  if (utils.isConfigLoader(config)) {
    configLoader = config;
    // Just use our default client config loader.
  } else {
    configLoader = require('./configLoader')(config);
  }

  // Setup our call proxy.
  // var awaitReadyProxy = new ObjectCallProxy(self);

  // Attach our proxy so that all calls to our client is
  // intercepted and queued until the client is ready.
  // awaitReadyProxy.attach(function (name) {
    // Only proxy methods that start with either 'get' or 'create'.
    // return name.indexOf('get') === 0 || name.indexOf('create') === 0;
  // });

  // Load our configuration.
  process.nextTick(function () {
    configLoader.load(function (err, loadedConfig) {
      if (err) {
        // console.log('Error ' + err);
        self.emit('error', err);
        // awaitReadyProxy.detach(new Error('Stormpath client initialization failed. See error log for more details.'));
      } else {
        self.config = loadedConfig;
        // self._dataStore = new DataStore(loadedConfig);
        self._isReady = true;
        // awaitReadyProxy.detach();
        self.emit('ready', self);
      }
    });
  });
}

utils.inherits(Client, Object);
utils.inherits(Client, events.EventEmitter);

module.exports = Client;
