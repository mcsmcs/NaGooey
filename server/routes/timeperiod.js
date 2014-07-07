'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the TimePeriod resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var TimePeriod = mongoose.model("TimePeriod");

var isPresent = function(formFieldData){
	return (formFieldData ? true : false);
};

var parseRequestBody = function(requestBody){
	return {

			timeperiod_name: requestBody.timeperiod_name,
			alias: requestBody.alias,
			rules: requestBody.rules
	};
};

module.exports = function(app){

	// #################################################
	// #                    INDEX
	// #################################################
	app.get('/timeperiod', function(req,res){
		res.render('timeperiod_index');
	});

	// Convenience Route
	app.get('/timeperiods', function(req,res){
		res.redirect('/timeperiod');
	});


	// #################################################
	// #                    ADD
	// #################################################
	app.get('/timeperiod/add', function(req,res){
		res.render('timeperiod_form');
	});
	
	app.post('/timeperiod/add', function(req,res){

		TimePeriod.create(parseRequestBody(req.body), function(err){
			if(err){ console.log(err); }
			res.redirect('/timeperiod');
		});
	});


	// #################################################
	// #                    EDIT
	// #################################################
	app.get('/timeperiod/edit/:timeperiod_name', function(req,res){

		TimePeriod.findOne({timeperiod_name: req.params.timeperiod_name}, function(err,timeperiodDoc){
			if(err){console.log(err);}
			res.render('timeperiod_form', {timeperiod: timeperiodDoc});
		});
	});

	app.post('/timeperiod/edit/:timeperiod_name', function(req,res){

		TimePeriod.update(
			{timeperiod_name: req.params.timeperiod_name},	// query
			parseRequestBody(req.body),						// update
			function(err){									// callback
				if(err){ console.log(err); }
				res.redirect('/timeperiod');
			}
		);
	});


	// #################################################
	// #                    DELETE
	// #################################################
	app.get('/timeperiod/delete/:timeperiod_name', function(req,res){

		var question = "Are you sure you want to delete timeperiod: " + req.params.timeperiod_name + "?";
		var action = '/timeperiod/delete/' + req.params.timeperiod_name + '/confirm';
		
		res.render('confirm_delete', {question:question, action:action});
	});

	app.post('/timeperiod/delete/:timeperiod_name/confirm', function(req,res){

		TimePeriod.findOne({timeperiod_name: req.params.timeperiod_name}, function(err, timeperiodDoc){
			
			if(err){ console.log(err); }

			timeperiodDoc.remove(function(err, removedDoc){
				if(err){ console.log(err); }
				res.redirect('/timeperiod');	
			});
		});
	});
};
