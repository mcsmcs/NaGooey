'use strict';

var mongoose = require('mongoose');
var Host = mongoose.model("Host");


module.exports = function(app){

	app.get('/', function(req,res){
		
		Host.find(function(err, hostDocs){

			if (err){ console.log('error finding hosts'); }
			else { console.log(hostDocs); }

			res.render('host_index', {hosts: hostDocs});
		});

	});

	app.get('/add', function(req,res){
		
		Host.find(function(err, hostDocs){

			if (err){ console.log('error finding hosts'); }
			else { console.log(hostDocs); }

			res.render('host_form');
		});
		
	});
	
	app.post('/add', function(req,res){
		console.log(req.body);
		
		var newHost = new Host({
			host_name: req.body['host_name'],
			alias: req.body['alias']
		});

		newHost.save(function(err, host){
			if(err){ console.log(err); }
			else {
				res.redirect('/');
			}
		});
	});

	app.get('/edit/:host_name', function(req,res){

		Host.findOne({host_name: req.params.host_name}, function(err,hostDoc){

			if(err){console.log(err);}
			else {console.log(hostDoc);}

			res.render('host_form', {host: hostDoc});
		});
	});

	app.post('/edit/:host_name', function(req,res){
		
		Host.findOne({host_name: req.params.host_name}, function(err, hostDoc){
			if(err){ console.log(err); res.redirect('/'); }
			
			hostDoc.host_name = req.body.host_name;
			hostDoc.alias = req.body.alias;
			hostDoc.save(function(err, savedDoc){

				console.log('record saved!');
				res.redirect('/');
			});
		});
	});
}