'use strict';

var configAuth = require('../auth');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../../../models/users');

module.exports = function (passport) {

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true
    },

    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

          // check if the user is already logged in
          if (!req.user) {

            User.findOne({ 'google.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {

                  // if there is a user id already but is unactive
                  // just add our token and profile information
                  if (user.google.state == user.unactiveState()) {

                      user.google.token = token;
                      user.google.displayName  = profile.displayName;
                      user.google.email = (profile.emails && profile.emails[0].value) || "";
                      user.google.state = user.activeState();

                      user.save(function(err) {
                          if (err) throw err;
                          return done(null, user);
                      });
                  }
                  return done(null, user); // user found, return that user
                } else {
                    var newUser            = new User();

                    newUser.google.id    = profile.id; // set the users google id
                    newUser.google.token = token; // we will save the token that google provides to the user
                    newUser.google.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.google.email = (profile.emails && profile.emails[0].value) || ""; // google can return multiple emails so we'll take the first
                    newUser.google.state = newUser.activeState();

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
          } else {
            // user already exists and is logged in, we have to link accounts
            var user            = req.user; // pull the user out of the session

            user.google.id    = profile.id; // set the users google id
            user.google.token = token; // we will save the token that google provides to the user
            user.google.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
            user.google.email = (profile.emails && profile.emails[0].value) || ""; // google can return multiple emails so we'll take the first
            user.google.state = user.activeState();

            // save the user
            user.save(function(err) {
                if (err) throw err;
                return done(null, user);
            });
          }
        });

    }));

}
