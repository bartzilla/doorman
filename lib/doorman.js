var express = require('express');
var loadFileConfigStrategy = require('config/strategies/LoadWebAuthConfigStrategy');
var _ = require('lodash');

/**
 * Initialize doorman middleware.
 *
 * @method
 *
 * @param {Object} app - The express application.
 * @param {object} opts - A JSON object of user supplied options.
 *
 * @return {Function} An express middleware.
 */
module.exports.init = function (app, opts) {
  opts = opts || {};

  var router = express.Router();
  var config = initClient(app, opts);

  // if (web.idSite.enabled) {
  //   addGetRoute(web.idSite.uri, controllers.idSiteVerify);
  // }

  return router;
};

/**
 * Initialize the doorman client.
 *
 * @method
 * @private
 *
 * @param {Object} app - The express application.
 * @param {object} opts - A JSON object of user supplied options.
 *
 * @return {Function} A function which accepts a callback.
 */
function initClient(app, opts) {

  var client = {
    webAuthConf: LoadWebAuthConfigStrategy(path.join(__dirname, '/config.yml'), true)
  };
  client.on('error', function (err) {
    // logger.error(err);
    // app.emit('stormpath.error', err);
  });

  client.on('ready', function () {
    // app.set('stormpathClient', client);
    // app.set('stormpathConfig', client.config);
  });

  return client;
}