'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var commandSchema = new mongoose.Schema({
		command_name: String,
		command_line: String
	});

	return mongoose.model('Command', commandSchema);
};