'use strict';

// main.js: — Any arbi­trary routes that can’t be grouped together
//log­i­cally in their own files.

module.exports = function (app, appEnv) {

  app.route('/')
      .get(appEnv.middleware.isLoggedIn, function (req, res) {
          res.sendFile(appEnv.path + '/public/index.html');
      });

}
