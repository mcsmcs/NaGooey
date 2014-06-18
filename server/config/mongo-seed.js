'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');
var Command = mongoose.model("Command");
var Host = mongoose.model("Host");
var HostGroup = mongoose.model("HostGroup");

module.exports = (function(){


	//################### COMMANDS
	var check_icmp_command = new Command({
		command_name: "check-host-alive-icmp",
		command_line: "$USER1$/check_icmp -s 216.38.158.8 -H $HOSTADDRESS$ -w 1000.0,60% -c 5000.0,100% -p 5",
		check_command: true
	});
	check_icmp_command.save();

	var check_ping_command = new Command({
		command_name: "check-host-alive-ping",
		command_line: "$USER1$/check_ping -s 216.38.158.8 -H $HOSTADDRESS$ -w 1000.0,60% -c 5000.0,100% -p 5",
		check_command: true
	});
	check_ping_command.save();


	//################### HOSTS
	var host1 = new Host({
		host_name: "host1",
		alias: "Host One",
		address: "111.111.111.111",
		check_command: "check-host-alive-icmp",
		hostgroups: ["hostgroup1", "hostgroupALL"]
	});
	host1.save();

	var host2 = new Host({
		host_name: "host2",
		alias: "Host One",
		address: "222.222.222.222",
		check_command: "check-host-alive-icmp",
		hostgroups: ["hostgroup2", "hostgroupALL"]
	});
	host2.save();

	var host3 = new Host({
		host_name: "host3",
		alias: "Host One",
		address: "333.333.333.333",
		check_command: "check-host-alive-icmp",
		hostgroups: ["hostgroup3", "hostgroupALL"]
	});
	host3.save();


	//################### HOSTGROUPS
	var hg1 = new HostGroup({
		hostgroup_name: "hostgroup1",
		alias: "Host Group 1",
		members: ["host1"]
	});
	hg1.save();

	var hg2 = new HostGroup({
		hostgroup_name: "hostgroup2",
		alias: "Host Group 2",
		members: ["host2"]
	});
	hg2.save();

	var hg3 = new HostGroup({
		hostgroup_name: "hostgroup3",
		alias: "Host Group 3",
		members: ["host3"]
	});
	hg3.save();

	var hgALL = new HostGroup({
		hostgroup_name: "hostgroupALL",
		alias: "Host Group ALL",
		members: ["host1", "host2", "host3"]
	});
	hgALL.save();
}());