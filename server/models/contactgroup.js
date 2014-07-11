'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');


var contactGroupSchema = new mongoose.Schema({

	contactgroup_name: { type: String, required: true, unique: true	},
	alias: { type: String, required: true },

	_members: Array,				// Virtual: 'members'
	_contactgroup_members: Array,	// Virtual: 'contactgroup_members'

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

virtualArray(contactGroupSchema, 'use');
virtualArray(contactGroupSchema, 'members');
virtualArray(contactGroupSchema, 'contactgroup_members');

contactGroupSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
contactGroupSchema.virtual('register').get(function(){ return this._register; });


// #################################################
// #                    Statics
// #################################################
contactGroupSchema.statics.getNagiosData = function(cb){
	
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
						case 'special_processing_needed':
							// processing
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

contactGroupSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {contactgroup_name: obj.contactgroup_name}; }	// Object

	this.removeThenSave(query,obj,cb);
};

contactGroupSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};
contactGroupSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

contactGroupSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('ContactGroup', contactGroupSchema);