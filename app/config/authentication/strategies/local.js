'use strict';

var LocalStrategy   = require('passport-local').Strategy;
var User = require('../../../models/users');

module.exports = function (passport) {

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use("local-signup", new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.username' :  username }, function(err, user) {

          // if there are any errors, return the error
          if (err)
              return done(err);

          // check to see if theres already a user with that username
          if (user) {
              return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
          } else {
              // check to see if theres already a user with that email
              User.findOne({ 'local.email' :  req.body.email }, function(err, result) {
                if (err) return done(err);

                if (result) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                }
                // if there is no user with that username or email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.username  = username;
                newUser.local.password  = newUser.generateHash(password);
                newUser.local.email     = req.body.email;
                newUser.local.state     = newUser.activeState();

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
              });
            }
        });

      });

  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use("local-login", new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.username' :  username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, req.flash('loginMessage', 'Incorrect User.'));
        if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'Incorrect Password.'));
        return done (null, user);
      });
    });
  }));

}
