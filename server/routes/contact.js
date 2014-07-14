'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the Contact resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Contact = mongoose.model("Contact");
var TimePeriod = mongoose.model("TimePeriod");

var isPresent = function(formFieldData){
	return (formFieldData ? true : false);
};

var parseRequestBody = function(requestBody){
	return {

			contact_name: requestBody.contact_name,
			alias: requestBody.alias,
			email: requestBody.email,
			pager: requestBody.pager,
			
			can_submit_commands: isPresent(requestBody.can_submit_commands),
			retain_status_information: isPresent(requestBody.retain_status_information),
			retain_nonstatus_information: isPresent(requestBody.retain_nonstatus_information),

			host_notifications_enabled: isPresent(requestBody.host_notifications_enabled),
			host_notification_period: requestBody.host_notification_period,
			_host_notification_up: isPresent(requestBody.host_notification_up),
			_host_notification_flapping: isPresent(requestBody.host_notification_flapping),
			_host_notification_flappingdown: isPresent(requestBody.host_notification_down),
			_host_notification_flappingscheduled: isPresent(requestBody.host_notification_scheduled),
			_host_notification_flappingrecoveries: isPresent(requestBody.host_notification_recoveries),
			
			service_notifications_enabled: isPresent(requestBody.service_notifications_enabled),
			service_notification_period: requestBody.service_notification_period,
			_service_notification_warning: isPresent(requestBody.service_notification_warning),
			_service_notification_unknown: isPresent(requestBody.service_notification_unknown),
			_service_notification_critical: isPresent(requestBody.service_notification_critical),
			_service_notification_flapping: isPresent(requestBody.service_notification_flapping),
			_service_notification_recoveries: isPresent(requestBody.service_notification_recoveries)
	};
};

module.exports = function(app){

	// #################################################
	// #                    INDEX
	// #################################################
	app.get('/contact', function(req,res){
		
		Contact.getRegisteredObjects(function(err, contactDocs){

			if (err){ console.log('error finding contacts'); }
			res.render('contact_index', {contacts: contactDocs});
		});
	});

	// Convenience Route
	app.get('/contacts', function(req,res){
		res.redirect('/contact');
	});


	// #################################################
	// #                    ADD
	// #################################################
	app.get('/contact/add', function(req,res){
		TimePeriod.find({},{timeperiod_name:1, _id:0}, function(err,timeperiods){
			res.render('contact_form',
			{
				timeperiods: timeperiods
			});	
		});
		
	});
	
	app.post('/contact/add', function(req,res){

		Contact.create(parseRequestBody(req.body), function(err){
			if(err){ console.log(err); }
			res.redirect('/contact');
		});
	});


	// #################################################
	// #                    EDIT
	// #################################################
	app.get('/contact/edit/:contact_name', function(req,res){

		async.parallel(
		{
			contact: function(callback){
				Contact.findOne({contact_name: req.params.contact_name}, callback);
			},
			timeperiods: function(callback){
				TimePeriod.find({}, {timeperiod_name:1, _id:0}, callback);
			},
		},
		
		function(err,results){
			if(err){ console.log(err); }
			console.log(results.contact);
			res.render('contact_form', {
				contact: results.contact,
				timeperiods: results.timeperiods
			});
		});
	});

	app.post('/contact/edit/:contact_name', function(req,res){

		Contact.update(
			{contact_name: req.params.contact_name},// query
			parseRequestBody(req.body),				// update
			function(err){							// callback
				if(err){ console.log(err); }
				res.redirect('/contact');
			}
		);
	});


	// #################################################
	// #                    DELETE
	// #################################################
	app.get('/contact/delete/:contact_name', function(req,res){

		var question = "Are you sure you want to delete contact: " + req.params.contact_name + "?";
		var action = '/contact/delete/' + req.params.contact_name + '/confirm';
		
		res.render('confirm_delete', {question:question, action:action});
	});

	app.post('/contact/delete/:contact_name/confirm', function(req,res){

		Contact.findOne({contact_name: req.params.contact_name}, function(err, contactDoc){
			
			if(err){ console.log(err); }

			contactDoc.remove(function(err, removedDoc){
				if(err){ console.log(err); }
				res.redirect('/contact');	
			});
		});
	});
};