'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');

var objectDirectiveSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true,
		unique: true
	},

	type: {
		type: String,
		required: true,
	},

	description: {
		type: String,
		required: true
	}
});

//mongoose.model('ObjectDirective', objectDirectiveSchema);


var nagiosObjectSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true,
		unique: true
	},

	directives: [objectDirectiveSchema]

});

mongoose.model('NagiosObject', nagiosObjectSchema);
