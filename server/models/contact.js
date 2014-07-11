'use strict';
/*jslint unparam: true, node: true */

var async = require('async');
var mongoose = require('mongoose');

var contactSchema = new mongoose.Schema({
	
	contact_name: String,
	alias: String,
	email: String,
	pager: String,
	_contact_groups: Array,
	_addressx: Array,		// Additional addresses?

	can_submit_commands: Boolean,
	retain_status_information: Boolean,
	retain_nonstatus_information: Boolean,
	

	/**************** Hosts ****************/
	host_notifications_enabled: Boolean,
	host_notification_period: String,	// time_period
	host_notification_commands: String,

	// Virtual: 'host_notification_options'
	_host_notification_up: Boolean,
	_host_notification_down: Boolean,
	_host_notification_recovery: Boolean,
	_host_notification_flapping: Boolean,
	_host_notification_scheduled: Boolean,

	
	/**************** Services ****************/
	service_notifications_enabled: Boolean,
	service_notification_period: String,	// time_period
	service_notification_commands: String,

	// Virtual: 'service_notification_options'
	_service_notification_warning: Boolean,
	_service_notification_unknown: Boolean,
	_service_notification_critical: Boolean,
	_service_notification_recovery: Boolean,
	_service_notification_flapping: Boolean,
	_service_notification_scheduled: Boolean,


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
	return function(){ return this[property].join(','); };
};

var virtualArray = function(schema, virtualName){
	schema.virtual(virtualName).set(stringToArray('_' + virtualName));
	schema.virtual(virtualName).get(arrayToString('_' + virtualName));
};

virtualArray(contactSchema, 'use');
virtualArray(contactSchema, 'addressx');
virtualArray(contactSchema, 'contact_groups');

contactSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
contactSchema.virtual('register').get(function(){ return this._register; });

contactSchema.virtual('host_notification_options').set(function(value){
	var i;
	var split = value.split(',');

	this._host_notification_up = this._host_notification_down = this._host_notification_recovery = this._host_notification_flapping = this._host_notification_scheduled = false;
	for (i=0;i<split.length;i++){
		switch(split[i]){
			case 'u': this._host_notification_up = true; break;
			case 'd': this._host_notification_down = true; break;
			case 'r': this._host_notification_recovery = true; break;
			case 'f': this._host_notification_flapping = true; break;
			case 's': this._host_notification_scheduled = true; break;
			default: break;
		}
	}
});
contactSchema.virtual('host_notification_options').get(function(){
	var returnValue = "";
	if(this._host_notification_up === true){ returnValue +=  'u,'; }
	if(this._host_notification_down === true){ returnValue +=  'd,'; }
	if(this._host_notification_recovery === true){ returnValue +=  'r,'; }
	if(this._host_notification_flapping === true){ returnValue +=  'f,'; }
	if(this._host_notification_scheduled === true){ returnValue +=  's'; }
	return returnValue.replace(/,$/, '');
});

contactSchema.virtual('service_notification_options').set(function(value){
	var i;
	var split = value.split(',');
	
	this._service_notification_warning = this._service_notification_unknown = this._service_notification_critical = this._service_notification_recovery = this._service_notification_flapping = this._service_notification_scheduled = false;
	for (i=0;i<split.length;i++){
		switch(split[i]){
			case 'w': this._service_notification_warning = true; break;
			case 'u': this._service_notification_unknown = true; break;
			case 'c': this._service_notification_critical = true; break;
			case 'r': this._service_notification_recovery = true; break;
			case 'f': this._service_notification_flapping = true; break;
			case 's': this._service_notification_scheduled = true; break;
			default: break;
		}
	}

});
contactSchema.virtual('service_notification_options').get(function(){
	var returnValue = "";
	if(this._service_notification_warning === true){ returnValue +=  'w,'; }
	if(this._service_notification_unknown === true){ returnValue +=  'u,'; }
	if(this._service_notification_critical === true){ returnValue +=  'c,'; }
	if(this._service_notification_recovery === true){ returnValue +=  'r,'; }
	if(this._service_notification_flapping === true){ returnValue +=  'f,'; }
	if(this._service_notification_scheduled === true){ returnValue +=  's'; }
	return returnValue.replace(/,$/, '');
});


// #################################################
// #                    Statics
// #################################################
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
	var Model = this;

	var objCleanup = function(doc,ret,options){ 
		delete ret.id;

		// Remove internal properties
		Model.schema.eachPath(function(path){ if (/^_/.exec(path)){ delete ret[path]; }});

		// Remove empty properties
		for (property in ret){
			if (ret.hasOwnProperty(property)){
				if (ret[property] === undefined || ret[property] === ''){ delete ret[property]; }
			}
		}
	};

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({virtuals: true, transform: objCleanup});

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'extra processing needed': break;
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

	this.removeThenSave(query,obj,cb);
};

contactSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};

contactSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

contactSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('Contact', contactSchema);