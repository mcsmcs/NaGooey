'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the Command resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var Command = mongoose.model("Command");

module.exports = function(app){


	// #################################################
	// #                    INDEX
	// #################################################
	app.get('/command', function(req,res){
		
		Command.find(function(err, commandDocs){

			if (err){ console.log('error finding commands'); }
			res.render('command_index', {commands: commandDocs});
		});
	});

	// Convenience Route
	app.get('/commands', function(req,res){
		res.redirect('/command');
	});


	// #################################################
	// #                    ADD
	// #################################################
	app.get('/command/add', function(req,res){
		
		Command.find(function(err, commandDocs){

			if (err){ console.log('error finding commands'); }
			res.render('command_form', {commands: commandDocs});
		});
	});
	
	app.post('/command/add', function(req,res){
		
		var newCommand = new Command({
			command_name: req.body.command_name,
			command_line: req.body.command_line,
			check_command: (req.body.check_command === 'on' ? true : false),
			description: req.body.description
		});

		newCommand.save(function(err, command){
			if(err){ console.log(err); }
			else {
				res.redirect('/command');
			}
		});
	});


	// #################################################
	// #                    EDIT
	// #################################################
	app.get('/command/edit/:command_name', function(req,res){

		Command.findOne({command_name: req.params.command_name}, function(err,commandDoc){

			if(err){console.log(err);}
			else {console.log(commandDoc);}

			res.render('command_form', {command: commandDoc});
		});
	});

	app.post('/command/edit/:command_name', function(req,res){

		Command.findOne({command_name: req.params.command_name}, function(err, commandDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			commandDoc.command_name = req.body.command_name;
			commandDoc.command_line = req.body.command_line;
			commandDoc.check_command = (req.body.check_command === 'on' ? true : false);
			commandDoc.description = req.body.description;
			commandDoc.save(function(err, savedDoc){

				console.log('record saved!');
				res.redirect('/command');
			});
		});
	});


	// #################################################
	// #                    DELETE
	// #################################################
	app.get('/command/delete/:command_name', function(req,res){

		var question = "Are you sure you want to delete command: " + req.params.command_name + "?";
		var action = '/command/delete/' + req.params.command_name + '/confirm';
		
		res.render('confirm_delete', {question:question, action:action});
	});

	app.post('/command/delete/:command_name/confirm', function(req,res){

		Command.findOne({command_name: req.params.command_name}, function(err, commandDoc){
			
			if(err){ console.log(err); }
			console.log(commandDoc);

			commandDoc.remove(function(err, removedDoc){
				
				if(err){ console.log(err); }
				res.redirect('/command');	

			});
		});
	});
};