'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../../../models/users');
var configAuth = require('../auth');

module.exports = function (passport) {

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

            if (user) {
              if (user.github.state == user.unactiveState()) {

                  user.github.token = token;
                  user.github.username = profile.username;
                  user.github.displayName  = profile.displayName;
                  user.github.email = (profile.emails && profile.emails[0].value) || "";
                  user.github.publicRepos = profile._json.public_repos;
                  user.github.state = user.activeState();

                  user.save(function(err) {
                      if (err) throw err;
                      return done(null, user);
                  });
              } else{
                return done(null, user);
              }
            } else{
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
                if (err) throw err;
                return done(null, user);
              });
            }
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
}
