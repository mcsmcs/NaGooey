'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the Service resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Service = mongoose.model("Service");
var Command = mongoose.model("Command");
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");

module.exports = function(app){

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

	app.get('/service/add', function(req,res){
		
		async.parallel(
			{
				commands: function(callback){
					Command.find({}, {_id:0, command_name:1}, callback);
				},
				// hosts: function(callback){
				// 	//Host.find({}, {_id:0, host_name:1}, callback);
				// },
				// hostgroups: function(callback){
				// 	//HostGroup.find({}, {_id:0, hostgroup_name:1}, callback);
				// }
			},

			function(err,results){
				if(err){console.log(err);}
				
				//console.log(results);
				res.render('service_form',
				{
					commands: results.commands,
					// hosts: results.hosts,
					// hostgroups: results.hostgroups
				});
			}
		);
	});
	
	app.post('/service/add', function(req,res){
		// console.log(req.body);
		
		var newService = new Service({
			service_description: req.body.service_description,
			check_command: req.body.check_command
		});

		newService.save(function(err, service){
			if(err){ console.log(err); }
			else {
				res.redirect('/service');
			}
		});
	});

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
};