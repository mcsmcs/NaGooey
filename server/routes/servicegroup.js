'use strict';
/*jslint unparam: true, node: true */

/*
 *	Routing for the ServiceGroup resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Service = mongoose.model("Service");
var ServiceGroup = mongoose.model("ServiceGroup");

var isPresent = function(formFieldData){
	return (formFieldData ? true : false);
};

function membersToArray(members){
	// Forces formdata posted to app to an array if no values (undefined) or single value (String) is sent
	var returnArray = [];
	if(members instanceof String || typeof members === 'string'){ returnArray = Array(members); }
	else if(members instanceof Array){ returnArray = members; }
	return returnArray;
}

var parseRequestBody = function(requestBody){
	return {
		servicegroup_name: requestBody.servicegroup_name,
		alias: requestBody.alias,
		members: membersToArray(requestBody.service_isMember),
		servicegroup_members: membersToArray(requestBody.servicegroup_isMember),
		notes: requestBody.notes,
		notes_url: requestBody.notes_url,
		action_url: requestBody.action_url
	};
};

module.exports = function(app){

	// #################################################
	// #                    INDEX
	// #################################################
	app.get('/servicegroup', function(req,res){
		
		ServiceGroup.getRegisteredObjects(function(err, servicegroupDocs){

			if (err){ console.log('error finding servicegroups'); }
			res.render('servicegroup_index', {servicegroups: servicegroupDocs});
		});

	});

	// Convenience Route
	app.get('/servicegroups', function(req,res){
		res.redirect('/servicegroup');
	});


	// #################################################
	// #                    ADD
	// #################################################
	app.get('/servicegroup/add', function(req,res){
		
		async.parallel({
				services: function(callback){
					Service.getServicesByMembers([], callback);
				},
				servicegroups: function(callback){
					ServiceGroup.getServiceGroupsByMembers([], callback);
				},
			},

			function(err,results){
				if(err){ console.log(err); }
				console.log(results);
				res.render('servicegroup_form', {
					services: results.services,
					servicegroups: results.servicegroups
				});
			}
		);

	});
	
	app.post('/servicegroup/add', function(req,res){
		
		ServiceGroup.create(parseRequestBody(req.body), function(err, servicegroup){
			if(err){ console.log(err); }
			res.redirect('/servicegroup');
		});
	});


	// #################################################
	// #                    EDIT
	// #################################################
	app.get('/servicegroup/edit/:servicegroup_name', function(req,res){

		ServiceGroup.findOne({servicegroup_name: req.params.servicegroup_name}, function(err,servicegroup){

			async.parallel(
			{
				services: function(callback){
					Service.getServicesByMembers(servicegroup.members, callback);
				},
				servicegroups: function(callback){
					ServiceGroup.getServiceGroupsByMembers(servicegroup.servicegroup_members, callback);
				}
			},

				function(err,results){
					if(err){ console.log(err); }
					res.render('servicegroup_form', {
						servicegroup: servicegroup,
						services: results.services,
						servicegroups: results.servicegroups,
					});
				}
			);
		});
	});

	app.post('/servicegroup/edit/:servicegroup_name', function(req,res){

		ServiceGroup.update(
			{servicegroup_name: req.params.servicegroup_name},	// Query
			parseRequestBody(req.body),							// Update Object

			function(err, servicegroupDoc){						// Callback
				if(err){ console.log(err); }
				res.redirect('/servicegroup'); 
			}
		);
	});


	// #################################################
	// #                    DELETE
	// #################################################
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