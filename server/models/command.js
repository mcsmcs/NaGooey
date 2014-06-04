'use strict';

var mongoose = require('mongoose');

var commandSchema = new mongoose.Schema({
		
	command_name: {
		type: String,
		required: true,
		unique: true
	},

	command_line: {
		type: String,
		required: true
	},

	check_command: {
		type: Boolean,
		required: true,
		default: true
	}
});

commandSchema.statics.getCheckCommands = function(cb){
	this.find({check_command: true}, cb);
};

mongoose.model('Command', commandSchema);