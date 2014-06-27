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
		required: true,
		default: true,
	},

	service_notifications_enabled: {
		type: Boolean,
		required: true,
		default: true
	},

	// Time Periods
	host_notification_period: {
		type: String,	// time_period
		required: true,
		default: '24x7'
	},

	service_notification_period: {
		type: String,	// time_period
		required: true,
		default: '24x7'
	},

	host_notification_options: {
		down: {
			type: Boolean,
			required: true,
			default: true
		},

		up: {
			type: Boolean,
			required: true,
			default: true
		},

		recoveries: {
			type: Boolean,
			required: true,
			default: true
		},

		flapping: {
			type: Boolean,
			required: true,
			default: true
		},

		scheduled: {
			type: Boolean,
			required: true,
			default: true
		},
	},

	service_notification_options: {
		warning: {
			type: Boolean,
			required: true,
			default: true
		},

		unknown: {
			type: Boolean,
			required: true,
			default: true
		},

		critical: {
			type: Boolean,
			required: true,
			default: true
		},

		recoveries: {
			type: Boolean,
			required: true,
			default: true
		},

		flapping: {
			type: Boolean,
			required: true,
			default: true
		},

		scheduled: {
			type: Boolean,
			required: true,
			default: true
		},
	},

	host_notification_commands: {
		type: String,
		required: true,
		default: 'notify-by-email'
	},

	service_notification_commands: {
		type: String,
		required: true,
		default: 'notify-by-email'
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
	}

});


contactSchema.statics.getContactsExcept = function(contacts, cb){
	this.find({contact_name: {$not: {$in: contacts}}}, {_id:0, contact_name:1}, cb);
};

contactSchema.statics.getContactsByMembers = function(members, cb){
	
	var caller = this;
	async.parallel({
		members: function(callback){
			caller.find({contact_name: {$in: members}}, {_id:0, contact_name:1}, callback);
		},
		nonmembers: function(callback){
			caller.find({contact_name: {$not: {$in: members}}}, {_id:0, contact_name:1}, callback);
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
	
	return '[' + optionsString.join(',') + ']';
};

var serviceNotificationsToString = function(options){

	var optionsString = [];

	if(options.warning){ optionsString.push('w'); }
	if(options.unknown){ optionsString.push('u'); }
	if(options.critical){ optionsString.push('c'); }
	if(options.recoveries){ optionsString.push('r'); }
	if(options.flapping){ optionsString.push('f'); }
	
	return '[' + optionsString.join(',') + ']';
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

mongoose.model('Contact', contactSchema);