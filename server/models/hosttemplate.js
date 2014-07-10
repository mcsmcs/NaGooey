'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var hostTemplateSchema = new mongoose.Schema({
	
	// Host Directives
	// http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#host

	host_name: String,
	alias: String,	
	address: String,

	max_check_attempts: {
		type: Number,
	},

	check_period: {
		type: String,				// timeperiod_name
	},

	contacts: {
		type: Array,					// contacts
		
	},

	contact_groups: {
		type: Array,				// contact_groups
	},

	notification_interval: {
		type: Number,
	},

	notification_period: {
		type: String,		// timeperiod_name
	},

	check_command: {
		type: String,					// command_name
	},

	display_name: String,				
	parents: Array,						// host_names
	hostgroups: Array,					// hostgroup_names
	initial_state: String,				// [o,d,u]
	notification_options: {
		type: Array,
	},
	stalking_options: String,			// [o,d,u]
	event_handler: String,				// command_name
	flap_detection_options: String,		// [o,d,u]
	notes: String,						
	notes_url: String,					// url
	action_url: String,					// url
	icon_image: String,					// image_file
	icon_image_alt: String,				
	vrml_image: String,					// image_file
	statusmap_image: String,			// image_file
	twoD_coords: String,				// x_coord,y_coord
	threeD_coords: String,				// x_coord,y_coord,z_coord
	check_interval: Number,
	retry_interval: Number,
	active_checks_enabled: Boolean,
	passive_checks_enabled: Boolean,
	obsess_over_host: Boolean,
	check_freshness: Boolean,
	freshness_threshold: Number,
	event_handler_enabled: {
		type: Boolean,
	},
	low_flap_threshold: Number,
	high_flap_threshold: Number,
	flap_detection_enabled: {
		type: Boolean,
	},
	process_perf_data:  {
		type: Boolean,
	},
	retain_status_information: {
		type: Boolean,
	},
	retain_nonstatus_information: {
		type: Boolean,
	},
	first_notification_delay: Number,
	notifications_enabled: {
		type: Boolean,
	},

	register: String,
	use: String,		// use [Template]
	name: String, 		// Template Name

});


hostTemplateSchema.statics.getHostsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({$and: [{name: {$exists:false}},{host_name: {$in: members}}]}, {_id:0, host_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({$and: [{name: {$exists:false}},{host_name: {$not: {$in: members}}}]}, {_id:0, host_name:1}, callback);
		}
	},
		function(err,results){
			if(err){ console.log(err); }
			cb(err,results);
		}
	);
};

// Find hosts that are not members
hostTemplateSchema.statics.getNonHostgroupMembers = function(hostgroup, cb){
	this.find({hostgroups: {$not: {$elemMatch: {$regex: hostgroup}}}}, {host_name:1}, cb);
};

hostTemplateSchema.statics.getHostsByHostGroup = function(hostgroup, cb){
	
	var caller = this;
	var reMatch = "^" + hostgroup + "$";

	// TODO: clean this up using aggregation
	async.parallel(
		{
			members: function(callback){
				caller.find({$and: [{name: {$exists:false}},{hostgroups: {$elemMatch: {$regex: reMatch}}}]}, {host_name:1, _id:0}, callback);
			},
			nonmembers: function(callback){
				caller.find({$and: [{name: {$exists:false}},{hostgroups: {$not: {$elemMatch: {$regex: reMatch}}}}]}, {host_name:1, _id:0}, callback);
			},
		},
		
		cb
	);
};

hostTemplateSchema.statics.updateHostgroupMembership = function(hostgroup, members, cb){

	var caller = this;
	var reMatch = "^" + hostgroup + "$";

	async.series(
		[
			function(callback){
				// Remove membership for all members in hostgroup
				caller.update({hostgroups: {$elemMatch: {$regex: reMatch}}}, {$pull: {hostgroups: hostgroup}}, {multi: true}, function(err,num){
					if(err){ console.log(err); }
					callback();
				});
			},

			function(callback){
				caller.update({host_name: {$in: members}}, {$addToSet: {hostgroups: hostgroup}}, {multi: true}, function(err,num){
					if(err){console.log(err); }
					callback();
				});
			}
		],
	
		cb
	);
};


hostTemplateSchema.methods.addHostGroup = function(hostgroup){
	this.host_groups.addToSet(hostgroup);
	this.save();
};

hostTemplateSchema.methods.addParent = function(parent){
	this.parents.addToSet(parent);
	this.save();
};

hostTemplateSchema.methods.addContactGroup = function(contactgroup){
	this.contact_groups.addToSet(contactgroup);
	this.save();
};

hostTemplateSchema.methods.addNotificationOptions = function(notificationoptions){
	this.notification_options.addToSet(notificationoptions);
	this.save();
};

// hostTemplateSchema.methods.addTemplate = function(template){
// 	// needs to be an ordered set (no duplicates, and order matters)
// };


hostTemplateSchema.statics.getNagiosData = function(cb){
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

hostTemplateSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {host_name: obj.host_name}; }	// Object

	this.removeThenSave(query,obj,cb);
};

hostTemplateSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	console.log(obj);
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};

hostTemplateSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

hostTemplateSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('HostTemplate', hostTemplateSchema);