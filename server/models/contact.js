'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var contactSchema = new mongoose.Schema({
	
	contact_name: {
		type: String,
		required: true,
		unique: true,
	},

	alias: String,
	contact_groups: Array,
	email: String,
	pager: String,
	addressx: Array,		// Additional addresses?
	
	host_notifications_enabled: {
		type: Boolean,
	},

	service_notifications_enabled: {
		type: Boolean,
	},

	// Time Periods
	host_notification_period: {
		type: String,	// time_period
	},

	service_notification_period: {
		type: String,	// time_period
	},

	host_notification_options: {
		down: {
			type: Boolean,
		},

		up: {
			type: Boolean,
		},

		recoveries: {
			type: Boolean,
		},

		flapping: {
			type: Boolean,
		},

		scheduled: {
			type: Boolean,
		},
	},

	service_notification_options: {
		warning: {
			type: Boolean,
		},

		unknown: {
			type: Boolean,
		},

		critical: {
			type: Boolean,
		},

		recoveries: {
			type: Boolean,
		},

		flapping: {
			type: Boolean,
		},

		scheduled: {
			type: Boolean,
		},
	},

	host_notification_commands: {
		type: String,
		default: 'notify-host-by-email'
	},

	service_notification_commands: {
		type: String,
		default: 'notify-service-by-email'
	},
	
	can_submit_commands: {
		type: Boolean,
		default: true
	},

	retain_status_information: {
		type: Boolean,
		default: true
	},

	retain_nonstatus_information: {
		type: Boolean,
		default: true
	},

	register: String,
	use: String,		// use [Template]
	name: String 		// Template Name


});


contactSchema.statics.getContactsExcept = function(contacts, cb){
	this.find({contact_name: {$not: {$in: contacts}}}, {_id:0, contact_name:1}, cb);
};

contactSchema.statics.getContactsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({$and: [{name: {$exists:false}},{contact_name: {$in: members}}]}, {_id:0, contact_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({$and: [{name: {$exists:false}},{contact_name: {$not: {$in: members}}}]}, {_id:0, contact_name:1}, callback);
		}
	},
		function(err,results){
			if(err){ console.log(err); }
			cb(err,results);
		}
	);
};


var hostNotificationsToString = function(options){

	var optionsString = [];

	if(options.down){ optionsString.push('d'); }
	if(options.up){ optionsString.push('u'); }
	if(options.recoveries){ optionsString.push('r'); }
	if(options.flapping){ optionsString.push('f'); }
	if(options.scheduled){ optionsString.push('s'); }
	
	return optionsString.join(',');
};

var serviceNotificationsToString = function(options){

	var optionsString = [];

	if(options.warning){ optionsString.push('w'); }
	if(options.unknown){ optionsString.push('u'); }
	if(options.critical){ optionsString.push('c'); }
	if(options.recoveries){ optionsString.push('r'); }
	if(options.flapping){ optionsString.push('f'); }
	
	return optionsString.join(',');
};

contactSchema.statics.getNagiosData = function(cb){
	
	var i,property;
	var doc, docData;
	var returnData = [];
	var objCleanup = function(doc,ret,options){ delete ret._id; delete ret.__v; };

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({transform: objCleanup});

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'host_notification_options':
							docData.push({directive: 'host_notification_options', value: hostNotificationsToString(doc.host_notification_options)});
							break;
						case 'service_notification_options':
							docData.push({directive: 'service_notification_options', value: serviceNotificationsToString(doc.service_notification_options)});
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


contactSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {contact_name: obj.contact_name}; }	// Object

	this.update(query, obj, {upsert:true}, cb);
};

contactSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

contactSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('Contact', contactSchema);