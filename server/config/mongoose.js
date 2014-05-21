'use strict';

/*
 *	Setup MongoDB and Register Models
 *	Register Format:  require('../models/<model>')();
 *	Register Example: require('../models/user')();
 */

var mongoose = require('mongoose');

module.exports= function(){
	
	// Connection String
	mongoose.connect('mongodb://localhost/nagui');
	
	// Open DB Connection
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function(){ console.log('mean db opened'); });

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
	require('./mongo-defaults');


}