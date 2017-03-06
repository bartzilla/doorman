'use strict';
var User = require('../../doorman/models/user');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/doorman-local');
/**
 * Register a new user -- via a browser.
 *
 * @method
 *
 * @param {Object} req - The http request.
 * @param {Object} res - The http response.
 * @param {function} next - The next callback.
 */


exports.registerGet = function (req, res, next) {
  res.render('register');
};

exports.registerUser = function(req, res,  next){
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  // Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors:errors
    });
  } else {
    var newUser = new User({
      name: name,
      email:email,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/login');
  }
};
