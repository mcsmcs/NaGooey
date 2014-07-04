'use strict';
/*jslint unparam: true, node: true */

/*
 *	Setup MongoDB and Register Models
 */

var mongoose = require('mongoose');

module.exports = function(url){
	
	// Connection String
	var mongo_url = url;
	if (url === undefined){ mongo_url = 'mongodb://localhost/nagui'; }
	
	// Don't open another connection if already opened.
	if (!mongoose.connection.db){ mongoose.connect(mongo_url); }
	
	// Open DB Connection
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	//db.once('open', function(){});

	// Register models
	require('../models/command');
	require('../models/contact');
	require('../models/contactgroup');
	require('../models/host');
	require('../models/hostgroup');
	require('../models/hosttemplate');
	require('../models/service');
	require('../models/servicegroup');
	require('../models/servicetemplate');
	require('../models/timeperiod');
	require('../models/nagios_object');



	// Load Defaults
	if(url === undefined){ 
		require('./mongo-testing-seed'); 
		require('./nagios-cfg-seed');
	}
	require('./nagios3_definitions');

};