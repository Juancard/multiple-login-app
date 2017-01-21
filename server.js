'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');

// para ver headers http (agregado por mi, no viene en el clementine)
var logger = require("morgan");

/*
Mongoose is an object modeling tool for MongoDB.
It sits on top of the database and provides additional querying
and validaiton support for the database. Most importantly, it allows for the
definition of database schemas. A schema is a set of rules that determine
the type of data that can be inserted into the database.
*/
var mongoose = require('mongoose');

//Passport is the authentication and authorization library
//that will be used to validate users.
var passport = require('passport');

/*
 middleware for the Express framework that allow us to use sessions.
Sessions are essentially server-side storage where information like a user ID
are stored and persist through interaction with a website. This essentially
means that the site "remembers" your user ID and that you've been authenticated.
In the case of this app, it will allow us to interact with the website
without having to constantly re-authenticate.
*/
var session = require('express-session');

var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
    secret: 'secretClementine',
		/*
		secret is our session secret. This is essentially a "password"
		that is used to create the session and prevent it from being hijacked.
		This makes hacking session information harder to hack and
		helps prevent others from impersonating specific users.
		*/
    resave: false,
		/*
		resave simply tells Express if you want to re-save the session
		to storage even when it has not been modified.
		This value is typically set to false
		*/
    saveUninitialized: true
		/*
		saveUninitialized will force a new session (which has not been modified)
		to be created and stored. The default setting is true
		*/
}));

app.use(passport.initialize());
app.use(passport.session());
/*
passport.initialize is required by Passport in order to initialize
the Passport application. Similar to the Express initialization,
this will instantiate the Passport functionality.
Additionally, we use the passport.session() middleware to enable
the usage of session storage.
*/

//http headers on console
app.use(logger("combined")); // probar tambien con "dev"

app.use(flash()); // use connect-flash for flash messages stored in session

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('Node.js listening on port ' + port + '...');
});
