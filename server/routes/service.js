'use strict';

/*
 *	Routing for the Service resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var Service = mongoose.model("Service");


module.exports = function(app){

	app.get('/service', function(req,res){
		
		Service.find(function(err, serviceDocs){

			if (err){ console.log('error finding services'); }
			else { console.log(serviceDocs); }

			res.render('service_index', {services: serviceDocs});
		});

	});

	// Convenience Route
	app.get('/services', function(req,res){
		res.redirect('/service');
	});

	app.get('/service/add', function(req,res){
		
		Service.find(function(err, serviceDocs){

			if (err){ console.log('error finding services'); }
			else { console.log(serviceDocs); }

			res.render('service_form');
		});
		
	});
	
	app.post('/service/add', function(req,res){
		console.log(req.body);
		
		var newService = new Service({
			service_description: req.body['service_description'],
			alias: req.body['alias']
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

				console.log('record saved!');
				res.redirect('/service');
			});
		});
	});
}