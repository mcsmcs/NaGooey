'use strict';

/*
 *	Routing for the hostgroup resource
 *	Basic CRUD
 */

var async = require('async');
var mongoose = require('mongoose');
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");


function membersToArray(members){
	// Forces formdata posted to app to an array if no values (undefined) or single value (String) is sent
	var returnArray = [];
	if(members instanceof String || typeof(members) === 'string'){ returnArray = Array(members); }
	else if(members instanceof Array){ returnArray = members; }
	return returnArray;
}


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
					Host.updateHostgroupMembership(req.body.hostgroup_name, membersToArray(req.body.isMember), callback);
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
				if(err){ console.log(err); }
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
						hostgroupDoc.members = membersToArray(req.body.isMember);
						hostgroupDoc.save(callback);
					});
				},

				updateHostsMembership: function(callback){
					Host.updateHostgroupMembership(req.params.hostgroup_name, membersToArray(req.body.isMember), callback);
				}
			},

			function(err,results){
				if(err){console.log(err);}
				res.redirect('/hostgroup');
			}
		);
	});
};