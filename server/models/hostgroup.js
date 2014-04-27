'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var hostGroupSchema = new mongoose.Schema({
		hostgroup_name: {
			type: String,
			reqired: true,
			unique: true
		},
		alias: String,
		members: Array,
		hostgroup_members: Array
	});

	return mongoose.model('HostGroup', hostGroupSchema);
};