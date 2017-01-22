'use strict';
/*
We need a way to reference the app-specific GitHub authentication information
so that GitHub can confirm the application has permission to access its API
and retrieve user information. Previously, we created a .env file
and stored our private keys within. We'll need to reference the Node
process.env object somewhere in our to retrieve this information.

We'll use this information when we contact the GitHub API with Passport,
so we'll export it and make it available to require in other parts of our app.
*/
module.exports = {
    'githubAuth': {
        'clientID': process.env.GITHUB_KEY,
        'clientSecret': process.env.GITHUB_SECRET,
        'callbackURL': process.env.APP_URL + 'auth/github/callback'
    },
    'twitterAuth': {
        'clientID': process.env.TWITTER_KEY,
        'clientSecret': process.env.TWITTER_SECRET,
        'callbackURL': process.env.APP_URL + 'auth/twitter/callback'
    },
    'facebookAuth': {
        'clientID': process.env.FACEBOOK_KEY,
        'clientSecret': process.env.FACEBOOK_SECRET,
        'callbackURL': process.env.APP_URL + 'auth/facebook/callback'
    },
    'googleAuth': {
        'clientID': process.env.GOOGLE_KEY,
        'clientSecret': process.env.GOOGLE_SECRET,
        'callbackURL': process.env.APP_URL + 'auth/google/callback'
    }
};
//The 'callbackURL' is the URL we entered when registering our app,
//and this is where GitHub/whoever will send information
//once the user has been authenticated
