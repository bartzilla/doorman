var express = require('express');
var configStrategy = require('./doorman-config/configLoader').strategy;
var _ = require('lodash');
var winston = require('winston');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var helpers = require('./express-doorman/helpers');
var controllers = require('./express-doorman/controllers');

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

  // helpers.getFormViewModel('login', config, function () {});
  // helpers.getFormViewModel('register', config, function () {});
  // View Engine
  var filePath = path.join(__dirname, 'express-doorman/views');
  app.set('views', filePath);
  app.engine('handlebars', exphbs({defaultLayout: filePath + '/layouts/layout.handlebars'}));
  app.set('view engine', 'handlebars');

  // BodyParser Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Set Static Folder
  app.use(express.static(path.join(__dirname, 'public')));

  // Express Session
  app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  }));

  // Passport init
  app.use(passport.initialize());
  app.use(passport.session());

  // Express Validator
  app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

  // Connect Flash
  app.use(flash());

  // Global Vars
  app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

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
      router.get(path, controller);
    }

    function addPostRoute(path, controller, options) {
      router.post(path, controller);
    }
    //
    if (web.register.enabled) {
      addGetRoute(web.register.uri, controllers.register.registerGet);
      addPostRoute(web.register.uri, controllers.register.registerUser);
    }

    if (web.login.enabled) {
      addGetRoute(web.login.uri, controllers.login.loginGet);
      // addPostRoute(web.login.uri, controllers.login.loginPost);
    }


    client.getApplication(config.application.href, function (err, application) {
      if (err) {
        throw new Error('Cannot fetch application ' + config.application.href);
      }

      // Warm the view model cache

      app.set('doormanApplication', application);
      isClientReady = true;
      app.emit('doorman.ready');
    });


  });

  router.use(doormanUserAgentMiddleware);

  app.use(awaitClientReadyMiddleware);

  return router;
};