'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../../../models/users');
var configAuth = require('../auth');
var CallbackVerificator = require("./CallbackVerificator.js");

var provider = "github";

var credentials = {
  clientID: configAuth.githubAuth.clientID,
  clientSecret: configAuth.githubAuth.clientSecret,
  callbackURL: configAuth.githubAuth.callbackURL,
  passReqToCallback: true,
  scope: 'user:email'
}

var fillUser = function(user, profile, token, callback){
    user[provider].id = profile.id;
    user[provider].token = token;
    user[provider].username = profile.username;
    user[provider].displayName = profile.displayName;
    user[provider].publicRepos = profile._json.public_repos;
    user[provider].email = profile.emails[0].value;
    user[provider].state = user.activeState();
    callback(null, user);
}

module.exports = function (passport) {
  var callbackVerificator = new CallbackVerificator(provider);
  callbackVerificator.fillUser = fillUser;
  passport.use(new GitHubStrategy(credentials, callbackVerificator.verifyCallback.bind(callbackVerificator)));
}
