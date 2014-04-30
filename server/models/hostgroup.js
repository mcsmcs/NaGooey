'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var hostGroupSchema = new mongoose.Schema({
		hostgroup_name: {
			type: String,
			unique: true,
			required: true
		},

		alias: {
			type: String,
			unique: true,
			required: true
		},

		members: Array,				// hosts
		hostgroup_members: Array,	// hostgroups
		
		notes: String,				// note_string
		notes_url: String,			// url
		action_url: String,			// url
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