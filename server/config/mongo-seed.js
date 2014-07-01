'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');
var Command = mongoose.model("Command");
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");
var Contact = mongoose.model("Contact");
var ContactGroup = mongoose.model("ContactGroup");
var Service = mongoose.model("Service");
var ServiceGroup = mongoose.model("ServiceGroup");
var TimePeriod = mongoose.model("TimePeriod");

module.exports = (function(){

	//################### CONTACTGROUPS
	ContactGroup.create({
		contactgroup_name: 'nagooey',
		alias: 'NaGooey Default',
		members: ['nagooey'],
	});


	//################### SERVICES
	Service.create({
  		service_description: "serviceONE",
        check_command: "check-host-alive-ping",
        check_interval: 1,
        retry_interval: 1,
        max_check_attempts: 1,
        check_period: "24x7",
        first_notification_delay: 1,
        notification_interval: 1,
        use: [],
        notification_options: {
                scheduled : true,
                critical : true,
                flapping : true,
                unknown : true,
                recovery : true,
                warning : true
        },
        contact_groups: ['nagooey'],
        contacts: ["contact_one"],
        hostgroup_name: ["hostgroup1"],
        host_name: ['host1'],
        servicegroups : [],
	});


	//################### SERVICEGROUPS
	ServiceGroup.create({
        servicegroup_name: "sg1",
        alias: "Service Group 1",
        notes: "notes n notes n notes",
        notes_url: "notes URL",
        action_url: "action URL",
        servicegroup_members: [],
        members: ["serviceONE"],
	});



	//################### TIMEPERIODS
	TimePeriod.create({
		timeperiod_name: "24x7x365",
		alias: "24/7 365 days a year",
		rules: [
			'monday		00:00-24:00',
			'tuesday	00:00-24:00',
			'wednesday	00:00-24:00',
			'thursday	00:00-24:00',
			'friday		00:00-24:00',
			'saturday	00:00-24:00',
			'sunday		00:00-24:00'
		]
	});


	//################### CONTACTS
	Contact.create({
		contact_name: "contact_one",
		alias: 'alias',
		email: 'user@example.com',
		pager: '5556665555',
		host_notification_period: '24x7',
		service_notification_period: '24x7',
		
		host_notification_options: {
			down: true,
			up: true,
			recoveries: true,
			flapping: true,
			scheduled: true
		},

		service_notification_options: {
			warning: true,
			unknown: true,
			critical: true,
			recoveries: true,
			flapping: true
		},
	});

	Contact.create({
		contact_name: "nagooey",
		alias: 'NaGooey Default Contact',
		email: 'user@example.com',
		pager: '1112223333',
		host_notification_period: '24x7',
		service_notification_period: '24x7',
		
		host_notification_options: {
			down: true,
			up: true,
			recoveries: true,
			flapping: true,
			scheduled: true
		},

		service_notification_options: {
			warning: true,
			unknown: true,
			critical: true,
			recoveries: true,
			flapping: true
		},
	});

	
	//################### COMMANDS
	Command.create({
		command_name: "check-host-alive-icmp",
		command_line: "$USER1$/check_icmp -s 216.38.158.8 -H $HOSTADDRESS$ -w 1000.0,60% -c 5000.0,100% -p 5",
		check_command: true,
		description: "Checks the ping using source IP 216.38.158.8 with warning threshold 1second/60% loss, critical threshold 5seconds/100% loss, over 5 packets"
	});

	Command.create({
		command_name: "check-host-alive-ping",
		command_line: "$USER1$/check_ping -s 216.38.158.8 -H $HOSTADDRESS$ -w 1000.0,60% -c 5000.0,100% -p 5",
		check_command: true,
		description: "Checks the ping using source IP 216.38.158.8 with warning threshold 1second/60% loss, critical threshold 5seconds/100% loss, over 5 packets"
	});


	//################### HOSTS
	Host.create({
		host_name: "host1",
		alias: "Host One",
		address: "111.111.111.111",
		check_command: "check-host-alive-icmp",
		hostgroups: ["hostgroup1", "hostgroupALL"],
		check_period: '24x7',
		contacts: ['nagooey']

	});

	Host.create({
		host_name: "host2",
		alias: "Host One",
		address: "222.222.222.222",
		check_command: "check-host-alive-icmp",
		hostgroups: ["hostgroup2", "hostgroupALL"],
		check_period: '24x7',
		contacts: ['nagooey']
	});

	Host.create({
		host_name: "host3",
		alias: "Host One",
		address: "333.333.333.333",
		check_command: "check-host-alive-icmp",
		hostgroups: ["hostgroup3", "hostgroupALL"],
		check_period: '24x7',
		contacts: ['nagooey']
	});


	//################### HOSTGROUPS
	HostGroup.create({
		hostgroup_name: "hostgroup1",
		alias: "Host Group 1",
		members: ["host1"],
	});

	HostGroup.create({
		hostgroup_name: "hostgroup2",
		alias: "Host Group 2",
		members: ["host2"],
	});

	HostGroup.create({
		hostgroup_name: "hostgroup3",
		alias: "Host Group 3",
		members: ["host3"],
	});

	HostGroup.create({
		hostgroup_name: "hostgroupALL",
		alias: "Host Group ALL",
		members: ["host1", "host2", "host3"],
	});
}());