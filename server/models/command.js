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
	},

		register: {
		type: Boolean,
		default: true
	},
	use: String,		// use [Template]
	name: String 		// Template Name
});

commandSchema.statics.getCheckCommands = function(cb){
	this.find({check_command: true}, cb);
};

commandSchema.statics.getNagiosData = function(cb){
	
	var i,property;
	var doc, docData;
	var returnData = [];
	var objCleanup = function(doc,ret,options){ 
		delete ret._id; 
		delete ret.__v; 
		delete ret.check_command;
		delete ret.description;

	};

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({transform: objCleanup});

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'extra_processing_neede':
							break;
						default:
							if(doc[property] instanceof Array){
								if(doc[property].length > 0){
									docData.push({directive: property, value: doc[property].join(',')});
								}
							}
							else if (doc[property] === true){ 
									docData.push({directive: property, value: '1'});
							}
							else if (doc[property] === false){
									docData.push({directive: property, value: '0'});
							}
							else {
								docData.push({directive: property, value: doc[property]});
							}
							break;
					}
				}
			}

			returnData.push(docData);
		}

		cb(err,returnData);
	});
};

mongoose.model('Command', commandSchema);