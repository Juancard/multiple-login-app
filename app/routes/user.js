'use strict';

module.exports = function (app, appEnv) {

  app.route('/profile')
			.get(appEnv.middleware.isLoggedIn, function (req, res) {
					res.sendFile(appEnv.path + '/public/profile.html');
			});

  app.route('/api/:id')
			.get(appEnv.middleware.isLoggedIn, function (req, res) {
				res.json(req.user);
			});

  // =========================================================================
	// UNLINKING ACCOUNTS ======================================================
	//==========================================================================
	app.route('/unlink/:account(github|facebook|twitter|local|google)$')
		.get(appEnv.middleware.isLoggedIn, function(req, res){
      // CAREFUL: TOO MUCH LOGIC EN THIS GET

			var account = req.params.account;
			var user = req.user;
			user[account].state = user.unactiveState();
			user.save(function(err){
				if (err) throw err;
				console.log("User has been correctly unlinked");
				res.redirect("/profile");
			});
		});
}
