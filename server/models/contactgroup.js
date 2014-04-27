'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var contactGroupSchema = new mongoose.Schema({
		contactgroup_name: String,
		alias: String,
		members: Array,
		contactgroup_members: Array		
	});

	return mongoose.model('ContactGroup', contactGroupSchema);
};