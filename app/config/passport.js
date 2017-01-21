'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
          done(err, user);
      });
  });

  passport.use(new GitHubStrategy({
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL
  },
  /*
  we need to implement what Passport refers to as the "verify callback."
  This is a callback function required by each type of strategy
  which will ensure the validity of the credentials and supply Passport
  with the user information that authenticated.
  */
  function (token, refreshToken, profile, done) {
    /*
    process.nextTick() is Node syntax that makes the code asynchronous.
    Node will wait until the current "tick" of the event loop completes
    before executing the callback function.
    This essentially makes Node wait until the user information comes back
    from GitHub before processing the results
    */
    process.nextTick(function () {
        User.findOne({ 'github.id': profile.id }, function (err, user) {

            if (err) {
                console.log("Error al recuperar usuario de github")
                return done(err);
            }

            if (!user) {
              var user = new User();
              user.nbrClicks.clicks = 0;
              user.github.id = profile.id;
              user.github.username = profile.username;
              user.github.displayName = profile.displayName;
              user.github.publicRepos = profile._json.public_repos;

              user.save(function (err) {
                if (err) {
                  console.log("Error al guardar el usuario actualizado")
                  throw err;
                }
              });
            }
            return done(null, user);
        });
    });
  }));

  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.clientID,
    consumerSecret: configAuth.twitterAuth.clientSecret,
    callbackURL: configAuth.twitterAuth.callbackURL
  },
  function (token, refreshToken, profile, done) {
    /*
    process.nextTick() is Node syntax that makes the code asynchronous.
    Node will wait until the current "tick" of the event loop completes
    before executing the callback function.
    This essentially makes Node wait until the user information comes back
    from GitHub before processing the results
    */
    process.nextTick(function () {
        User.findOne({ 'twitter.id': profile.id }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user){
              user = new User();
              user.nbrClicks.clicks = 0;
              user.twitter.id = profile.id_str;
              user.twitter.username = profile.name;
              user.twitter.displayName = profile.screen_name;

              user.save(function (err) {
                if (err) {
                    throw err;
                }
              });
            }
            return done(null, user);
        });
    });
  }));

};
