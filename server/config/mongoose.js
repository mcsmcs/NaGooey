'use strict';

/*
 *	Setup MongoDB and Register Models
 *	Register Format:  require('../models/<model>')();
 *	Register Example: require('../models/user')();
 */

var mongoose = require('mongoose');

module.exports = function(mongo_url){
	
	// Connection String
	if (mongo_url === null){ mongo_url = 'mongodb://localhost/nagui'; }
	mongoose.connect(mongo_url);
	
	// Open DB Connection
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function(){ console.log('mongodb opened'); });

	// Register models
	require('../models/command')();
	require('../models/contact')();
	require('../models/contactgroup')();
	require('../models/host')();
	require('../models/hostgroup')();
	require('../models/hosttemplate')();
	require('../models/service')();
	require('../models/servicegroup')();
	require('../models/servicetemplate')();
	require('../models/timeperiod')();


	// Load Defaults
	require('./mongo-seed');

	return mongoose;
};