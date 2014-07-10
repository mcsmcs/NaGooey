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

	registered: { type: Boolean, default: true },
	templates: Array,		// use [Template]
	name: String 		// Template Name
});


// #################################################
// #                    Virtuals
// #################################################
commandSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this.registered = false; }
	else { this.registered = true; }
});

commandSchema.virtual('register').get(function(){
	if(this.registered === true){ return true; }
	if(this.registered === false){ return false; }
});

commandSchema.virtual('use').get(function(value){
	var split = value.split(',');
	this.templates = split;
});

commandSchema.virtual('use').set(function(){
	return this.templates.join(',');
});


// #################################################
// #                    Statics (model)
// #################################################

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

commandSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {command_name: obj.command_name}; }	// Object

	// Remove and re-add (clear stale values, fire pre-save)
	this.removeThenSave(query,obj,cb);
};

commandSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};

commandSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

commandSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('Command', commandSchema);