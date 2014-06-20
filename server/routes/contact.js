'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the Contact resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var Contact = mongoose.model("Contact");

module.exports = function(app){

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

	app.get('/contact/add', function(req,res){
		
		Contact.find(function(err, contactDocs){

			if (err){ console.log('error finding contacts'); }
			else { console.log(contactDocs); }

			res.render('contact_form', {time_periods: [{timeperiod_name: "timeperiod1"}]});
		});
	});
	
	app.post('/contact/add', function(req,res){
		console.log('**************');
		console.log(req.body);
		console.log('**************');
		
		Contact.create(req.body, function(err){
			if(err){ console.log(err); }
			res.redirect('/contact');
		});

	});

	app.get('/contact/edit/:contact_name', function(req,res){

		Contact.findOne({contact_name: req.params.contact_name}, function(err,contactDoc){

			if(err){console.log(err);}
			res.render('contact_form', {contact: contactDoc, time_periods: [{timeperiod_name: "timeperiod1"}]});
		});
	});

	app.post('/contact/edit/:contact_name', function(req,res){
		// console.log('**************');
		// console.log(req.body);
		// console.log('**************');

		Contact.findOne({contact_name: req.params.contact_name}, function(err, contactDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			contactDoc.contact_name = req.body.contact_name;
			contactDoc.contact_line = req.body.contact_line;
			contactDoc.check_contact = (req.body.check_contact === 'on' ? true : false);
			contactDoc.description = req.body.description;
			contactDoc.save(function(err, savedDoc){
				res.redirect('/contact');
			});
		});
	});

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