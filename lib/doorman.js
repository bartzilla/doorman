var express = require('express');
var configStrategy = require('./doorman-config/configLoader').strategy;
var _ = require('lodash');
var path = require('path');
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
  var client = initClient(app, opts);

  var isClientReady = false;
  // if (web.idSite.enabled) {
  //   addGetRoute(web.idSite.uri, controllers.idSiteVerify);
  // }


  // Build routes.
  client.on('ready', function () {
    var config = app.get('doormanConfig');
    var web = config.web;

    console.log('This is the web: ', web);


  });


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

  var client = require('./express-doorman/client')(opts);

  client.on('error', function (err) {
    logger.error(err);
    app.emit('doorman.error', err);
  });

  client.on('ready', function () {
    app.set('doormanClient', client);
    app.set('doormanConfig', client.config);
  });

    return client;
}