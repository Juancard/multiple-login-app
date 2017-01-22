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
				.get(passport.authenticate('github'));

		app.route('/auth/github/callback')
				.get(passport.authenticate('github', {
					successRedirect: '/',
					failureRedirect: "/login"
				}));

		app.route('/auth/twitter')
				.get(passport.authenticate('twitter'));

		app.route('/auth/twitter/callback')
				.get(passport.authenticate('twitter', {
					successRedirect: '/',
					failureRedirect: "/login",
				}));
		app.route('/auth/facebook')
				.get(passport.authenticate('facebook'));

		app.route('/auth/facebook/callback')
				.get(passport.authenticate('facebook', {
					successRedirect: '/',
					failureRedirect: "/login"
				}));
    app.route('/api/:id/clicks')
        .get(isLoggedIn, clickHandler.getClicks)
        .post(isLoggedIn, clickHandler.addClick)
        .delete(isLoggedIn, clickHandler.resetClicks);
};
