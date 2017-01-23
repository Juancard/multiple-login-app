'use strict';

var configAuth = require('../auth');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../../../models/users');

function fillUser(user, profile, token, callback){
  newUser.facebook.id    = profile.id; // set the users facebook id
  newUser.facebook.token = token; // we will save the token that facebook provides to the user
  newUser.facebook.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
  newUser.facebook.email = (profile.emails && profile.emails[0].value) || ""; // facebook can return multiple emails so we'll take the first
  newUser.facebook.state = newUser.activeState();
  callback(null, user);
}

module.exports = function (passport) {

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'link', /*'about_me'*/, 'photos', 'emails'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

              // find the user in the database based on their facebook id
              User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                  // if there is an error, stop everything and return that
                  // ie an error connecting to the database
                  if (err) return done(err);

                  // if the user is found, then log them in
                  if (user) {

                      // if there is a user id already but is unactive
                      // just add our token and profile information
                      if (user.facebook.state == user.unactiveState()) {
                        fillUser(user, profile, token, function(err, user){
                          user.save(function(err) {
                              if (err) throw err;
                              return done(null, user);
                          });
                        });
                      } else{
                        return done(null, user); // user found, return that user
                      }
                  } else {
                      // if there is no user found with that facebook id, create them
                      var newUser            = new User();
                      fillUser(user, profile, token, function(err, user){
                        user.save(function(err) {
                            if (err) throw err;
                            return done(null, user);
                        });
                      });
                  }

              });
              // If user was logged in
            } else {
              // user already exists and is logged in, we have to link accounts
              var user            = req.user; // pull the user out of the session
              fillUser(user, profile, token, function(err, user){
                user.save(function(err) {
                    if (err) throw err;
                    return done(null, user);
                });
              });;
            }

        });

    }));

}
