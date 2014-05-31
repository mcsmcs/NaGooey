'use strict';

// Chai
var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();

var request = require('supertest');

var mongoose = require('../server/config/mongoose')('mongodb://localhost/test');
var app = require('../app')(mongoose);

var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");


describe("The hostgroup resource", function(){

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
			HostGroup.remove(done);
		});

		afterEach(function(done){
			HostGroup.remove(done);
		});
	
		//  Form Data:
		//		hostgroup_name: String
		//		alias: String
		//		isNotMember: String		-- multiple
		//		isMember: String		-- multiple


		it('should create a new hostgroup given a unique name', function(done){

			var hostname = 'NHG1';
			var alias = 'NGH One';

			request(app).post('/hostgroup/add')
				.send('hostgroup_name=' + hostname)
				.send('alias=' + alias)
				.send('isNotMember=not_member_1')
				.send('isNotMember=not_member_2')
				.send('isMember=member__1')
				.send('isMember=member__2')
				.end(function(err,res){
					should.not.exist(err);

					HostGroup.findOne({hostgroup_name: hostname}, function(err,doc){
						if(err){ 
							should.not.exist(err);
							done(err);
						} else {
							should.exist(doc);
							doc.hostgroup_name.should.equal(hostname);
							doc.alias.should.equal(alias);
							done();
						}
					});
				});
		});

		it('should produce an error if the hostgroup_name is already in use');
		it('should produce an error if the required fields are sent blank');

		it('should create a new hostgroup with correct hostgroup.members', function(done){

			var hostname = 'NHG2';
			var alias = 'NGH Two';
			var firstmember = 'member__1';
			var secondmember = 'member__2';
			var firstnonmember = 'not_member__1';
			var secondnonmember = 'not_member__1';

			request(app).post('/hostgroup/add')
				.send('hostgroup_name=' + hostname)
				.send('alias=' + alias)
				.send('isNotMember=' + firstnonmember)
				.send('isNotMember=' + secondnonmember)
				.send('isMember=' + firstmember)
				.send('isMember=' + secondmember)
				.end(function(err,res){
					should.not.exist(err);

					HostGroup.findOne({hostgroup_name: hostname}, function(err,doc){
						if(err){ 
							should.not.exist(err);
							done(err);
						} else {
							should.exist(doc);
							
							doc.hostgroup_name.should.equal(hostname);
							doc.alias.should.equal(alias);

							doc.members.length.should.equal(2);
							doc.members.should.contain(firstmember);
							doc.members.should.contain(secondmember);
							doc.members.should.not.contain(firstnonmember);
							doc.members.should.not.contain(secondnonmember);
							
							done();
						}
					});
				});
		});


		it('should keep the hostgroup.members consistent with host.hostgroups document', function(done){
			var hostgroup_name = 'hostgroup name';
			var alias = 'Host Group Name';
			var member = 'host1';

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
});