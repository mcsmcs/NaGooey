'use strict';
/*global before,beforeEach,after,afterEach,describe,it,should */
/*jslint unparam: true, node: true */

// Chai
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
chai.use(require('chai-things'));

var request = require('supertest');
var async = require('async');
var helpers = require('./include/testHelpers');

var mongoose = require('mongoose');
require('../server/config/mongoose')('mongodb://localhost/test');
var app = require('../app')(mongoose);

var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");


var seedData = {};
seedData.db = {
	hosts: {

	},

	hostgroups: {

	}
};
seedData.other = {
	hosts: {
		newHost1: {host_name:'newHost1', alias: 'New Host 1', address: '1.1.1.1', check_command: 'check_one'},
	},

	hostgroups: {

	}
};


function seedMongo(callback){

	async.parallel(
		[
			function(callback){ helpers.dropModel(Host, callback); },
			function(callback){ helpers.seedModel(Host, seedData.db.hosts, callback); },
			function(callback){ helpers.dropModel(HostGroup, callback); },
			function(callback){ helpers.seedModel(HostGroup, seedData.db.hostgroups, callback); }
		],
		
		function(err){
			if(err){ console.log(err); callback(err); }
			else{ callback(); }
		}
	);
}


describe("The host resource", function(){

	before(function(done){
		seedMongo(done);
	});

	describe("ROUTES", function(){

		beforeEach(function(done){
			seedMongo(done);
		});

		// ############# INDEX #############
		describe("GET /host", function(){
			it('should return response code 200');
		});


		// ############# ADD #############
		describe('GET /host/add', function(){
			it('should return response code 200');
		});

		describe('POST /host/add', function(){
			it('should create a new host given a unique name', function(done){

				var host = seedData.other.hosts.newHost1;

				request(app).post('/host/add')
					.send('host_name=' + host.host_name)
					.send('alias=' + host.alias)
					.send('check_command=' + host.check_command)
					.send('address=' + host.address)
					.end(function(err,res){

						should.not.exist(err);

						Host.findOne({host_name: host.host_name}, function(err,doc){
							if(err){ 
								should.not.exist(err); 
								done(err); 
							}
							else {
								should.exist(doc);
								doc.host_name.should.equal(host.host_name);
								doc.alias.should.equal(host.alias);
								doc.address.should.equal(host.address);
								doc.check_command.should.equal(host.check_command);
								done();
							}
						});
					});
			});
	
			it('should produce an error if the host_name is already in use');
			it('should produce an error if the required fields are sent blank');
			it('should create a new host with a SINGLE hostgroup');
			it('should create a new hostgroup with MULTIPLE hostgroups');
			it('should keep the hostgroup.members consistent with host.hostgroups document -- Single Member');
			it('should keep the hostgroup.members consistent with host.hostgroups document -- Multi Member');
		});


		// ############# EDIT #############
		describe('GET /hostgroup/edit/testhostgroup1', function(){
			it('should return response code 200');
		});

		describe('POST /host/edit/:hostname', function(){
			it('should update the hostgroup_name and alias');
			it('should produce an error if the hostgroup_name is blank');
			it('should produce an error if the alias is blank');
			it('should keep hostgroup.members consistent with host.hostgroups document');
		});
	});


	describe("MODEL", function(){

		beforeEach(function(done){
			seedMongo(done);
		});

	});

});