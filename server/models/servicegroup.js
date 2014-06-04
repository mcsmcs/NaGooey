'use strict';

var mongoose = require('mongoose');

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

mongoose.model('ServiceGroup', serviceGroupSchema);