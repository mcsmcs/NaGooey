'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var contactSchema = new mongoose.Schema({
	
	contact_name: {
		type: String,
		required: true,
		unique: true,
	},

	alias: String,
	email: String,
	pager: String,
	
	host_notifications_enabled: {
		type: Boolean,
		required: true,
		default: true,
	},

	service_notifications_enabled: {
		type: Boolean,
		required: true,
		default: true
	},


	// Time Periods
	host_notification_period: {
		type: String,	// time_period
		required: true
	},

	service_notification_period: {
		type: String,	// time_period
		required: true
	},

	host_notification_options: {
		down: {
			type: Boolean,
			required: true,
			default: true
		},

		up: {
			type: Boolean,
			required: true,
			default: true
		},

		recoveries: {
			type: Boolean,
			required: true,
			default: true
		},

		flapping: {
			type: Boolean,
			required: true,
			default: true
		},

		scheduled: {
			type: Boolean,
			required: true,
			default: true
		},
	},

	service_notification_options: {
		warning: {
			type: Boolean,
			required: true,
			default: true
		},

		unknown: {
			type: Boolean,
			required: true,
			default: true
		},

		critical: {
			type: Boolean,
			required: true,
			default: true
		},

		recoveries: {
			type: Boolean,
			required: true,
			default: true
		},

		flapping: {
			type: Boolean,
			required: true,
			default: true
		},
	},

	host_notification_commands: {
		type: String,
		required: true,
		default: 'notify-by-email'
	},

	service_notification_commands: {
		type: String,
		required: true,
		default: 'notify-by-email'
	},
	
	can_submit_commands: {
		type: Boolean,
		required: true,
		default: true
	},

	retain_status_information: Boolean,
	retain_nonstatus_information: Boolean

});


contactSchema.statics.getContactsExcept = function(contacts, cb){
	this.find({contact_name: {$not: {$in: contacts}}}, {_id:0, contact_name:1}, cb);
};

contactSchema.statics.getContactsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({contact_name: {$in: members}}, {_id:0, contact_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({contact_name: {$not: {$in: members}}}, {_id:0, contact_name:1}, callback);
		}
	},
		function(err,results){
			if(err){ console.log(err); }
			cb(err,results);
		}
	);
};

mongoose.model('Contact', contactSchema);