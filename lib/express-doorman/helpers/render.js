'use strict';

var path = require('path');

var jade = require('jade');
var Handlebars = require('handlebars');
var exphbs = require('express-handlebars');
// var mixin = require('utils-merge');

var viewCache = {};

function renderJade(filepath, locals) {
  var env = process.env.NODE_ENV;

  if (env === 'production') {
    if (!viewCache[filepath]) {
      viewCache[filepath] = jade.compileFile(filepath);
    }

    return viewCache[filepath](locals);
  }

  return jade.renderFile(filepath, locals);
}

function renderHandlebars(req, res, view, locals) {

  var app = req.app;

  if(app.get('view engine') !== 'handlebars'){
    var filepath = path.join(path.dirname(__dirname), 'views');
    app.set('views', filepath);
    app.engine('handlebars', exphbs({defaultLayout: filepath + '/layouts/layout.handlebars'}));
    app.set('view engine', 'handlebars');
  }

  // var env = process.env.NODE_ENV;
  //
  // if (env === 'production') {
  //   if (!viewCache[filepath]) {
  //     viewCache[filepath] = jade.compileFile(filepath);
  //   }
  //
  //   return viewCache[filepath](locals);
  // }

  return res.render(view, {options: locals});
}

/**
 * Render a view using app locals.
 *
 * By default, use Handlebars as it is necessary because our library can't rely
 * on the developer using Handlebars view as well -- so this allows us to use
 * Handlebars templates for our library views, without negatively affecting the
 * developer's application.
 *
 * If, however, the developer has supplied a render handler in their settings,
 * then we'll go ahead and use that render function instead.
 *
 * @method
 * @private
 *
 * @param {String} view - The filename to the view to render.
 * @param {Object} res - The http response.
 * @param {Object} options - The locals which will be supplied to the view
 *   during rendering.
 */
module.exports = function (req, res, view, options) {
  var config = req.app.get('doormanConfig');
  var extension = path.extname(view);
  var filename = path.basename(view, extension);

  options = options || {};
  // mixin(options, res.locals);
  // mixin(options, config.templateContext || {});

  if (!extension && (filename === view)) {
    // This means that we have received a default config option, such as
    // 'login' - just continue to render our default page.
    renderHandlebars(req, res, view, options)
  } else if (extension === '.handlebars') {
    renderHandlebars(req, res, view, options);
  } else if (extension) {
    // Delegate to the view engine.
    res.render(view, options);
  } else {
    throw new Error('Unexpected view option: "' + view + '".  Please see documentation for express-doorman');
  }
};
