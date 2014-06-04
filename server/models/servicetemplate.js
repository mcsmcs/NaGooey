'use strict';

var mongoose = require('mongoose');

var serviceTemplateSchema = new mongoose.Schema({
	host_name: Array,
	hostgroup_name: Array,
	service_description: String,
	servicegroups: Array,
	check_command: String,
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
	register: Number
});

mongoose.model('ServiceTemplate', serviceTemplateSchema);