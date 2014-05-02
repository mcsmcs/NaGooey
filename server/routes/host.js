'use strict';

/*
 *	Routing for the Host resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");
var Command = mongoose.model("Command");


module.exports = function(app){

	app.get('/host', function(req,res){
		
		Host.find(function(err, hostDocs){

			if (err){ console.log('error finding hosts'); }
			else { console.log(hostDocs); }

			res.render('host_index', {hosts: hostDocs});
		});

	});

	// Convenience Route
	app.get('/hosts', function(req,res){
		res.redirect('/host');
	});

	app.get('/host/add', function(req,res){
		
		Host.find(function(err, hostDocs){

			if (err){ console.log('error finding hosts'); }
			else { console.log(hostDocs); }

			HostGroup.find(function(err, hostgroupDocs){
				if(err){console.log(err);}

				Command.getCheckCommands(function(err, commandDocs){
					if(err){ console.log(err); }
					res.render('host_form', {hostgroups: hostgroupDocs, check_commands: commandDocs});	
				})
				
			});
		});
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
			else {
				res.redirect('/host');
			}
		});
	});

	app.get('/host/edit/:host_name', function(req,res){

		Host.findOne({host_name: req.params.host_name}, function(err,hostDoc){
			if(err){console.log(err);}
			
			Command.getCheckCommands(function(err, commandDocs){
				if(err){ console.log(err); }
				res.render('host_form', {host: hostDoc, check_commands: commandDocs});
			});
		});
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