var express = require('express');
var configStrategy = require('./doorman-config/configLoader').strategy;
var _ = require('lodash');
var winston = require('winston');
var path = require('path');

var helpers = require('./express-doorman/helpers');
var controllers = require('./express-doorman/controllers');
var bodyParser = helpers.bodyParser;
var version = require('../package.json').version;
var expressVersion = helpers.getAppModuleVersion('express') || 'unknown';
var userAgent = 'doorman-express/' + version + ' ' + 'express/' + expressVersion;


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
  opts.userAgent = userAgent;

  var logger = opts.logger;

  if (!logger) {
    logger = new winston.Logger({
      transports: [
        new winston.transports.Console({
          colorize: true,
          level: opts.debug || 'error'
        })
      ]
    });
  }

  app.set('doormanLogger', logger);

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

  function doormanUserAgentMiddleware(req, res, next) {
    var newUserAgent = userAgent;
    var config = req.app.get('doormanConfig');
    var doormanAgent = req.headers['x-doorman-agent'];

    if (doormanAgent) {
      newUserAgent = doormanAgent + ' ' + userAgent;
    }

    config.userAgent = newUserAgent;

    next();
  }

  function awaitClientReadyMiddleware(req, res, next) {
    if (isClientReady) {
      next();
    } else {
      app.on('doorman.ready', function () {
        next();
      });
    }
  }

  // Build routes.
  client.on('ready', function () {
    var config = app.get('doormanConfig');
    var web = config.web;

    function addGetRoute(path, controller) {
      router.get(path, bodyParser.forceDefaultBody(), controller);
    }

    function addPostRoute(path, controller, options) {
      router.post(path, bodyParser.formOrJson(options), controller);
    }

    if (web.register.enabled) {
      if (web.idSite.enabled) {
        addGetRoute(web.register.uri, controllers.idSiteRedirect({ path: web.idSite.registerUri }));
      } else {
        addGetRoute(web.register.uri, controllers.register);
        addPostRoute(web.register.uri, controllers.register, { limit: '11mb' });
      }
    }

    // if (web.login.enabled) {
    //   if (web.idSite.enabled) {
    //     addGetRoute(web.login.uri, controllers.idSiteRedirect({ path: web.idSite.loginUri }));
    //   } else {
    //     // router.use(web.login.uri, helpers.getUser);
    //     addGetRoute(web.login.uri, controllers.login);
    //     addPostRoute(web.login.uri, controllers.login);
    //   }
    // }
    app.set('doormanApplication', app);
    isClientReady = true;
    app.emit('doorman.ready');
  });

  router.use(doormanUserAgentMiddleware);

  app.use(awaitClientReadyMiddleware);

  return router;
};