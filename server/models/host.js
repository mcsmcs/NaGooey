'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var hostSchema = new mongoose.Schema({
	
	// Host Directives
	// http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#host

	host_name: String,
	display_name: String,
	alias: String,	
	address: String,

	_parents: Array,					// host_names
	_hostgroups: Array,					// hostgroup_names

	check_command: String,				// command_name
	initial_state: String,				// <o,d,u>
	check_period: String,				// timeperiod_name
	check_interval: Number,	
	retry_interval: Number,
	max_check_attempts: Number,
	active_checks_enabled: Boolean,
	passive_checks_enabled: Boolean,

	_contacts: Array,					// contacts
	_contact_groups: Array,				// contact_groups
	
	notifications_enabled: Boolean,
	first_notification_delay: Number,
	notification_interval: Number,
	notification_period: String,		// timeperiod_name
	
	// Virtual: 'notification_options' [d,u,r,f,s]
	notification_options_down: Boolean,			// 'd'
	notification_options_up: Boolean,			// 'u'
	notification_options_recovery: Boolean,		// 'r'
	notification_options_flapping: Boolean,		// 'f'
	notification_options_scheduled: Boolean,	// 's'
	
	// Virtual: 'stalking_options'  [o,d,u]
	stalking_options_up: Boolean,				// 'o'
	stalking_options_down: Boolean,				// 'd'
	stalking_options_unreachable: Boolean,		// 'u'
	
	obsess_over_host: Boolean,

	event_handler_enabled: Boolean,
	event_handler: String,				// command_name
	
	flap_detection_enabled: Boolean,
	low_flap_threshold: Number,
	high_flap_threshold: Number,
	
	// Virtual: 'flap_detection_options ' [o,d,u]
	flap_detection_options_up: Boolean,				// 'o'
	flap_detection_options_down: Boolean,			// 'd'
	flap_detection_options_unreachable: Boolean,	// 'u'
	
	check_freshness: Boolean,
	freshness_threshold: Number,

	process_perf_data: Boolean,
	retain_status_information: Boolean,
	retain_nonstatus_information: Boolean,
	
	notes: String,						
	notes_url: String,					// url
	action_url: String,					// url
	icon_image: String,					// image_file
	icon_image_alt: String,				
	vrml_image: String,					// image_file
	statusmap_image: String,			// image_file
	twoD_coords: String,				// x_coord,y_coord
	threeD_coords: String,				// x_coord,y_coord,z_coord
	
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
	schema.virtual(virtualName).get(stringToArray('_' + virtualName));
};

virtualArray(hostSchema, 'use');
virtualArray(hostSchema, 'parents');
virtualArray(hostSchema, 'hostgroups');
virtualArray(hostSchema, 'contacts');
virtualArray(hostSchema, 'contact_groups');

hostSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
hostSchema.virtual('register').get(function(){ return this._register; });

hostSchema.virtual('stalking_options').set(function(value){
	var i;
	var split = value.split(',');

	this.stalking_options_up = this.stalking_options_down = this.stalking_options_unreachable = false;
	for (i=0;i<split.length;i++){
		switch(split[i]){
			case 'o': this.stalking_options_up = true; break;
			case 'd': this.stalking_options_down = true; break;
			case 'u': this.stalking_options_unreachable = true; break;
			default: break;
		}
	}
});

hostSchema.virtual('flap_detection_options').set(function(value){
	var i;
	var split = value.split(',');

	this.flap_detection_options_up = this.flap_detection_options_down = this.flap_detection_options_unreachable = false;
	for (i=0;i<split.length;i++){
		switch(split[i]){
			case 'o': this.flap_detection_options_up = true; break;
			case 'd': this.flap_detection_options_down = true; break;
			case 'u': this.flap_detection_options_unreachable = true; break;
			default: break;
		}
	}
});

hostSchema.virtual('notification_options').set(function(value){
	var i;
	var split = value.split(',');

	this.notification_options_down = this.notification_options_up = this.notification_options_recovery = this.notification_options_flapping = this.notification_options_scheduled = false;
	for (i=0;i<split.length;i++){
		switch(split[i]){
			case 'd': this.notification_options_down = true; break;
			case 'u': this.notification_options_up = true; break;
			case 'r': this.notification_options_recovery = true; break;
			case 'f': this.notification_options_flapping = true; break;
			case 's': this.notification_options_scheduled = true; break;
			default: break;
		}
	}
});

// #################################################
// #                    Statics
// #################################################
hostSchema.statics.getHostsByMembers = function(members, cb){
	
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
hostSchema.statics.getNonHostgroupMembers = function(hostgroup, cb){
	this.find({hostgroups: {$not: {$elemMatch: {$regex: hostgroup}}}}, {host_name:1}, cb);
};

hostSchema.statics.getHostsByHostGroup = function(hostgroup, cb){
	
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

hostSchema.statics.updateHostgroupMembership = function(hostgroup, members, cb){

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


hostSchema.methods.addHostGroup = function(hostgroup){
	this.host_groups.addToSet(hostgroup);
	this.save();
};

hostSchema.methods.addParent = function(parent){
	this.parents.addToSet(parent);
	this.save();
};

hostSchema.methods.addContactGroup = function(contactgroup){
	this.contact_groups.addToSet(contactgroup);
	this.save();
};

hostSchema.methods.addNotificationOptions = function(notificationoptions){
	this.notification_options.addToSet(notificationoptions);
	this.save();
};

// hostSchema.methods.addTemplate = function(template){
// 	// needs to be an ordered set (no duplicates, and order matters)
// };

hostSchema.methods.isTemplate = function(){
	if (this.register === 'false' && this.name){
		return true;
	} else {
		return false;
	}
};


hostSchema.statics.getNagiosData = function(cb){
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

hostSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {host_name: obj.host_name}; }	// Object
	this.removeThenSave(query,obj,cb);
};

hostSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};

hostSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

hostSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('Host', hostSchema);