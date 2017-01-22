'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {

		// middleware
		function isLoggedIn(req, res, next){
			if (req.isAuthenticated()){
				return next();
			} else {
				res.redirect("/login");
			}
		}

		var clickHandler = new ClickHandler();

    app.route('/')
        .get(isLoggedIn, function (req, res) {
            res.sendFile(path + '/public/index.html');
        });

		app.route('/login')
        .get(function (req, res) {
            res.sendFile(path + '/public/login.html');
        })
				.post(passport.authenticate('local-login', {
	        successRedirect : '/',
	        failureRedirect : '/login',
	        failureFlash : true
    		}));

		app.route('/logout')
				.get(function (req, res) {
					req.logout();
					res.redirect('/login');
				});

		app.route('/signup')
				.get(function(req, res) {
					res.sendFile(path + '/public/signup.html');
		    })
				.post(passport.authenticate('local-signup', {
							successRedirect: '/',
							failureRedirect: "/signup",
							failureFlash : true // allow flash messages
						}));

		app.route('/profile')
				.get(isLoggedIn, function (req, res) {
						res.sendFile(path + '/public/profile.html');
				});

		app.route('/api/:id')
				.get(isLoggedIn, function (req, res) {
					res.json(req.user);
				});

		app.route('/auth/github')
				.get(passport.authenticate('github',  { scope: [ 'user:email' ] }));

		app.route('/auth/github/callback')
				.get(passport.authenticate('github', {
					successRedirect: '/',
					failureRedirect: "/login"
				}));

		app.route('/auth/twitter')
				.get(passport.authenticate('twitter', { scope : 'email' }));

		app.route('/auth/twitter/callback')
				.get(passport.authenticate('twitter', {
					successRedirect: '/',
					failureRedirect: "/login",
				}));
		app.route('/auth/facebook')
				.get(passport.authenticate('facebook', { scope : 'email' }));

		app.route('/auth/facebook/callback')
				.get(passport.authenticate('facebook', {
					successRedirect: '/',
					failureRedirect: "/login"
				}));
		app.route('/auth/google')
				.get(passport.authenticate('google', { scope : ['profile', 'email'] }));

		app.route('/auth/google/callback')
				.get(passport.authenticate('google', {
					successRedirect: '/',
					failureRedirect: "/login"
				}));
    app.route('/api/:id/clicks')
        .get(isLoggedIn, clickHandler.getClicks)
        .post(isLoggedIn, clickHandler.addClick)
        .delete(isLoggedIn, clickHandler.resetClicks);

		// =============================================================================
		// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
		// =============================================================================

	  // locally --------------------------------
		app.route('/connect/local')
    	.get(function(req, res) {
        res.sendFile('connect-local.html');
				//res.sendFile('connect-local.html', { message: req.flash('loginMessage') });
		  })
    	.post(passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    	}));

    // facebook -------------------------------

		// send to facebook to do the authentication
		app.route('/connect/facebook')
    	.get(passport.authorize('facebook', { scope : 'email' }));

    // handle the callback after facebook has authorized the user
		app.route('/connect/facebook/callback')
	    .get(passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.route('/connect/twitter')
			.get(passport.authorize('twitter', { scope : 'email' }));

    // handle the callback after twitter has authorized the user
    app.route('/connect/twitter/callback')
      .get(passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


    // google ---------------------------------

    // send to google to do the authentication
    app.route('/connect/google')
			.get(passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.route('/connect/google/callback')
        .get(passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

};
