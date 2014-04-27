'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var hostTemplateSchema = new mongoose.Schema({
		host_name: {
			type: String,
			required: true,
			unique: true
		},
		host_groups: Array,
		alias: String,
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
		register: Number
	});

	return mongoose.model('HostTemplate', hostTemplateSchema);
};