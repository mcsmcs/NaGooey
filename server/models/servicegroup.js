'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var serviceGroupSchema = new mongoose.Schema({
		
		servicegroup_name: String,
		alias: String,
		members: Array,
		servicegroup_members: Array
		
	});

	return mongoose.model('ServiceGroup', serviceGroupSchema);
};