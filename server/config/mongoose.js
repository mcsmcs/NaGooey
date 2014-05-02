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


	// Add some default docs
	var Command = mongoose.model("Command");
	var check_icmp_command = new Command({
		command_name: "check-host-alive-icmp",
		command_line: "$USER1$/check_icmp -s 216.38.158.8 -H $HOSTADDRESS$ -w 1000.0,60% -c 5000.0,100% -p 5",
		check_command: true
	});
	check_icmp_command.save();

	var check_ping_command = new Command({
		command_name: "check-host-alive-ping",
		command_line: "$USER1$/check_ping -s 216.38.158.8 -H $HOSTADDRESS$ -w 1000.0,60% -c 5000.0,100% -p 5",
		check_command: true
	});
	check_ping_command.save();

}