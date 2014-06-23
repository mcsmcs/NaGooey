'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');

/*
http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#service

define service{
	*host_name	host_name
	hostgroup_name	hostgroup_name
	*service_description	service_description
	display_name	display_name
	servicegroups	servicegroup_names
	is_volatile	[0/1]
	*check_command	command_name
	initial_state	[o,w,u,c]
	*max_check_attempts	#
	*check_interval	#
	*retry_interval	#
	active_checks_enabled	[0/1]
	passive_checks_enabled	[0/1]
	*check_period	timeperiod_name
	obsess_over_service	[0/1]
	check_freshness	[0/1]
	freshness_threshold	#
	event_handler	command_name
	event_handler_enabled	[0/1]
	low_flap_threshold	#
	high_flap_threshold	#
	flap_detection_enabled	[0/1]
	flap_detection_options	[o,w,c,u]
	process_perf_data	[0/1]
	retain_status_information	[0/1]
	retain_nonstatus_information	[0/1]
	*notification_interval	#
	first_notification_delay	#
	*notification_period	timeperiod_name
	notification_options	[w,u,c,r,f,s]
	notifications_enabled	[0/1]
	*contacts	contacts
	*contact_groups	contact_groups
	stalking_options	[o,w,u,c]
	notes	note_string
	notes_url	url
	action_url	url
	icon_image	image_file
	icon_image_alt	alt_string
}
*/


var serviceSchema = new mongoose.Schema({
	service_description: {
		type: String,
		unique: true,
		required: true
	},

	check_command: {
		type: String,
		required: true
	},

	servicegroups: Array,
	host_name: Array,
	hostgroup_name: Array,
	check_interval: Number,
	retry_interval: Number,
	max_check_attempts: Number,
	check_period: String,
	contacts: Array,
	contact_groups: Array,
	first_notification_delay: Number,
	notification_intveral: Number,
	notification_period: String,
	notification_options: {

		warning: {
			type: Boolean,
			required: true,
			default: true
		},

		recovery: {
			type: Boolean,
			required: true,
			default: true
		},

		unknown: {
			type: Boolean,
			required: true,
			default: true
		},

		flapping: {
			type: Boolean,
			required: true,
			default: true
		},

		critical: {
			type: Boolean,
			required: true,
			default: true
		},

		scheduled: {
			type: Boolean,
			required: true,
			default: true
		}
	},
	use: Array
});

mongoose.model('Service', serviceSchema);