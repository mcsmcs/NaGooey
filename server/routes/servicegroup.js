'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the ServiceGroup resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var ServiceGroup = mongoose.model("ServiceGroup");


module.exports = function(app){

	app.get('/servicegroup', function(req,res){
		
		ServiceGroup.find(function(err, servicegroupDocs){

			if (err){ console.log('error finding servicegroups'); }
			else { console.log(servicegroupDocs); }

			res.render('servicegroup_index', {servicegroups: servicegroupDocs});
		});

	});

	// Convenience Route
	app.get('/servicegroups', function(req,res){
		res.redirect('/servicegroup');
	});

	app.get('/servicegroup/add', function(req,res){
		
		ServiceGroup.find(function(err, servicegroupDocs){

			if (err){ console.log('error finding servicegroups'); }
			else { console.log(servicegroupDocs); }

			res.render('servicegroup_form');
		});
		
	});
	
	app.post('/servicegroup/add', function(req,res){
		console.log(req.body);
		
		var newServiceGroup = new ServiceGroup({
			servicegroup_name: req.body.servicegroup_name,
			alias: req.body.alias
		});

		newServiceGroup.save(function(err, servicegroup){
			if(err){ console.log(err); }
			else {
				res.redirect('/servicegroup');
			}
		});
	});

	app.get('/servicegroup/edit/:servicegroup_name', function(req,res){

		ServiceGroup.findOne({servicegroup_name: req.params.servicegroup_name}, function(err,servicegroupDoc){

			if(err){console.log(err);}
			else {console.log(servicegroupDoc);}

			res.render('servicegroup_form', {servicegroup: servicegroupDoc});
		});
	});

	app.post('/servicegroup/edit/:servicegroup_name', function(req,res){
		
		ServiceGroup.findOne({servicegroup_name: req.params.servicegroup_name}, function(err, servicegroupDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			servicegroupDoc.servicegroup_name = req.body.servicegroup_name;
			servicegroupDoc.alias = req.body.alias;
			servicegroupDoc.save(function(err, savedDoc){

				console.log('record saved!');
				res.redirect('/servicegroup');
			});
		});
	});

	app.get('/servicegroup/delete/:servicegroup_name', function(req,res){

		var question = "Are you sure you want to delete servicegroup: " + req.params.servicegroup_name + "?";
		var action = '/servicegroup/delete/' + req.params.servicegroup_name + '/confirm';
		
		res.render('confirm_delete', {question:question, action:action});
	});

	app.post('/servicegroup/delete/:servicegroup_name/confirm', function(req,res){

		ServiceGroup.findOne({servicegroup_name: req.params.servicegroup_name}, function(err, servicegroupDoc){
			
			if(err){ console.log(err); }

			servicegroupDoc.remove(function(err, removedDoc){
				if(err){ console.log(err); }
				res.redirect('/servicegroup');	
			});
		});
	});
};