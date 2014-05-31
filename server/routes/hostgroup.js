'use strict';

/*
 *	Routing for the hostgroup resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");


module.exports = function(app){

	app.get('/hostgroup', function(req,res){
		
		HostGroup.find(function(err, hostgroupDocs){
			if (err){ console.log('error finding hostgroups'); }
			res.render('hostgroup_index', {hostgroups: hostgroupDocs});
		});

	});

	// Convenience Route
	app.get('/hostgroups', function(req,res){
		res.redirect('/hostgroup');
	});

	app.get('/hostgroup/add', function(req,res){
		
		Host.find({}, {host_name: 1, _id:0}, function(err,hosts){
			if(err){console.log(err);}
			res.render('hostgroup_form', {hosts: hosts});
		});
	});
	
	app.post('/hostgroup/add', function(req,res){
		//console.log(req.body);

		async.parallel(
			{
				createHostGroup: function(callback){
					HostGroup.create(
					{
						hostgroup_name: req.body.hostgroup_name,
						alias: req.body.alias,
						members: req.body.isMember
					},
					
					callback);
				},

				updateHostMembership: function(callback){
					var isMember = [];
					if(req.body.isMember instanceof String || typeof(req.body.isMember) === 'string'){ isMember = Array(req.body.isMember); }
					else if(req.body.isMember instanceof Array){ isMember = req.body.isMember; }
							
					Host.updateHostgroupMembership(req.body.hostgroup_name, isMember, callback);
				}
			},

			function(err,results){
				if(err){console.log(err);}
				res.redirect('/hostgroup');
			}
		);
	});

	app.get('/hostgroup/edit/:hostgroup_name', function(req,res){
		
		async.parallel(
			{
				hostgroup: function(callback){
					HostGroup.findOne({hostgroup_name: req.params.hostgroup_name}, callback);
				},

				hostMembership: function(callback){
					Host.getHostsByHostGroup(req.params.hostgroup_name, callback);
				}
			},

			function(err,results){
				if(err){console.log(err);}
				//else{console.log(results);}
				res.render('hostgroup_form', {hostgroup: results.hostgroup, nonMemberHosts: results.hostMembership.nonmembers});
			}
		);
	});

	app.post('/hostgroup/edit/:hostgroup_name', function(req,res){

		async.parallel(
			{
				saveHostgroup: function(callback){
					HostGroup.findOne({hostgroup_name: req.params.hostgroup_name}, function(err, hostgroupDoc){
						if(err){ console.log(err); res.redirect('/'); }
						
						hostgroupDoc.hostgroup_name = req.body.hostgroup_name;
						hostgroupDoc.alias = req.body.alias;
						hostgroupDoc.members = (req.body.isMember instanceof Array ? req.body.isMember : Array(req.body.isMember));
						hostgroupDoc.save(callback);
					});
				},

				updateHostsMembership: function(callback){
					var isMember = [];
					if(req.body.isMember instanceof String){ isMember = Array(req.body.isMember); }
					else if(req.body.isMember instanceof Array){ isMember = req.body.isMember; }

					Host.updateHostgroupMembership(req.params.hostgroup_name, isMember, callback);
				}
			},

			function(err,results){
				if(err){console.log(err);}

				//console.log('record saved!');
				res.redirect('/hostgroup');
			}
		);
	});

};