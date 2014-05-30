'use strict';

var assert = require('assert');
var should = require('should');
var http = require('http');
var request = http.request;
var mongoose = require('../server/config/mongoose')('mongodb://localhost/test');
var app = require('../app')(mongoose);
var port = 3000;
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");

function getOptions(method, path){
	return {
		'host': 'localhost',
		'port': port,
		'path': path,
		'method': method
	};
}


before(function(done){
		app.listen(port, function(err){
			if(err){ console.log(err); }
		});

		var newHostGroup = new HostGroup;
		newHostGroup.hostgroup_name = "testhostgroup1";
		newHostGroup.alias = "Test Host Group One";
		newHostGroup.save(done);
})

after(function(done){
	HostGroup.remove({hostgroup_name: 'testhostgroup1'}, done);
});

describe('The application', function(){

	it('should exist', function(done){
		should.exist(app);
		done();
	});


	describe('hostgroup resource', function(){

		describe('HTTP routing', function(){

			it('GET /hostgroup', function(done){
				var req = request(getOptions('GET', '/hostgroup'), function(res){
					res.statusCode.should.eql(200);
					done();
					
					/*
					res.on('data', function(data){
						
						data.toString().should.match(/^<!DOCTYPE html>/);
						console.log(data.toString());
						done();
					});
					*/
				});

				req.write('');
				req.end();
			});

			it('GET /hostgroup/add', function(done){
				var req = request(getOptions('GET', '/hostgroup/add'), function(res){
					res.statusCode.should.eql(200);
					done();
				});

				req.write('');
				req.end();
			});

			it('POST /hostgroup/add');

			it('GET /hostgroup/edit/', function(done){
				var req = request(getOptions('GET', '/hostgroup/edit/testhostgroup1'), function(res){
					res.statusCode.should.eql(200);
					done();
				});

				req.write('');
				req.end();
			});
			
			it('POST /hostgroup/edit/testhostgroup1');



		});
		
	});

});