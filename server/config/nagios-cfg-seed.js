'use strict';
/*jslint unparam: true, node: true */

var async 		= require('async');

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

var createDocuments = function(Model, objects, done){

	var pending = objects.length;
	var callback = function(err,docs){
		if(--pending<=0){ done(err,docs); }
	};

	objects.forEach(function(object){

		var obj = {};
		object.forEach(function(directive){
			obj[directive.directive] = directive.value;
		});

		Model.createFromConfig(obj,	callback);
	});		
};

detectLinuxDistro(function(err,distro){

	if(distro === 'Ubuntu'){ path = '/etc/nagios3/nagios.cfg'; }
	else if (distro === 'CentOS'){ path = '/etc/nagios/nagios.cfg'; }
	
	// Parse Nagios Config Files
	require('../nagios/nagiosParser')(path, function(err,nagios){

		// Add objects to MongoDB
		async.parallel(
			{
				commands: function(callback){
					createDocuments(Command, nagios.objects.commands, callback);
				},
				contacts: function(callback){
					createDocuments(Contact, nagios.objects.contacts, callback);
				},
				hosts: function(callback){
					createDocuments(Host, nagios.objects.hosts, callback);
				},
				hostgroups: function(callback){
					createDocuments(HostGroup, nagios.objects.hostgroups, callback);
				},
				services: function(callback){
					createDocuments(Service, nagios.objects.services, callback);
				},
				timeperiods: function(callback){
					createDocuments(TimePeriod, nagios.objects.timeperiods, callback);
				},
			}
			//,function(err,results){}
		);
	});
});
