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
	action_url: String			// a url providing additional actions on the service group
	
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

mongoose.model('ServiceGroup', serviceGroupSchema);