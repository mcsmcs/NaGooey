'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');


var contactGroupSchema = new mongoose.Schema({
	contactgroup_name: {
		type: String,
		required: true,
		unique: true
	},

	alias: {
		type: String,
		required: true
	},

	members: Array,					// contacts
	contactgroup_members: Array,	//contact_groups

	// Template directives
	templates: Array,		// use [Template]
	registered: Boolean,
	name: String, 		// Template Name

});


// #################################################
// #                    Virtuals
// #################################################
contactGroupSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this.registered = false; }
	else { this.registered = true; }
});

contactGroupSchema.virtual('register').get(function(){
	if(this.registered === true){ return true; }
	if(this.registered === false){ return false; }
});

contactGroupSchema.virtual('use').set(function(value){
	var split = value.split(',');
	this.templates = split;
});

contactGroupSchema.virtual('use').get(function(){
	return this.templates.join(',');
});

contactGroupSchema.statics.getNagiosData = function(cb){
	
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
						case 'special_processing_needed':
							// processing
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

contactGroupSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {contactgroup_name: obj.contactgroup_name}; }	// Object

	this.removeThenSave(query,obj,cb);
};

contactGroupSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};
contactGroupSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

contactGroupSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('ContactGroup', contactGroupSchema);