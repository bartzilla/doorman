var express = require('express');
var configStrategy = require('./config/configLoader').strategy;
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

  var webAuthConfig = new configStrategy.LoadWebAuthConfigStrategy(path.join(__dirname, '/config.yml'));

  webAuthConfig.process(opts, function(error, extendedConfig){
    if(error) return console.log(error);

    var client = {
      webAuthConf: extendedConfig
    };

    console.log('This is the confObj', extendedConfig);

    return client;
  });
}