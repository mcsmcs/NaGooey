'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var serviceGroupSchema = new mongoose.Schema({
	
	servicegroup_name: String,
	alias: String,
	_members: Array,				// Virtual members [services]
	_servicegroup_members: Array,	// Virtual servicegroup_members [servicegroups]
	
	notes: String,				// notes pertaining to the service group
	notes_url: String,			// a url for additional notes
	action_url: String,			// a url providing additional actions on the service group

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
	return function(){ this[property].join(','); };
};

var virtualArray = function(schema, virtualName){
	schema.virtual(virtualName).set(stringToArray('_' + virtualName));
	schema.virtual(virtualName).get(arrayToString('_' + virtualName));
};

virtualArray(serviceGroupSchema, 'use');
virtualArray(serviceGroupSchema, 'members');
virtualArray(serviceGroupSchema, 'servicegroup_members');

serviceGroupSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
serviceGroupSchema.virtual('register').get(function(){ return this._register; });


// #################################################
// #                    Statics
// #################################################
serviceGroupSchema.statics.getServiceGroupsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({$and: [{name: {$exists:false}},{servicegroup_name: {$in: members}}]}, {_id:0, servicegroup_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({$and: [{name: {$exists:false}},{servicegroup_name: {$not: {$in: members}}}]}, {_id:0, servicegroup_name:1}, callback);
		}
	},
		function(err,results){
			if(err){ console.log(err); }
			cb(err,results);
		}
	);
};


serviceGroupSchema.statics.getNagiosData = function(cb){
	var i,property;
	var doc, docData;
	var returnData = [];
	var objCleanup = function(doc,ret,options){ delete ret._id; delete ret.__v; };

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({transform: objCleanup});
			// console.log(doc);

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'needs_extra_processing':
							//process some stuff here
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

serviceGroupSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {servicegroup_name: obj.servicegroup_name}; }	// Object

	this.removeThenSave(query,obj,cb);
};

serviceGroupSchema.statics.removeThenSave = function(query,obj,cb){
	var doc;
	var Model = this;

	Model.remove(query, function(err){
		if(err){ console.log(err); }
		doc = new Model(obj);
		doc.save(cb);		
	});
};

serviceGroupSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

serviceGroupSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('ServiceGroup', serviceGroupSchema);