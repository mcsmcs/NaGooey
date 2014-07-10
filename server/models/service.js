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
	
	service_description: String,
	display_name: String,
	
	_servicegroups: Array,		// Virtual: servicegroups
	_host_name: Array,			// Virtual: host_name
	_hostgroup_name: Array,		// Virtual: hostgroup_name
	
	_contacts: Array,			// Virtual: contacts
	_contact_groups: Array,		// Virtual: contact_groups

	check_command: String,
	initial_state: String,		// [owuc]
	check_interval: Number,
	retry_interval: Number,
	max_check_attempts: Number,
	check_period: String,
	active_checks_enabled: Boolean,
	
	passive_checks_enabled: Boolean,
	check_freshness: Boolean,
	freshness_threshold: Number,

	/**************** Notifications ****************/
	notifications_enabled: Boolean,
	first_notification_delay: Number,
	notification_interval: Number,
	notification_period: String,

	// Virtual: 'notification_options' // [w,r,u,f,c,s]
	notification_options_warning: Boolean,
	notification_options_recovery: Boolean,
	notification_options_unknown: Boolean,
	notification_options_flapping: Boolean,
	notification_options_critical: Boolean,
	notification_options_scheduled: Boolean,


	/**************** Flapping ****************/
	flap_detection_enabled: Boolean,
	high_flap_threshold: Number,
	low_flap_threshold: Number,
	
	// Virtual: 'flap_detection_options' [o,w,c,u]
	flap_detection_options_up: Boolean,				// 'o'
	flap_detection_options_warning: Boolean,		// 'w'
	flap_detection_options_critical: Boolean,		// 'c'
	flap_detection_options_unreachable: Boolean,	// 'u'
	

	// Virtual: 'stalking_options' [o,w,u,c]
	stalking_options_up: Boolean,			// 'o'
	stalking_options_warning: Boolean,		// 'w'
	stalking_options_unreachable: Boolean,	// 'u'
	stalking_options_critical: Boolean,		// 'c'

	is_volatile: Boolean,
	event_handler: String, 			// command_name
	event_handler_enabled: Boolean,
	obsess_over_service: Boolean,

	process_perf_data: Boolean,
	retain_nonstatus_information: Boolean,
	retain_status_information: Boolean,

	notes: String,
	notes_url: String,
	action_url: String,
	icon_image: String,		// url
	icon_image_alt: String,	// alt string

	/**************** Templates ****************/
	name: String, 			// Template Name
	_use: Array,			// Virtual: 'use'
	_register: Boolean,		// Virtual: 'register'
});


// #################################################
// #                    Virtuals
// #################################################
var stringToArray = function(property){
	return function(value){ this[property] = value.split(','); };
};
var arrayToString = function(property){
	return function(){ this[property].join(','); };
};

var virtualArray = function(schema, virtualName){
	schema.virtual(virtualName).set(stringToArray('_' + virtualName));
	schema.virtual(virtualName).get(arrayToString('_' + virtualName));
};

virtualArray(serviceSchema, 'use');
virtualArray(serviceSchema, 'servicegroups');
virtualArray(serviceSchema, 'host_name');
virtualArray(serviceSchema, 'hostgroup_name');
virtualArray(serviceSchema, 'contacts');
virtualArray(serviceSchema, 'contact_groups');

serviceSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
serviceSchema.virtual('register').get(function(){ return this._register; });


// #################################################
// #                    Statics
// #################################################
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