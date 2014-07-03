'use strict';
/*jslint unparam: true, node: true */

/*
 *	Creates Nagios configuration files from MongoDB data
 *
 *	Model.getNagiosData returns an array of Nagios Objects
 *  each Nagios Object contains an array of objects {directive: <directive_name>, value: <value>}
 *
 *	Example:
 *
 *		[ 	
 * 			// First Object
 *			[	
 * 				// Directives
 *				{directive: 'command_name', value: 'check-icmp'},
 *				{directive: 'command_line', value: 'check-icmp -H HOSTADDRESS'},
 *			]
 *
 * 			// Second Object
 *			[	
 * 				// Directives
 *				{directive: 'command_name', value: 'check-ping'},
 *				{directive: 'command_line', value: 'check-ping -H HOSTADDRESS'},
 *			]
 *		]
 *
 */

var async = require('async');
var fs    = require('fs');

require('../config/mongoose')();
var mongoose	= require('mongoose');
var Command		= mongoose.model("Command");
var Service		= mongoose.model("Service");
var TimePeriod  = mongoose.model("TimePeriod");
var Contact		= mongoose.model("Contact");
var ContactGroup= mongoose.model("ContactGroup");
var Host 		= mongoose.model("Host");
var HostGroup	= mongoose.model("HostGroup");


var compileNagiosObject = function(ObjectType, Model){

	var i, j;
	var nagiosObject;
	var definition;
	var definitions = [];

	Model.getNagiosData(function(err, nagiosObjects){
		if(err){ console.log(err); }		

		for(i=0; i<nagiosObjects.length; i++){
			nagiosObject = nagiosObjects[i];

			definition = [];
			definition.push('define ' + ObjectType + ' {');
		
			for(j=0; j<nagiosObject.length; j++){
				definition.push('\t' + nagiosObject[j].directive + '\t\t' + nagiosObject[j].value);
			}

			definition.push('}');
			definition.push('');
			definitions.push(definition.join('\n'));
		}

		fs.writeFile('../../../sp-helper/nagooey/' + ObjectType + 's.cfg', definitions.join('\n'), function(err){
			if(err){ console.log(err); }
			else { console.log(ObjectType + 's file saved.'); }
		});

	});
};




compileNagiosObject('command', Command);
compileNagiosObject('contact', Contact);
compileNagiosObject('contactgroup', ContactGroup);
compileNagiosObject('host', Host);
compileNagiosObject('hostgroup', HostGroup);
compileNagiosObject('service', Service);
compileNagiosObject('timeperiod', TimePeriod);

