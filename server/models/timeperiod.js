'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');


/*

Time Periods

[weekday]
sunday		00:00-24:00					Every sunday of every week - all day
monday		00:00-09:00, 17:00-24:00 	Every monday of every week - midnight-9am and 5pm-midnight
tuesday		
wednesday
thursday
friday
saturday


[exception] -- my god...
2014-01-01				00:00-24:00 	Specific Date
monday 3				00:00-24:00 	3rd monday of every month
day 2 					00:00-24:00 	2nd day of every month
february 10				00:00-24:00 	Feb 10 every year
feb -1 					00:00-24:00 	Last day of feb every year
thursday -1 november 	00:00-24:00 	last thursday in november every year
april 10 - may 15 		00:00-24:00 	Apr10 through May15 every year
july 10 - 15 			00:00-24:00 	July 10 through July 15 every year
day 1 - 15				""				1st to 15th each month
july 10 - 15 / 2 		""				Every other day between july10-july15

http://nagios.sourceforge.net/docs/3_0/oncallrotation.html
*/

var timePeriodSchema = new mongoose.Schema({
	
	timeperiod_name: String,
	alias: String,

	_monday: Array,		// Virtual: monday [00:00-24:00,05:00-12:00]
	_tuesday: Array,	// Virtual: tuesday
	_wednesday: Array,	// Virtual: wednesday
	_thursday: Array,	// Virtual: thursday
	_friday: Array,		// Virtual: friday
	_saturday: Array,	// Virtual: saturday
	_sunday: Array,		// Virtual: sunday

	_exclude: Array,	// Virtual: exclude [timeperiod_name]
	
	// exceptions: [exceptionSchema],


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
	schema.virtual(virtualName).get(stringToArray('_' + virtualName));
};



virtualArray(timePeriodSchema, 'use');
virtualArray(timePeriodSchema, 'monday');
virtualArray(timePeriodSchema, 'tuesday');
virtualArray(timePeriodSchema, 'wednesday');
virtualArray(timePeriodSchema, 'thursday');
virtualArray(timePeriodSchema, 'friday');
virtualArray(timePeriodSchema, 'saturday');
virtualArray(timePeriodSchema, 'sunday');
virtualArray(timePeriodSchema, 'exclude');

timePeriodSchema.virtual('register').set(function(value){
	if(value === '0' || value === false || value === 'false'){ this._register = false; }
});
timePeriodSchema.virtual('register').get(function(){ return this._register; });


// #################################################
// #                    Statics
// #################################################
timePeriodSchema.statics.getNagiosData = function(cb){
	var i,j,rule,property;
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
						case 'rules':
							for (j=0; j<doc.rules.length; j++){
								rule = doc.rules[j].split(' ');
								docData.push({directive: rule[0], value: rule[1]});
							}
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


timePeriodSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }					// Template
	else { query = {timeperiod_name: obj.timeperiod_name}; }	// Object

	this.removeThenSave(query,obj,cb);
};

timePeriodSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};

timePeriodSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

timePeriodSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('TimePeriod', timePeriodSchema);