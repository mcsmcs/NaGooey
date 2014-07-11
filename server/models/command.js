'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');

var commandSchema = new mongoose.Schema({

	// http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#command
	
	command_name: {
		type: String,
		required: true,
		unique: true
	},

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

	/**************** Templates ****************/
	name: String, 			// Template Name
	_use: Array,			// Virtual: 'use'
	_register: Boolean,		// Virtual: 'register'
});


// #################################################
// #                    Virtuals
// #################################################
var stringToArray = function(property){
	return function(value){ this[property] = value.split(','); };
};
var arrayToString = function(property){
	return function(){ return this[property].join(','); };
};

var virtualArray = function(schema, virtualName){
	schema.virtual(virtualName).set(stringToArray('_' + virtualName));
	schema.virtual(virtualName).get(arrayToString('_' + virtualName));
};

virtualArray(commandSchema, 'use');

commandSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
commandSchema.virtual('register').get(function(){ return this._register; });


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
	var Model = this;

	var objCleanup = function(doc,ret,options){ 
		delete ret.id;

		// Remove internal properties
		Model.schema.eachPath(function(path){ if (/^_/.exec(path)){ delete ret[path]; }});

		// Remove empty properties
		for (property in ret){
			if (ret.hasOwnProperty(property)){
				if (ret[property] === undefined || ret[property] === ''){ delete ret[property]; }
			}
		}
	};

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({virtuals: true, transform: objCleanup});

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