'use strict';

var configAuth = require('../auth');
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../../../models/users');
var CallbackVerificator = require("./CallbackVerificator");

var provider = 'twitter';
var credentials = {
  consumerKey: configAuth.twitterAuth.clientID,
  consumerSecret: configAuth.twitterAuth.clientSecret,
  callbackURL: configAuth.twitterAuth.callbackURL,
  passReqToCallback: true,
  includeEmail: true
}
function fillUser(user, profile, token, callback){
  user.twitter.id = profile.id;
  user.twitter.token = token;
  user.twitter.username = profile.username;
  user.twitter.displayName = profile.displayName;
  user.twitter.email = profile.emails[0].value;
  user.twitter.state = user.activeState();
  callback(null, user);
}

module.exports = function (passport) {
  var callbackVerificator = new CallbackVerificator(provider);
  callbackVerificator.fillUser = fillUser;
  passport.use(new TwitterStrategy(credentials, callbackVerificator.verifyCallback.bind(callbackVerificator)));
}
