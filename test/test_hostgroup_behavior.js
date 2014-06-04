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

seedData.db = {	// Seeded to the database
	hosts: {
		host1: {host_name: 'host1', alias: 'Host One', check_command: 'check_one', address: '111.111.111.111', hostgroups: ['hg1', 'hgALL']},
		host2: {host_name: 'host2', alias: 'Host Two', check_command: 'check_two', address: '222.222.222.222', hostgroups: ['hg2', 'hgALL']},
		host3: {host_name: 'host3', alias: 'Host Three', check_command: 'check_three', address: '333.333.333.333', hostgroups: ['hg3', 'hgALL']},
		hostNoHG: {host_name: 'hostNoHG', alias: 'Host Not in Hunt Groups', check_command: 'check_me', address: '444.333.444.333', hostgroups: []},
	},

	hostgroups: {
		hg1: {hostgroup_name: 'hg1', alias: 'Host Group One', members: ['host1']},
		hg2: {hostgroup_name: 'hg2', alias: 'Host Group Two', members: ['host2']},
		hg3: {hostgroup_name: 'hg3', alias: 'Host Group Three', members: ['host3']},
		hgALL: {hostgroup_name: 'hgALL', alias: 'ALL HOSTS', members: ['host1','host2','host3']},
		hgNONE: {hostgroup_name: 'hgNONE', alias: 'NO HOSTS'},
	},
};

seedData.other = {	// These are not seeded to the database
	hostgroups: {
		noMembers: {hostgroup_name: 'noMembers', alias: 'No Members', members: []},
		singleMember: {hostgroup_name: 'singleMember', alias: 'Single Member', members: ['host1']},
		multiMember: {hostgroup_name: 'multiMember', alias: 'Multiple Members', members: ['host1', 'host2', 'host3']},	
	},
};



function seedMongo(callback){

	async.series(
		[	// Drop
			function(callback){ helpers.dropModel(Host, callback); },
			function(callback){ helpers.dropModel(HostGroup, callback); },

			// Seed
			function(callback){ helpers.seedModel(Host, seedData.db.hosts, callback); },
			function(callback){ helpers.seedModel(HostGroup, seedData.db.hostgroups, callback); }
		],
		
		function(err){
			if(err){ console.log(err); callback(err); }
			else{ callback(); }
		}
	);
}


