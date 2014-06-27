'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the Contact resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var Contact = mongoose.model("Contact");

var isPresent = function(formFieldData){
	return (formFieldData ? true : false);
};

var parseRequestBody = function(requestBody){
	return {

			contact_name: requestBody.contact_name,
			alias: requestBody.alias,
			email: requestBody.email,
			pager: requestBody.pager,
			
			host_notifications_enabled: isPresent(requestBody.host_notifications_enabled),
			host_notification_period: requestBody.host_notification_period,
			host_notification_options: {
				up: 		isPresent(requestBody.host_notification_up),
				flapping: 	isPresent(requestBody.host_notification_flapping),
				down: 		isPresent(requestBody.host_notification_down),
				scheduled: 	isPresent(requestBody.host_notification_scheduled),
				recoveries: isPresent(requestBody.host_notification_recoveries),
			},
			
			service_notifications_enabled: isPresent(requestBody.service_notifications_enabled),
			service_notification_period: requestBody.service_notification_period,
			service_notification_options: {
				warning: 	isPresent(requestBody.service_notification_warning),
				unknown: 	isPresent(requestBody.service_notification_unknown),
				critical: 	isPresent(requestBody.service_notification_critical),
				flapping: 	isPresent(requestBody.service_notification_flapping),
				recoveries: isPresent(requestBody.service_notification_recoveries)
			}
	};
};

module.exports = function(app){

	// #################################################
	// #                    INDEX
	// #################################################
	app.get('/contact', function(req,res){
		
		Contact.find(function(err, contactDocs){

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
		
		Contact.find(function(err, contactDocs){
			if (err){ console.log('error finding contacts'); }
			
			res.render('contact_form', {
				time_periods: [{timeperiod_name: "timeperiod1"}]
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

		Contact.findOne({contact_name: req.params.contact_name}, function(err,contactDoc){
			if(err){console.log(err);}
			res.render('contact_form', {
				contact: contactDoc,
				time_periods: [{timeperiod_name: "timeperiod1"}]
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