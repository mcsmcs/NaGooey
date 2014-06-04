'use strict';

var mongoose = require('mongoose');

var contactSchema = new mongoose.Schema({
	
	contact_name: String,
	alias: String,
	email: String,
	pager: String,
	host_notifications_enabled: Boolean,
	host_service_enabled: Boolean,
	host_notification_period: Array,
	service_notification_period: Array,
	host_notificaiton_options: Array,
	service_notification_options: Array,
	host_notification_commands: String,
	service_notification_commands: String,
	can_submit_commands: Boolean
});

mongoose.model('Contact', contactSchema);