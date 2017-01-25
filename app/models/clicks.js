// SIN USAR, SOLO POR FINES DIDACTICOS

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Click = Schema({
  clicks: Number,
	// Mongoose automatically adds a property to every schema called __v.
	//This property is used for versioning and we've disabled this with:
  versionKey: false
});

//convert our schema to a Mongoose model.
//The model is an object constructor that represents documents within the database.
module.exports = mongoose.model('Click', Click);
