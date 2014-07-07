'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var serviceGroupSchema = new mongoose.Schema({
	
	servicegroup_name: {
		type: String,
		unique: true,
		required: true
	},

	alias: String,
	members: Array,				// services
	servicegroup_members: Array,// service groups
	notes: String,				// notes pertaining to the service group
	notes_url: String,			// a url for additional notes
	action_url: String,			// a url providing additional actions on the service group

	register: {
		type: Boolean,
		default: true
	},
	use: String,		// use [Template]
	name: String, 		// Template Name
});

serviceGroupSchema.statics.getServiceGroupsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({servicegroup_name: {$in: members}}, {_id:0, servicegroup_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({servicegroup_name: {$not: {$in: members}}}, {_id:0, servicegroup_name:1}, callback);
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
mongoose.model('ServiceGroup', serviceGroupSchema);