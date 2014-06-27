'use strict';
/*jslint unparam: true, node: true */

/*
 *	Creates Nagios configuration files from the MongoDB database
 */

var async = require('async');
var fs    = require('fs');

require('../config/mongoose')();
var mongoose	= require('mongoose');
var Service		= mongoose.model("Service");
var Contact		= mongoose.model("Contact");
var Command		= mongoose.model("Command");
var Host 		= mongoose.model("Host");
var HostGroup	= mongoose.model("HostGroup");


var compileCommands = function(){

	Command.find({}, function(err, commands){
		if(err){ console.log(err); }
		// console.log(commands);

		var i, command;
		var commandDefinition, fileContents = [];

		for (i=0; i<commands.length; i++){
			command = commands[i];

			commandDefinition = [];
			commandDefinition.push('define command {');

			commandDefinition.push("\tcommand_name\t\t" + command.command_name);
			commandDefinition.push("\tcommand_line\t\t" + command.command_line);

			commandDefinition.push('}');
			commandDefinition.push('');
			
			fileContents.push(commandDefinition.join('\n'));
		}

		fs.writeFile('./Commands', fileContents.join('\n'), function(err){
			if(err){ console.log(err); }
			else { console.log('Commands file created'); }
		});
	});
};





/*
 * Compile the configuration files
 */
compileCommands();