'use strict';
/*jslint unparam: true, node: true */

require('../config/mongoose')();
var mongoose	= require('mongoose');
var Command		= mongoose.model("Command");
var Service		= mongoose.model("Service");
var TimePeriod  = mongoose.model("TimePeriod");
var Contact		= mongoose.model("Contact");
var ContactGroup= mongoose.model("ContactGroup");
var Host 		= mongoose.model("Host");
var HostGroup	= mongoose.model("HostGroup");

var exec = require('child_process').exec;
var nagios, path, child;

var detectLinuxDistro = function(callback){
	child = exec("cat /etc/*release | grep -o 'Ubuntu\\|CentOS' | sort -u",
		function(error, stdout, stderr){
			callback(error, stdout.toString().replace(/\n/,''));
		}
	);
};

detectLinuxDistro(function(err,distro){
	var path = 'wtf';
	if(distro === 'Ubuntu'){ path = '/etc/nagios3/nagios.cfg'; }
	else if (distro === 'CentOS'){ path = '/etc/nagios/nagios.cfg'; }
	
	require('../nagios/nagiosParser')(path, function(err,nagios){

		// nagios.objects.contacts.forEach(function(contactDirectives){
		// 	Contact.directivesToDocument(contactDirectives);	
		// });
		
		
	});
});


