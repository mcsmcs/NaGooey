'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');

var commandSchema = new mongoose.Schema({

	// http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#command
	
	// Command Name 
	// Examples: "check_ping", "check_something_other_descriptors"
	command_name: {
		type: String,
		required: true,
		unique: true
	},

	// Command Line: executable and arguments 
	// Examples: "/usr/local/nagios/libexec/check_pop -H $HOSTADDRESS$"
	command_line: {
		type: String,
		required: true
	},

	// Used internally to indicate that this command can be used
	// to determine host up/down (vs just service up/down).
	check_command: {
		type: Boolean,
		required: true,
		default: true
	},

	// Used for the configuration UI as an explanation of what
	// the command does.
	description: {
		type: String,
	}
});

commandSchema.statics.getCheckCommands = function(cb){
	this.find({check_command: true}, cb);
};

mongoose.model('Command', commandSchema);