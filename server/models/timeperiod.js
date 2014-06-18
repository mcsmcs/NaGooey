'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');

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

mongoose.model('TimePeriod', timePeriodSchema);