'use strict';

var configAuth = require('../auth');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../../../models/users');
var CallbackVerificator = require("./CallbackVerificator");

var provider = 'facebook';
var credentials = {
    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'link', /*'about_me'*/, 'photos', 'emails'],
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}
function fillUser(user, profile, token, callback){
  user.facebook.id    = profile.id; // set the users facebook id
  user.facebook.token = token; // we will save the token that facebook provides to the user
  user.facebook.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
  user.facebook.email = (profile.emails && profile.emails[0].value) || ""; // facebook can return multiple emails so we'll take the first
  user.facebook.state = user.activeState();
  callback(null, user);
}

module.exports = function (passport) {
  var callbackVerificator = new CallbackVerificator(provider);
  callbackVerificator.fillUser = fillUser;
  passport.use(new FacebookStrategy(credentials, callbackVerificator.verifyCallback.bind(callbackVerificator)));
}
