'use strict';

var utils = require('./utils');
var events = require('events');

var utils = require('./utils');
var DataStore = require('./ds/DataStore');

function Client(config) {
  var self = this;

  /**
   * @private
   *
   * @callback getResourceCallback
   *
   * @param {Error} err
   * The error (if there is one).
   *
   * @param {Object} resource
   * The retrieved resource object.
   */

  /**
   * Retrieves a resource object by href.
   *
   * @private
   *
   * @param {String} href
   * The URI of the resource.
   *
   * @param {Object} [query]
   * Key/value pairs to use as query parameters.
   *
   * @param {Function} [constructor]
   * The constructor function that will be invoked when the given resource
   * is retrieved. E.g. Account, Directory, Group, etc. Defaults to `InstanceResource`.
   * If a resource returned from the API is a collection (not a single resource object),
   * then each returned object in the `items` array will be passed into this constructor
   * function and initialized.
   *
   * @param {getResourceCallback} callback
   * The callback that handles the response.
   */
  Client.prototype.getResource = function () {
    return this._dataStore.getResource.apply(this._dataStore, arguments);
  };

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
        self._dataStore = new DataStore(loadedConfig);
        self._isReady = true;
        // awaitReadyProxy.detach();
        self.emit('ready', self);
      }
    });
  });
}

utils.inherits(Client, Object);
utils.inherits(Client, events.EventEmitter);

/**
 * Retrieves all the {@link Application} resources in the current {@link Tenant}.
 *
 * @param {CollectionQueryOptions} [collectionQueryOptions]
 * Options for querying, paginating, and expanding the collection.
 *
 * @param {Function} callback
 * The function to call when then the operation is complete. Will be called
 * with the parameters (err, {@link CollectionResource}). The collection will
 * be a list of {@link Application} objects.
 *
 * @example
 * client.getApplications(function (err, applicationCollection) {
 *   applicationCollection.each(function (application, next) {
 *     console.log(application);
 *     next();
 *   });
 * });
 */
Client.prototype.getApplications = function () {
  var args = utils.resolveArgs(arguments, ['options', 'callback'], true);

  this.getCurrentTenant(function (err, tenant) {
    if (err) {
      return args.callback(err);
    }

    return tenant.getApplications(args.options, args.callback);
  });
};


/**
 * Retrieves a {@link Application} resource.
 *
 * @param {String} href
 * The href of the {@link Application}.
 *
 * @param {ExpansionOptions} [expansionOptions]
 * For retrieving linked resources of the {@link Application} during
 * this request.
 *
 * @param {Function} callback
 * Callback function, will be called with (err, {@link Application}).
 *
 * @example
 * var href = 'https://api.stormpath.com/v1/applications/FOahc5HvwvfuAS03Yk2h1';
 *
 * client.getApplication(href, function (err, application) {
 *   console.log(application);
 * });
 */
Client.prototype.getApplication = function (href, callback) {
  var args = utils.resolveArgs(arguments, ['href', 'options', 'callback']);
  // return this.getResource(args.href, args.options, require('./resource/Application'), args.callback);
  var app = require('./resource/Application');


  return callback(null, new app(href));

};
module.exports = Client;
