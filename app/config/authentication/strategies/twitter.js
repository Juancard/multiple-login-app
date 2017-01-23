'use strict';

var configAuth = require('../auth');
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../../../models/users');

module.exports = function (passport) {
  
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
            if (user){
              if (user.twitter.state == user.unactiveState()) {

                  user.twitter.token = token;
                  user.twitter.username = profile.username;
                  user.twitter.displayName  = profile.displayName;
                  user.twitter.email = (profile.emails && profile.emails[0].value) || "";
                  user.twitter.state = user.activeState();

                  user.save(function(err) {
                      if (err) throw err;
                      return done(null, user);
                  });
              } else{
                return done(null, user);
              }
            } else{
              user = new User();
              user.nbrClicks.clicks = 0;
              user.twitter.id = profile.id;
              user.twitter.token = token;
              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;
              user.twitter.email = profile.emails[0].value;
              user.twitter.state = user.activeState();

              user.save(function (err) {
                if (err) throw err;
                return done(null, user);
              });
            }
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
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }));

}
