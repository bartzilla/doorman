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

function renderHandlebars(filepath, locals) {

  // var env = process.env.NODE_ENV;
  //
  // if (env === 'production') {
  //   if (!viewCache[filepath]) {
  //     viewCache[filepath] = jade.compileFile(filepath);
  //   }
  //
  //   return viewCache[filepath](locals);
  // }
  var template = Handlebars.compile(filepath);

  var data = {};
  var result = template(data);
  // var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
  //   "{{kids.length}} kids:</p>" +
  //   "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
  // var template = Handlebars.compile(source);
  //
  // var data = { "name": "Alan", "hometown": "Somewhere, TX",
  //   "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
  // var result = template(data);

  return result;
}

/**
 * Render a view using app locals.
 *
 * By default, use Jade as it is necessary because our library can't rely
 * on the developer using Jade view as well -- so this allows us to use
 * Jade templates for our library views, without negatively affecting the
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
  var app = req.app;
  var config = req.app.get('doormanConfig');
  var extension = path.extname(view);
  var filename = path.basename(view, extension);

  options = options || {};
  // mixin(options, res.locals);
  // mixin(options, config.templateContext || {});

  if (!extension && (filename === view)) {
    // This means that we have received a default config option, such as
    // 'login' - just continue to render our default page.

    console.log('Is engine set: ', app.get('view engine'));

    var viewPath = path.join(path.dirname(__dirname), 'views');
    app.set('views', viewPath);
    app.engine('handlebars', exphbs({layout: viewPath + '/layouts/layout'}));
    app.set('view engine', 'handlebars');
    res.render('register');
  }
  // } else if (extension === '.jade') {
  //   res.send(renderJade(view, options));
  // } else if (extension) {
  //   // Delegate to the view engine.
  //   res.render(view, options);
  // } else {
  //   throw new Error('Unexpected view option: "' + view + '".  Please see documentation for express-stormpath');
  // }
};