describe("The hostgroup resource", function(){

	before(function(done){
		seedMongo(done);
	});

	describe("ROUTES", function(){
		// ############# INDEX #############
		describe("GET /hostgroup", function(){
			it('should return response code 200', function(done){
				request(app).get('/hostgroup').expect(200, done);
			});
		});


		// ############# ADD #############
		describe('GET /hostgroup/add', function(){
			it('should return response code 200', function(done){
				request(app).get('/hostgroup/add').expect(200, done);
			});
		});

		describe('POST /hostgroup/add', function(){

			beforeEach(function(done){
				seedMongo(done);
			});

		
			//  Form Data:
			//		hostgroup_name: String
			//		alias: String
			//		isNotMember: String		-- multiple
			//		isMember: String		-- multiple


			it('should create a new hostgroup given a unique name', function(done){

				var testHG = seedData.other.hostgroups.noMembers;

				request(app).post('/hostgroup/add')
					.send('hostgroup_name=' + testHG.hostgroup_name)
					.send('alias=' + testHG.alias)
					.end(function(err,res){
						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: testHG.hostgroup_name}, function(err,doc){
							if(err){ 
								should.not.exist(err);
								done(err);
							} else {
								should.exist(doc);
								doc.hostgroup_name.should.equal(testHG.hostgroup_name);
								doc.alias.should.equal(testHG.alias);
								doc.members.length.should.equal(0);
								done();
							}
						});
					});
			});

			it('should produce an error if the hostgroup_name is already in use');
			it('should produce an error if the required fields are sent blank');

			it('should create a new hostgroup with a SINGLE member', function(done){

				var testData = seedData.other.hostgroups.singleMember;

				request(app).post('/hostgroup/add')
					.send('hostgroup_name=' + testData.hostgroup_name)
					.send('alias=' + testData.alias)
					.send('isMember=' + testData.members[0])
					.end(function(err,res){
						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: testData.hostgroup_name}, function(err,doc){
							if(err){ 
								should.not.exist(err);
								done(err);
							} else {
								should.exist(doc);
								doc.hostgroup_name.should.equal(testData.hostgroup_name);
								doc.alias.should.equal(testData.alias);
								doc.members.length.should.equal(1);
								doc.members.should.contain(testData.members[0]);
								done();
							}
						});
					});
			});

			it('should create a new hostgroup with MULTIPLE members', function(done){

				var testData = seedData.other.hostgroups.multiMember;

				request(app).post('/hostgroup/add')
					.send('hostgroup_name=' + testData.hostgroup_name)
					.send('alias=' + testData.alias)
					.send('isMember=' + testData.members[0])
					.send('isMember=' + testData.members[1])
					.end(function(err,res){
						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: testData.hostgroup_name}, function(err,doc){
							if(err){ 
								should.not.exist(err);
								done(err);
							} else {
								should.exist(doc);
								doc.hostgroup_name.should.equal(testData.hostgroup_name);
								doc.alias.should.equal(testData.alias);
								doc.members.length.should.equal(2);
								doc.members.should.contain(testData.members[0]);
								doc.members.should.contain(testData.members[1]);
								done();
							}
						});
					});
			});


			it('should keep the hostgroup.members consistent with host.hostgroups document -- Single Member', function(done){
				
				var testGroup = seedData.other.hostgroups.noMembers;
				var testHost = seedData.db.hosts.host1;

				request(app).post('/hostgroup/add')
					.send('hostgroup_name=' + testGroup.hostgroup_name)
					.send('alias=' + testGroup.alias)
					.send('isMember=' + testHost.host_name)
					.end(function(err,res){

						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: testGroup.hostgroup_name}, function(err,doc){
							should.not.exist(err);
							should.exist(doc);
							doc.members.length.should.equal(1, 'hostgroup.members not equal to 1');
							doc.members.should.contain(testHost.host_name);

							Host.getHostsByHostGroup(testGroup.hostgroup_name, function(err, membership){
								should.not.exist(err);
								membership.members.length.should.equal(1, 'membership tally form hosts not equal to 1');
								membership.members.should.include.an.item.with.property('host_name', testHost.host_name);
								done();
							});
						});
					});
			});

			it('should keep the hostgroup.members consistent with host.hostgroups document -- Multi Member', function(done){
				
				var testGroup = seedData.other.hostgroups.noMembers;
				var testHost = seedData.db.hosts.host1;
				var testHost2 = seedData.db.hosts.host2;

				request(app).post('/hostgroup/add')
					.send('hostgroup_name=' + testGroup.hostgroup_name)
					.send('alias=' + testGroup.alias)
					.send('isMember=' + testHost.host_name)
					.send('isMember=' + testHost2.host_name)
					.end(function(err,res){

						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: testGroup.hostgroup_name}, function(err,doc){
							should.not.exist(err);
							should.exist(doc);
							doc.members.length.should.equal(2, 'hostgroup.members not equal to 2');
							doc.members.should.contain(testHost.host_name);

							Host.getHostsByHostGroup(testGroup.hostgroup_name, function(err, membership){
								should.not.exist(err);
								membership.members.length.should.equal(2, 'membership tally form hosts not equal to 2');
								membership.members.should.include.an.item.with.property('host_name', testHost.host_name);
								membership.members.should.include.an.item.with.property('host_name', testHost2.host_name);
								done();
							});
						});
					});
			});
		});


		// ############# EDIT #############

		describe('GET /hostgroup/edit/testhostgroup1', function(){
			before(function(done){
				HostGroup.create({
					hostgroup_name: 'testhostgroup1',
					alias: 'Test Host Group One'
				}, done);
			});

			after(function(done){
				HostGroup.remove({hostgroup_name: 'testhostgroup1'}, done);
			});

			it('should return response code 200', function(done){
				request(app).get('/hostgroup/edit/testhostgroup1').expect(200, done);
			});
		});


		//  Form Data:
		//		hostgroup_name: String
		//		alias: String
		//		isNotMember: String		-- none-multiple
		//		isMember: String		-- none-multiple

		describe('POST /hostgroup/edit/:hostgroup_name', function(){
			
			it('should update the hostgroup_name and alias', function(done){

				var testGroup = seedData.db.hostgroups.hgNONE;
				var newAlias = 'Updated Alias';
				var newName = 'Updated Host Group Name';

				request(app).post('/hostgroup/edit/' + testGroup.hostgroup_name)
					.send('hostgroup_name=' + newName)
					.send('alias=' + newAlias)
					.end(function(err,res){

						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: newName}, function(err,hg){
							should.not.exist(err);
							should.exist(hg);
							hg.alias.should.equal(newAlias);
							hg.hostgroup_name.should.equal(newName);
							hg.members.length.should.equal(0, 'hostgroup.members not equal to 0');
							done();
						});
					});
			});


			it('should produce an error if the hostgroup_name is blank');
			it('should produce an error if the alias is blank');

			it('should keep hostgroup.members consistent with host.hostgroups document', function(done){

				var testGroup = seedData.db.hostgroups.hg1;
				var host2 = seedData.db.hosts.host2;
				var hostNoHG = seedData.db.hosts.hostNoHG;

				// Remove 'host1' from hg1, add host2, and hostNoHG
				request(app).post('/hostgroup/edit/' + testGroup.hostgroup_name)
					.send('hostgroup_name=' + testGroup.hostgroup_name)
					.send('alias=' + testGroup.alias)
					.send('isMember=' + host2.host_name)
					.send('isMember=' + hostNoHG.host_name)
					.send('isNotMember=' + 'these are not looked at')
					.send('isNotMember=' + 'and dont matter')
					.end(function(err,res){
						should.not.exist(err);

						HostGroup.findOne({hostgroup_name: testGroup.hostgroup_name}, function(err,hg){
							should.not.exist(err);

							hg.members.length.should.equal(2);
							hg.members.should.include(host2.host_name);
							hg.members.should.include(hostNoHG.host_name);
							hg.members.should.not.include('host1');

							done();
						});

					});
			});
		});
	});

	describe('MODEL', function(){

		beforeEach(function(done){
			seedMongo(done);
		});

		describe('hostGroupSchema.statics.getHostMembership', function(){

			it('should return and object containing 2 arrays: isMember and isNotMember', function(done){
				HostGroup.getHostMembership(seedData.db.hosts.hostNoHG.host_name, function(err,membership){
					should.not.exist(err);
					should.exist(membership);
					should.exist(membership.isMember);
					should.exist(membership.isNotMember);

					membership.isMember.should.be.an('array');
					membership.isMember.length.should.equal(0);
					membership.isNotMember.should.be.an('array');
					membership.isNotMember.length.should.be.at.least(1);
					done();
				});
			});
		});


		describe('hostGroupSchema.statics.updateHostMembership', function(){

			it('should update membership of the hostgroup correctly', function(done){

				// Remove host1 from everything, add to hg3
				var host1 = seedData.db.hosts.host1;
				var hg2 = seedData.db.hostgroups.hg2;
				var hg3 = seedData.db.hostgroups.hg3;

				var membership = {};
				membership.isMember = [hg2.hostgroup_name, hg3.hostgroup_name];
				membership.isNotMember = [];

				HostGroup.updateHostMembership(host1.host_name, membership, function(err,results){
					should.not.exist(err);

					HostGroup.getHostMembership(host1.host_name, function(err,membership){
						should.not.exist(err);
						
						membership.isMember.length.should.equal(2);
						membership.isMember.should.include.an.item.with.property('hostgroup_name', hg2.hostgroup_name);
						membership.isMember.should.include.an.item.with.property('hostgroup_name', hg3.hostgroup_name);
						membership.isMember.should.not.include.an.item.with.property('hostgroup_name', seedData.db.hostgroups.hg1.hostgroup_name);
						membership.isNotMember.should.include.an.item.with.property('hostgroup_name', seedData.db.hostgroups.hg1.hostgroup_name);
						done();
					});

				});


			});
		});
	});

});