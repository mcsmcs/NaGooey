'use strict';

var mongoose = require('mongoose');
var async = require('async');

module.exports = function(){

	var hostGroupSchema = new mongoose.Schema({
		hostgroup_name: {
			type: String,
			unique: true,
			required: true
		},

		alias: {
			type: String,
			unique: true,
			required: true
		},

		members: Array,				// hosts
		hostgroup_members: Array,	// hostgroups
		
		notes: String,				// note_string
		notes_url: String,			// url
		action_url: String,			// url
	});


	/***
	 *	Collection Methods
	 ***/
	hostGroupSchema.statics.isMember = function(host, callback){
		this.find({members: {$elemMatch: {$in: [host]}}}, {hostgroup_name:1, alias:1, _id:0}, callback);
	};

	hostGroupSchema.statics.isNotMember = function(host, callback){
		this.find({members: {$not: {$elemMatch: {$in: [host]}}}}, {hostgroup_name:1, alias:1, _id:0}, callback);
	};


	/***
	*	Given a host, returns 2 lists: a list of hostgroups it is a member of,
	*	and a list of hostgroups it is NOT a member of.
	***/
	hostGroupSchema.statics.getHostMembership = function(host, cb){

		//  TODO: clean this up apply/call/bind?
		var caller = this; // mongoose.Model("HostGroup");

		async.parallel({
			isMember: function(callback){
				caller.find({members: {$elemMatch: {$in: [host]}}}, {hostgroup_name:1, _id:0}, callback);
			},

			isNotMember: function(callback){
				caller.find({members: {$not: {$elemMatch: {$in: [host]}}}}, {hostgroup_name:1, _id:0}, callback);
			}
		},

		function(err, results){
			if(err){ console.log(err); }
			cb(err, results);
		});
	};

	/***
	*	Given a host name and it's desired hostgroup membership:
	*		remove the host name from any existing hostgroup.members
	*		THEN add the host to the desired hostgroup.members
	***/
	hostGroupSchema.statics.updateHostMembership = function(hostname, membership, cb){

		var caller = this;
		var isMember = (membership.isMember instanceof Array ? membership.isMember : Array(membership.isMember));
		var isNotMember = (membership.isNotMember instanceof Array ? membership.isNotMember : Array(membership.isNotMember));

		async.series(
			{	
				remove: function(callback){ caller.update({}, {$pull: {members: hostname}}, {multi: true}, callback); },
				add: function(callback){ caller.update({hostgroup_name: {$in: isMember}}, {$addToSet: {members: hostname}}, {multi: true}, callback); },
			},
			function(err,results){
				cb(err,results);
			}
		);
	};


	/***
	 *	Document Methods
	 ***/
	hostGroupSchema.methods.addMember = function(host){
		this.members.addToSet(host);
		this.save();
	};

	hostGroupSchema.methods.addHostgroupMember = function(hostgroup){
		this.hostgroup_members.addToSet(hostgroup);
		this.save();
	};



	return mongoose.model('HostGroup', hostGroupSchema);
};