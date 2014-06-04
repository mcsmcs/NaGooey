'use strict';

var mongoose = require('mongoose');

var serviceSchema = new mongoose.Schema({
	service_description: {
		type: String,
		unique: true,
		required: true
	},
	servicegroups: Array,
	host_name: Array,
	hostgroup_name: Array,
	check_command: {
		type: String,
		unique: true,
		required: true
	},
	check_interval: Number,
	retry_interval: Number,
	max_check_attempts: Number,
	check_period: String,
	contacts: Array,
	contact_groups: Array,
	first_notification_delay: Number,
	notification_intveral: Number,
	notification_period: String,
	notification_options: Array,
	use: Array
});

mongoose.model('Service', serviceSchema);