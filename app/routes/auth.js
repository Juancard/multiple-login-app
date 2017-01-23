'use strict';


module.exports = function (app, appEnv) {

  app.route('/login')
      .get(function (req, res) {
          res.sendFile(appEnv.path + '/public/login.html');
      })
      .post(appEnv.passport.authenticate('local-login', {
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
        res.sendFile(appEnv.path + '/public/signup.html');
      })
      .post(appEnv.passport.authenticate('local-signup', {
            successRedirect: '/',
            failureRedirect: "/signup",
            failureFlash : true // allow flash messages
          }));

  // =========================================================================
  //	AUTHENTICATION AND AUTHORIZATION (handled together)                =====
  // autehentication: connect not being logged in;                       =====
  // authorization: connect being logged in (link other social accounts) =====
  //==========================================================================

  // GITHUB
  app.route('/:action(auth|connect)/github')
  	.get(appEnv.passport.authenticate('github',  { scope: [ 'user:email' ] }));
  app.route('/auth/github/callback')
  		.get(appEnv.passport.authenticate('github', {
  			successRedirect: '/',
  			failureRedirect: "/login"
  		}));

  // TWITTER
  app.route('/:action(auth|connect)/twitter')
  	.get(appEnv.passport.authenticate('twitter', { scope : 'email' }));
  app.route('/auth/twitter/callback')
  	.get(appEnv.passport.authenticate('twitter', {
  			successRedirect: '/',
  			failureRedirect: "/login",
  		}))

  // FACEBOOK
  app.route('/:action(auth|connect)/facebook')
  	.get(appEnv.passport.authenticate('facebook', { scope : 'email' }));
  app.route('/auth/facebook/callback')
  		.get(appEnv.passport.authenticate('facebook', {
  			successRedirect: '/',
  			failureRedirect: "/login"
  		}))

  // GOOGLE
  app.route('/:action(auth|connect)/google')
  	.get(appEnv.passport.authenticate('google', { scope : ['profile', 'email'] }));
  app.route('/auth/google/callback')
  	.get(appEnv.passport.authenticate('google', {
  			successRedirect: '/',
  			failureRedirect: "/login"
  		}));

  // LOCAL
  app.route('/connect/local')
  	.get(function(req, res) {
      res.sendFile('connect-local.html');
  		//res.sendFile('connect-local.html', { message: req.flash('loginMessage') });
    })
  	.post(appEnv.passport.authenticate('local-signup', {
      successRedirect : '/', // redirect to the secure profile section
      failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  	}));

}
