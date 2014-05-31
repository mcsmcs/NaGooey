'use strict';

var async = require('async');
var mongoose = require('mongoose');

module.exports = function(){

	var hostSchema = new mongoose.Schema({
		
		// Host Directives
		// http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#host

		host_name: {
			type: String,
			required: true,
			unique: true
		},

		alias: {
			type: String,
			required: true
		},
		
		address: {
			type: String,
			required: true,
			unique: true
		},
		
		check_command: {
			type: String,					// command_name
			required: true,
		},

		display_name: String,				
		parents: Array,						// host_names
		hostgroups: Array,					// hostgroup_names
		initial_state: String,				// [o,d,u]
		check_period: String,				// timeperiod_name
		event_handler: String,				// command_name
		flap_detection_options: String,		// [o,d,u]
		contacts: Array,					// contacts
		contact_groups: Array,				// contact_groups
		notification_period: String,		// timeperiod_name
		notification_options: String,		// [d,u,r,f,s]
		stalking_options: String,			// [o,d,u]
		notes: String,						
		notes_url: String,					// url
		action_url: String,					// url
		icon_image: String,					// image_file
		icon_image_alt: String,				
		vrml_image: String,					// image_file
		statusmap_image: String,			// image_file
		twoD_coords: String,				// x_coord,y_coord
		threeD_coords: String,				// x_coord,y_coord,z_coord
		max_check_attempts: Number,
		check_interval: Number,
		retry_interval: Number,
		active_checks_enabled: Boolean,
		passive_checks_enabled: Boolean,
		obsess_over_host: Boolean,
		check_freshness: Boolean,
		freshness_threshold: Number,
		event_handler_enabled: Boolean,
		low_flap_threshold: Number,
		high_flap_threshold: Number,
		flap_detection_enabled: Boolean,
		process_perf_data: Boolean,
		retain_status_information: Boolean,
		retain_nonstatus_information: Boolean,
		notification_interval: Number,
		first_notification_delay: Number,
		notifications_enabled: Boolean,

	});

	
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
					caller.find({hostgroups: {$elemMatch: {$regex: reMatch}}}, {host_name:1, _id:0}, callback);
				},
				nonmembers: function(callback){
					caller.find({hostgroups: {$not: {$elemMatch: {$regex: reMatch}}}}, {host_name:1, _id:0}, callback);
				}
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
					caller.update({hostgroups: {$elemMatch: {$regex: reMatch}}}, {$pull: {hostgroups: hostgroup}}, {multi: true}, function(err, num){
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

	return mongoose.model('Host', hostSchema);
};