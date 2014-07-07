'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');
var async = require('async');

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


	register: {
		type: Boolean,
		default: true
	},
	use: String,		// use [Template]
	name: String, 		// Template Name
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

hostGroupSchema.statics.getHostGroupsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({$and: [{name: {$exists:false}},{hostgroup_name: {$in: members}}]}, {_id:0, hostgroup_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({$and: [{name: {$exists:false}},{hostgroup_name: {$not: {$in: members}}}]}, {_id:0, hostgroup_name:1}, callback);
		}
	},
		function(err,results){
			if(err){ console.log(err); }
			cb(err,results);
		}
	);
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


hostGroupSchema.statics.getNagiosData = function(cb){
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

hostGroupSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {hostgroup_name: obj.hostgroup_name}; }	// Object

	this.update(query, obj, {upsert:true}, cb);
};

hostGroupSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

hostGroupSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('HostGroup', hostGroupSchema);