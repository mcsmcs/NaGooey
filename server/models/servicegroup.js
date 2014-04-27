'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var serviceGroupSchema = new mongoose.Schema({
		
		servicegroup_name: {
			type: String,
			unique: true,
			required: true
		},
		alias: String,
		members: Array,
		servicegroup_members: Array
		
	});

	return mongoose.model('ServiceGroup', serviceGroupSchema);
};