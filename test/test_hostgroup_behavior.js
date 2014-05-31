'use strict';

// Chai
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
chai.use(require('chai-things'));

var request = require('supertest');
var async = require('async');

var mongoose = require('../server/config/mongoose')('mongodb://localhost/test');
var app = require('../app')(mongoose);

var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");


var seedData = {}
seedData.hosts = {
	host1: {host_name: 'host1', alias: 'Host One', check_command: 'check_one', address: '111.111.111.111', hostgroups: ['hg1', 'hgALL']},
	host2: {host_name: 'host2', alias: 'Host Two', check_command: 'check_two', address: '222.222.222.222', hostgroups: ['hg2', 'hgALL']},
	host3: {host_name: 'host3', alias: 'Host Three', check_command: 'check_three', address: '333.333.333.333', hostgroups: ['hg3', 'hgALL']},
	hostNoHG: {host_name: 'hostNoHG', alias: 'Host Not in Hunt Groups', check_command: 'check_me', address: '444.333.444.333', hostgroups: []},
};
seedData.hostgroups = {
	hg1: {hostgroup_name: 'hg1', alias: 'Host Group One', members: ['host1']},
	hg2: {hostgroup_name: 'hg2', alias: 'Host Group Two', members: ['host2']},
	hg3: {hostgroup_name: 'hg3', alias: 'Host Group Three', members: ['host3']},
	hgALL: {hostgroup_name: 'hgALL', alias: 'ALL HOSTS', members: ['host1','host2','host3']},
	
	// Created in tests
	noMembers: {hostgroup_name: 'noMembers', alias: 'No Members', members: []},
	singleMember: {hostgroup_name: 'singleMember', alias: 'Single Member', members: ['host1']},
	multiMember: {hostgroup_name: 'multiMember', alias: 'Multiple Members', members: ['host1', 'host2', 'host3']},
};



function seedMongo(cb){

	async.series(
		{
			dropHosts: function(callback){ Host.remove({}, callback); },
			dropHostGroups: function(callback){ HostGroup.remove({}, callback); },
			seedHosts: function(callback){
				async.parallel([
					function(callback){ Host.create(seedData.hosts.host1, callback); },
					function(callback){ Host.create(seedData.hosts.host2, callback); },
					function(callback){ Host.create(seedData.hosts.host3, callback); },
					function(callback){ Host.create(seedData.hosts.hostNoHG, callback); },
				], 
				function(err,results){
					if(err){ console.log(err); callback(err); }
					else { callback(); }
				});
			},
			seedHostGroups: function(callback){
				async.parallel([
					function(callback){ HostGroup.create(seedData.hostgroups.hg1, callback); },
					function(callback){ HostGroup.create(seedData.hostgroups.hg2, callback); },
					function(callback){ HostGroup.create(seedData.hostgroups.hg3, callback); },
					function(callback){ HostGroup.create(seedData.hostgroups.hgALL, callback); },
				], 
				function(err,results){
					if(err){ console.log(err); callback(err); }
					else { callback(); }
				});
			},
		},

		function(err,results){
			if(err){ console.log(err); cb(err); }
			else { cb(); }
		}
	);
};


describe("The hostgroup resource", function(){

	before(function(done){
		seedMongo(done);
	});

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

			var testHG = seedData.hostgroups.noMembers;

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

			var testData = seedData.hostgroups.singleMember;

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

			var testData = seedData.hostgroups.multiMember;

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
			
			var testGroup = seedData.hostgroups.noMembers;
			var testHost = seedData.hosts.host1;

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

		it.skip('should keep the hostgroup.members consistent with host.hostgroups document -- Multi Member', function(done){
			
			var testData = seedData.hostgroups.multiMember;

			request(app).post('/hostgroup/add')
				.send('hostgroup_name=' + hostgroup_name)
				.send('alias=' + alias)
				.send('isMember=' + member)
				.end(function(err,res){

					should.not.exist(err);

					HostGroup.findOne({hostgroup_name: hostgroup_name}, function(err,doc){
						should.not.exist(err);
						should.exist(doc);

						doc.members.length.should.equal(1);
						doc.members.should.contain(member);

						// console.log('---------------------------------');
						// console.log(doc);
						// console.log('---------------------------------');

						Host.getHostsByHostGroup(hostgroup_name, function(err, results){
							// console.log('---------------------------------');
							// console.log(results);
							// console.log('---------------------------------');
							results.members.length.should.equal(1);
							results.members.should.contain(member);
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

	describe('POST /hostgroup/edit/testhostgroup1', function(){
		it('should update the hostgroup_name and alias');
		it('should produce an error if the hostgroup_name is blank');
		it('should produce an error if the alias is blank');
		it('should update the hostgroup.members correctly');
		it('should keep hostgroup.members consistent with host.hostgroups document')
	});


	describe.skip('Host update host membership shit', function(){
		it('should do what I want... duh', function(done){

			var hostgroup = 'myhostgroup'
			var members = ['host1','host2'];

			Host.updateHostgroupMembership(hostgroup, members, function(err, res){
				should.not.exist(err);
				Host.getHostsByHostGroup(hostgroup, function(err,results){
					if(err){ done(err); }
					console.log(results);
					done();
				});
			});
		});
	});

});