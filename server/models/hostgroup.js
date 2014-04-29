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


	hostGroupSchema.methods.addMember = function(host){
		this.members.addToSet(host);
		this.save();
	}

	hostGroupSchema.methods.addHostgroupMember = function(hostgroup){
		this.hostgroup_members.addToSet(hostgroup);
		this.save();
	}

	return mongoose.model('HostGroup', hostGroupSchema);
};