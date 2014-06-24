
'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the Service resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Service = mongoose.model("Service");
var Contact = mongoose.model("Contact");
var Command = mongoose.model("Command");
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");

var isPresent = function(formFieldData){
	return (formFieldData ? true : false);
};

function membersToArray(members){
	// Forces formdata posted to app to an array if no values (undefined) or single value (String) is sent
	var returnArray = [];
	if(members instanceof String || typeof members === 'string'){ returnArray = Array(members); }
	else if(members instanceof Array){ returnArray = members; }
	return returnArray;
}

var parseRequestBody = function(requestBody){
	return {

		service_description: requestBody.service_description,
		check_command: requestBody.check_command,

		// Membership stuff
		// contactgroups
		// servicegroups
		contacts: membersToArray(requestBody.contact_isMember),
		host_name: membersToArray(requestBody.host_isMember),
		hostgroup_name: membersToArray(requestBody.hostgroup_isMember),

		check_interval: requestBody.check_interval,
		retry_interval: requestBody.retry_interval,
		max_check_attempts: requestBody.max_check_attempts,
		check_period: requestBody.check_period,
		first_notification_delay: requestBody.first_notification_delay,
		notifcation_interval: requestBody.notification_interval,

		notification_options: {
			warning: isPresent(requestBody.notification_options_warning),
			recovery: isPresent(requestBody.notification_options_recovery),
			unknown: isPresent(requestBody.notification_options_unknown),
			flapping: isPresent(requestBody.notification_options_flapping),
			critical: isPresent(requestBody.notification_options_critical),
			scheduled: isPresent(requestBody.notification_options_scheduled),

		},
	};
};


module.exports = function(app){

	// #################################################
	// #                    INDEX
	// #################################################
	app.get('/service', function(req,res){
		
		Service.find(function(err, serviceDocs){

			if (err){ console.log('error finding services'); }
			// else { console.log(serviceDocs); }

			res.render('service_index', {services: serviceDocs});
		});
	});

	// Convenience Route
	app.get('/services', function(req,res){
		res.redirect('/service');
	});


	// #################################################
	// #                    ADD
	// #################################################
	app.get('/service/add', function(req,res){
		
		async.parallel(
			{
				contacts: function(callback){
				 	Contact.find({}, {_id:0, contact_name:1}, callback);
				},

				// contactgroups: function(callback){
				//  	ContactGroup.find({}, {_id:0, contactgroup_name:1}, callback);
				// },

				commands: function(callback){
					Command.find({}, {_id:0, command_name:1}, callback);
				},
				
				hosts: function(callback){
				 	Host.find({}, {_id:0, host_name:1}, callback);
				},
				
				hostgroups: function(callback){
				 	HostGroup.find({}, {_id:0, hostgroup_name:1}, callback);
				},

				// servicegroups: function(callback){
				//  	ServiceGroup.find({}, {_id:0, servicegroup_name:1}, callback);
				// }
			},

			function(err,results){
				if(err){console.log(err);}
				
				res.render('service_form',
				{
					contacts: results.contacts,
					commands: results.commands,
					hosts: results.hosts,
					hostgroups: results.hostgroups
				});
			}
		);
	});
	
	app.post('/service/add', function(req,res){
		console.log('**********************');
		console.log(req.body);
		console.log('**********************');
		
		var reqBody = parseRequestBody(req.body);
		// console.log(reqBody);
		//res.redirect('/service');
		
		var newService = new Service(reqBody);

		newService.save(function(err, service){
			if(err){ console.log(err); }
			res.redirect('/service');
		});
	});


	// #################################################
	// #                    EDIT
	// #################################################
	app.get('/service/edit/:service_description', function(req,res){

		Service.findOne({service_description: req.params.service_description}, function(err,serviceDoc){

			if(err){console.log(err);}
			else {console.log(serviceDoc);}

			res.render('service_form', {service: serviceDoc});
		});
	});

	app.post('/service/edit/:service_description', function(req,res){
		
		Service.findOne({service_description: req.params.service_description}, function(err, serviceDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			serviceDoc.service_description = req.body.service_description;
			serviceDoc.alias = req.body.alias;
			serviceDoc.save(function(err, savedDoc){

				//console.log('record saved!');
				res.redirect('/service');
			});
		});
	});


	// #################################################
	// #                    DELETE
	// #################################################
	app.get('/service/delete/:service_name', function(req,res){

		var question = "Are you sure you want to delete service: " + req.params.service_name + "?";
		var action = '/service/delete/' + req.params.service_name + '/confirm';
		
		res.render('confirm_delete', {question:question, action:action});
	});

	app.post('/service/delete/:service_name/confirm', function(req,res){

		Service.findOne({service_name: req.params.service_name}, function(err, serviceDoc){
			
			if(err){ console.log(err); }

			serviceDoc.remove(function(err, removedDoc){
				if(err){ console.log(err); }
				res.redirect('/service');	
			});
		});
	});
};