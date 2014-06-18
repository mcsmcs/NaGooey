'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');

var contactGroupSchema = new mongoose.Schema({
	contactgroup_name: String,
	alias: String,
	members: Array,
	contactgroup_members: Array		
});

mongoose.model('ContactGroup', contactGroupSchema);