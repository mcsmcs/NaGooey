'use strict';

var mongoose = require('mongoose');

module.exports = function(){

	var timePeriodSchema = new mongoose.Schema({
		
		timeperiod_name: String,
		alias: String,
		monday: String,
		tuesday: String,
		wednesday: String,
		thursday: String,
		friday: String,
		saturday: String,
		sunday: String
	});

	return mongoose.model('TimePeriod', timePeriodSchema);
};