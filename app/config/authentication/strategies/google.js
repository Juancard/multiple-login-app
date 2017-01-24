'use strict';

var configAuth = require('../auth');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../../../models/users');
var CallbackVerificator = require("./CallbackVerificator");

var provider = 'google';
var credentials = {
    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.googleAuth.clientID,
    clientSecret    : configAuth.googleAuth.clientSecret,
    callbackURL     : configAuth.googleAuth.callbackURL,
    passReqToCallback : true
}
function fillUser(user, profile, token, callback){
  user.google.id    = profile.id; // set the users google id
  user.google.token = token; // we will save the token that google provides to the user
  user.google.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
  user.google.email = (profile.emails && profile.emails[0].value) || ""; // google can return multiple emails so we'll take the first
  user.google.state = user.activeState();
  callback(null, user);
}

module.exports = function (passport) {
  var callbackVerificator = new CallbackVerificator(provider);
  callbackVerificator.fillUser = fillUser;
  passport.use(new GoogleStrategy(credentials, callbackVerificator.verifyCallback.bind(callbackVerificator)));
}
