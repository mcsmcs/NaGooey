'use strict';
/*jslint unparam: true, node: true */

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

mongoose.model('Contact', contactSchema);