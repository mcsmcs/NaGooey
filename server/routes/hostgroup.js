'use strict';

/*
 *	Routing for the hostgroup resource
 *	Basic CRUD
 */

var mongoose = require('mongoose');
var HostGroup = mongoose.model("HostGroup");


module.exports = function(app){

	app.get('/hostgroup', function(req,res){
		
		HostGroup.find(function(err, hostgroupDocs){

			if (err){ console.log('error finding hostgroups'); }
			else { console.log(hostgroupDocs); }

			res.render('hostgroup_index', {hostgroups: hostgroupDocs});
		});

	});

	// Convenience Route
	app.get('/hostgroups', function(req,res){
		res.redirect('/hostgroup');
	});

	app.get('/hostgroup/add', function(req,res){
		
		HostGroup.find(function(err, hostgroupDocs){

			if (err){ console.log('error finding hostgroups'); }
			else { console.log(hostgroupDocs); }

			res.render('hostgroup_form');
		});
		
	});
	
	app.post('/hostgroup/add', function(req,res){
		console.log(req.body);
		
		var newhostgroup = new HostGroup({
			hostgroup_name: req.body['hostgroup_name'],
			alias: req.body['alias']
		});

		newhostgroup.save(function(err, hostgroup){
			if(err){ console.log(err); }
			else {
				res.redirect('/hostgroup');
			}
		});
	});

	app.get('/hostgroup/edit/:hostgroup_name', function(req,res){

		HostGroup.findOne({hostgroup_name: req.params.hostgroup_name}, function(err,hostgroupDoc){

			if(err){console.log(err);}
			else {console.log(hostgroupDoc);}

			res.render('hostgroup_form', {hostgroup: hostgroupDoc});
		});
	});

	app.post('/hostgroup/edit/:hostgroup_name', function(req,res){
		
		HostGroup.findOne({hostgroup_name: req.params.hostgroup_name}, function(err, hostgroupDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			hostgroupDoc.hostgroup_name = req.body.hostgroup_name;
			hostgroupDoc.alias = req.body.alias;
			hostgroupDoc.save(function(err, savedDoc){

				console.log('record saved!');
				res.redirect('/hostgroup');
			});
		});
	});
}