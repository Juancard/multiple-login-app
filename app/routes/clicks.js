'use strict';


module.exports = function (app, appEnv) {
  
  var ClickHandler = require(appEnv.path + '/app/controllers/clickHandler.server.js');
  var clickHandler = new ClickHandler();

  app.route('/api/:id/clicks')
      .get(appEnv.middleware.isLoggedIn, clickHandler.getClicks)
      .post(appEnv.middleware.isLoggedIn, clickHandler.addClick)
      .delete(appEnv.middleware.isLoggedIn, clickHandler.resetClicks);

}
