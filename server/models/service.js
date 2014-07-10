'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

/*
http://nagios.sourceforge.net/docs/nagioscore/3/en/objectdefinitions.html#service

define service{
	*host_name	host_name
	hostgroup_name	hostgroup_name
	*service_description	service_description
	display_name	display_name
	servicegroups	servicegroup_names
	is_volatile	[0/1]
	*check_command	command_name
	initial_state	[o,w,u,c]
	*max_check_attempts	#
	*check_interval	#
	*retry_interval	#
	active_checks_enabled	[0/1]
	passive_checks_enabled	[0/1]
	*check_period	timeperiod_name
	obsess_over_service	[0/1]
	check_freshness	[0/1]
	freshness_threshold	#
	event_handler	command_name
	event_handler_enabled	[0/1]
	low_flap_threshold	#
	high_flap_threshold	#
	flap_detection_enabled	[0/1]
	flap_detection_options	[o,w,c,u]
	process_perf_data	[0/1]
	retain_status_information	[0/1]
	retain_nonstatus_information	[0/1]
	*notification_interval	#
	first_notification_delay	#
	*notification_period	timeperiod_name
	notification_options	[w,u,c,r,f,s]
	notifications_enabled	[0/1]
	*contacts	contacts
	*contact_groups	contact_groups
	stalking_options	[o,w,u,c]
	notes	note_string
	notes_url	url
	action_url	url
	icon_image	image_file
	icon_image_alt	alt_string
}
*/


var serviceSchema = new mongoose.Schema({
	
	service_description: {
		type: String,
	},

	check_command: {
		type: String,
	},

	servicegroups: Array,
	
	host_name: {
		type: Array,
	},

	hostgroup_name: Array,
	
	check_interval: {
		type: Number,
		default: 5
	},

	retry_interval: {
		type: Number,
		default: 1
	},

	max_check_attempts: {
		type: Number,

	},

	check_period: {
		type: String,
		default: '24x7'
	},

	contacts: {
		type: Array,
		default: ['admin']
	},

	contact_groups: {
		type: Array,
		default: ['admins']
	},

	first_notification_delay: Number,

	notification_interval: {
		type: Number,
		default: 5
	},

	notification_period: String,

	notification_options: {

		warning: {
			type: Boolean,
			default: true
		},

		recovery: {
			type: Boolean,
			default: true
		},

		unknown: {
			type: Boolean,
			default: true
		},

		flapping: {
			type: Boolean,
			default: true
		},

		critical: {
			type: Boolean,
			default: true
		},

		scheduled: {
			type: Boolean,
			default: true
		}
	},


	action_url: String,
	active_checks_enabled: Boolean,
	check_freshness: Boolean,
	display_name: String,
	event_handler: String, 	// command_name
	event_handler_enabled: Boolean,
	flap_detection_enabled: Boolean,
	flap_detection_options: Array, // [owcu]
	freshness_threshold: Number,
	high_flap_threshold: Number,
	icon_image: String,	// url
	icon_image_alt: String,	// alt string
	initial_state: String,	// [owuc]
	is_volatile: Boolean,
	low_flap_threshold: Number,
	notes: String,
	notes_url: String,
	notifications_enabled: Boolean,
	obsess_over_service: Boolean,
	passive_checks_enabled: Boolean,
	process_perf_data: Boolean,
	retain_nonstatus_information: Boolean,
	retain_status_information: Boolean,
	stalking_options: Array,	// [owuc]

	// Template directives
	templates: Array,		// use [Template]
	registered: Boolean,
	name: String, 		// Template Name

});


// #################################################
// #                    Virtuals
// #################################################
serviceSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this.registered = false; }
	else { this.registered = true; }
});

serviceSchema.virtual('register').get(function(){
	if(this.registered === true){ return true; }
	if(this.registered === false){ return false; }
});

serviceSchema.virtual('use').set(function(value){
	var split = value.split(',');
	this.templates = split;
});

serviceSchema.virtual('use').get(function(){
	return this.templates.join(',');
});


serviceSchema.statics.getServicesByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({$and: [{name: {$exists:false}},{service_description: {$in: members}}]}, {_id:0, service_description:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({$and: [{name: {$exists:false}},{service_description: {$not: {$in: members}}}]}, {_id:0, service_description:1}, callback);
		}
	},
		function(err,results){
			if(err){ console.log(err); }
			cb(err,results);
		}
	);
};


serviceSchema.statics.getNagiosData = function(cb){
	var i,property;
	var doc, docData;
	var returnData = [];
	var objCleanup = function(doc,ret,options){ delete ret._id; delete ret.__v; };

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({transform: objCleanup});
			// console.log(doc);

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'needs_extra_processing':
							//process some stuff here
							break;
							
						case 'notification_options':
							//process some stuff here
							break;
						default:
							if(doc[property] instanceof Array){
								if(doc[property].length > 0){
									docData.push({directive: property, value: doc[property].join(',')});
								}
							}
							else if (doc[property] === true){ 
									docData.push({directive: property, value: '1'});
							}
							else if (doc[property] === false){
									docData.push({directive: property, value: '0'});
							}
							else {
								docData.push({directive: property, value: doc[property]});
							}
							break;
					}
				}
			}

			returnData.push(docData);
		}

		cb(err,returnData);
	});
};

serviceSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {service_description: obj.service_description}; }	// Object

	this.removeThenSave(query,obj,cb);
};

serviceSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};

serviceSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

serviceSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('Service', serviceSchema);