'use strict';

var User = require('../../../models/users');

var CallbackVerificator = function(provider){
  this.provider = provider;
}

CallbackVerificator.prototype = {
  fillUser: function(user, profile, token, callback){
     user[this.provider].id = profile.id;
     user[this.provider].token = token;
     user[this.provider].username = profile.username;
     user[this.provider].displayName = profile.displayName;
     user[this.provider].state = user.activeState();
     callback(null, user);
   },
   verifyCallback: function (req, token, refreshToken, profile, done) {

     // Save in which this function gets called
     // (when in nextTick, it changes and this.fillUser won't work anymore)
     // (Guessed right, it's a patch)
     var self = this;

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
        var providerId = profile.provider + ".id";
        User.findOne({ providerId: profile.id }, function (err, user) {

            if (err) {
                return done(err);
            }

            if (user) {
              if (user[profile.provider].state == user.unactiveState()) {
                self.fillUser(user, profile, token, function(err, user){
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
              self.fillUser(user, profile, token, function(err, user){
                user.save(function(err) {
                    if (err) throw err;
                    return done(null, user);
                });
              });
            }
        });
      } else {
        var user = req.user;
        self.fillUser(user, profile, token, function(err, user){
          user.save(function(err) {
              if (err) throw err;
              return done(null, user);
          });
        });
      }
    });
  }
}

module.exports = CallbackVerificator;
