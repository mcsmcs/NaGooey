'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var commandSchema = new mongoose.Schema({
		
		command_name: {
			type: String,
			required: true
		},

		command_line: {
			type: String,
			required: true
		}
	});

	return mongoose.model('Command', commandSchema);
};