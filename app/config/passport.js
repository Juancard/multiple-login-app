'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
      done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
          done(err, user);
      });
  });

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

  // =========================================================================
  // GITHUB SIGNUP ============================================================
  // =========================================================================
  passport.use(new GitHubStrategy({
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL,
    passReqToCallback: true,
    scope: 'user:email'
  },
  /*
  we need to implement what Passport refers to as the "verify callback."
  This is a callback function required by each type of strategy
  which will ensure the validity of the credentials and supply Passport
  with the user information that authenticated.
  */
  function (req, token, refreshToken, profile, done) {
    /*
    process.nextTick() is Node syntax that makes the code asynchronous.
    Node will wait until the current "tick" of the event loop completes
    before executing the callback function.
    This essentially makes Node wait until the user information comes back
    from GitHub before processing the results
    */
    process.nextTick(function () {
      if (!req.user){
        // if user is NOT already logged in
        User.findOne({ 'github.id': profile.id }, function (err, user) {

            if (err) {
                return done(err);
            }

            if (!user) {
              var user = new User();
              user.nbrClicks.clicks = 0;
              user.github.id = profile.id;
              user.github.token = token;
              user.github.username = profile.username;
              user.github.displayName = profile.displayName;
              user.github.publicRepos = profile._json.public_repos;
              user.github.email = profile.emails[0].value;
              user.github.state = user.activeState();

              user.save(function (err) {
                if (err) {
                  throw err;
                }
              });
            }
            return done(null, user);
        });
      } else {
        var user = req.user;
        user.github.id = profile.id;
        user.github.token = token;
        user.github.username = profile.username;
        user.github.displayName = profile.displayName;
        user.github.publicRepos = profile._json.public_repos;
        user.github.email = profile.emails[0].value;
        user.github.state = user.activeState();

        user.save(function (err) {
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }));

  // =========================================================================
  // TWITTER SIGNUP ============================================================
  // =========================================================================
  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.clientID,
    consumerSecret: configAuth.twitterAuth.clientSecret,
    callbackURL: configAuth.twitterAuth.callbackURL,
    passReqToCallback: true,
    includeEmail: true
  },
  function (req, token, refreshToken, profile, done) {
    /*
    process.nextTick() is Node syntax that makes the code asynchronous.
    Node will wait until the current "tick" of the event loop completes
    before executing the callback function.
    This essentially makes Node wait until the user information comes back
    from GitHub before processing the results
    */
    process.nextTick(function () {

      if (!req.user){
        // if user is NOT already logged in
        User.findOne({ 'twitter.id': profile.id }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user){
              user = new User();
              user.nbrClicks.clicks = 0;
              user.twitter.id = profile.id;
              user.twitter.token = token;
              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;
              user.twitter.email = profile.emails[0].value;
              user.twitter.state = user.activeState();

              user.save(function (err) {
                if (err) {
                    throw err;
                }
              });
            } else{
              // there is a user, then:

              // if there is a user id already but is unactive
              // just add our token and profile information
              if (user.twitter.state == user.unactiveState()) {

                  user.twitter.token = token;
                  user.twitter.username = profile.username;
                  user.twitter.displayName  = profile.displayName;
                  user.twitter.email = (profile.emails && profile.emails[0].value) || "";
                  user.twitter.state = user.activeState();

                  user.save(function(err) {
                      if (err) throw err;
                      console.log("en guardando usuario reactivado")
                      return done(null, user);
                  });
              }
            }
            console.log("en donde no tengo que estar!")
            return done(null, user);
        });
      } else{
        var user = req.user;
        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.username = profile.username;
        user.twitter.displayName = profile.displayName;
        user.twitter.email = profile.emails[0].value;
        user.twitter.state = user.activeState();

        user.save(function (err) {
          if (err) {
              throw err;
          }
          return done(null, user);
        });

      }
    });
  }));

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

                        user.facebook.token = token;
                        user.facebook.displayName  = profile.displayName;
                        user.facebook.email = (profile.emails && profile.emails[0].value) || "";
                        user.facebook.state = user.activeState();

                        user.save(function(err) {
                            if (err) throw err;
                            return done(null, user);
                        });
                    }
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user
                    newUser.facebook.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email = (profile.emails && profile.emails[0].value) || ""; // facebook can return multiple emails so we'll take the first
                    newUser.facebook.state = newUser.activeState();

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
            // If user was logged in
          } else {
            // user already exists and is logged in, we have to link accounts
            var user            = req.user; // pull the user out of the session

            // update the current users facebook credentials
            user.facebook.id    = profile.id;
            user.facebook.token = token;
            user.facebook.displayName  = profile.displayName;
            user.facebook.email = (profile.emails && profile.emails[0].value) || "";
            user.facebook.state = user.activeState();

            // save the user
            user.save(function(err) {
                if (err) throw err;
                return done(null, user);
            });
          }

      });

  }));
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
};
