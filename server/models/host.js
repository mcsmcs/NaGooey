'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var hostSchema = new mongoose.Schema({
		
		host_name: {
			type: String,
			required: true,
			unique: true
		},
		
		address: {
			type: String,
			required: true,
			unique: true
		},
		
		alias: String,
		host_groups: Array,
		check_command: String,
		check_interval: Number,
		retry_interval: Number,
		max_check_attempts: Number,
		check_period: String,
		contact_groups: Array,
		notification_interval: Number,
		notification_period: Number,
		notification_options: Array,
		parents: Array,
		use: Array
	});

	
	hostSchema.methods.addHostGroup = function(hostgroup){
		this.host_groups.addToSet(hostgroup);
		this.save();
	}

	hostSchema.methods.addParent = function(parent){
		this.parents.addToSet(parent);
		this.save();
	}

	hostSchema.methods.addContactGroup = function(contactgroup){
		this.contact_groups.addToSet(contactgroup);
		this.save();
	}

	hostSchema.methods.addNotificationOptions = function(notificationoptions){
		this.notification_options.addToSet(notificationoptions);
		this.save();
	}

	hostSchema.methods.addTemplate = function(template){
		// needs to be an ordered set (no duplicates, and order matters)
	}

	return mongoose.model('Host', hostSchema);
};