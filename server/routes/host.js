'use strict';

/*
 *	Routing for the Host resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");
var Command = mongoose.model("Command");


module.exports = function(app){

	app.get('/host', function(req,res){


		HostGroup.getHostMembership("boomboom");

		Host.find(function(err, hostDocs){
			if (err){ console.log('error finding hosts'); }
			res.render('host_index', {hosts: hostDocs});
		});

	});

	// Convenience Route
	app.get('/hosts', function(req,res){
		res.redirect('/host');
	});

	app.get('/host/add', function(req,res){
		
		async.parallel(
			{	// Run these in parallel
				// callback = function(err, result){}
				hostgroups: function(callback){ HostGroup.find(callback); },
				check_commands: function(callback){	Command.getCheckCommands(callback); },
			}, 

			// Do this after completion
			function(err, results){
				if(err){console.log(err);}
				res.render('host_form', {hostgroups: results.hostgroups, check_commands: results.check_commands});
			}
		);
	});
	
	app.post('/host/add', function(req,res){
		console.log(req.body);
		
		var newHost = new Host({
			host_name: req.body['host_name'],
			alias: req.body['alias'],
			address: req.body['address'],
			check_command: req.body['check_command']
		});

		newHost.save(function(err, host){
			if(err){ console.log(err); }
			res.redirect('/host');
		});
	});

	app.get('/host/edit/:host_name', function(req,res){

		async.parallel(
			{
				host: function(callback){ Host.findOne({host_name: req.params.host_name}, callback); },
				check_commands: function(callback){ Command.getCheckCommands(callback); }
			},

			function(err, results){
				if(err){ console.log(err); }
				res.render('host_form', {host: results.host, check_commands: results.check_commands});
			}
		);
	});

	app.post('/host/edit/:host_name', function(req,res){
		
		Host.findOne({host_name: req.params.host_name}, function(err, hostDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			hostDoc.host_name = req.body.host_name;
			hostDoc.alias = req.body.alias;
			hostDoc.address = req.body.address;
			hostDoc.check_command = req.body['check_command'];
			hostDoc.save(function(err, savedDoc){

				console.log('record saved!');
				res.redirect('/host');
			});
		});
	});

	app.get('/host/delete/:host_name', function(req,res){

		var question = "Are you sure you want to delete host: " + req.params.host_name + "?";
		var action = '/host/delete/' + req.params.host_name + '/confirm';
		
		res.render('confirm_delete', {question:question, action:action});
	});

	app.post('/host/delete/:host_name/confirm', function(req,res){

		Host.findOne({host_name: req.params.host_name}, function(err, hostDoc){
			
			if(err){ console.log(err); }
			console.log(hostDoc);

			hostDoc.remove(function(err, removedDoc){
				
				if(err){ console.log(err); }
				res.redirect('/host');	

			});
		});
	});
}