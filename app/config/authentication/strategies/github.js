'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../../../models/users');
var configAuth = require('../auth');
var provider = "github";
var credentials = {
  clientID: configAuth.githubAuth.clientID,
  clientSecret: configAuth.githubAuth.clientSecret,
  callbackURL: configAuth.githubAuth.callbackURL,
  passReqToCallback: true,
  scope: 'user:email'
}

function fillUser(user, profile, token, callback){
  user[provider].id = profile.id;
  user[provider].token = token;
  user[provider].username = profile.username;
  user[provider].displayName = profile.displayName;
  user[provider].publicRepos = profile._json.public_repos;
  user[provider].email = profile.emails[0].value;
  user[provider].state = user.activeState();
  callback(null, user);
}

var verifyCallback = function (req, token, refreshToken, profile, done) {
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
      var providerId = provider + ".id";
      User.findOne({ providerId: profile.id }, function (err, user) {

          if (err) {
              return done(err);
          }

          if (user) {
            if (user[provider].state == user.unactiveState()) {
              fillUser(user, profile, token, function(err, user){
                user.save(function(err) {
                    if (err) throw err;
                    return done(null, user);
                });
              });
            } else{
              return done(null, user);
            }
          } else{
            var user = new User();
            user.nbrClicks.clicks = 0;
            fillUser(user, profile, token, function(err, user){
              user.save(function(err) {
                  if (err) throw err;
                  return done(null, user);
              });
            });
          }
      });
    } else {
      var user = req.user;
      fillUser(user, profile, token, function(err, user){
        user.save(function(err) {
            if (err) throw err;
            return done(null, user);
        });
      });
    }
  });
}


module.exports = function (passport) {

  passport.use(new GitHubStrategy(credentials, verifyCallback));

}
