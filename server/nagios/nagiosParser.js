'use strict';
/*jslint unparam: true, node: true */

var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');

module.exports = function(configPath, callback){

	var nagios = {};
	nagios.cfg = {
			main: [],
			dirs: [],
			files: []
	};
	nagios.cfg.path = configPath;
	nagios.objects = {
			commands: [],
			contacts: [],
			contactgroups: [],
			hosts: [],
			hostgroups: [],
			hostextinfos: [],
			services: [],
			servicegroups: [],
			timeperiods: [],
	};

	var detectNagiosCfgDirectives = function(cfgLine){
		if (cfgLine.match(/^cfg_dir=/)){ nagios.cfg.dirs.push(cfgLine.split('=')[1]); }
		else if (cfgLine.match(/^cfg_file=/)){ nagios.cfg.files.push(cfgLine.split('=')[1]); }
	};


	var walk = function(directory, done){
		var results = [];
		var pendingFiles;

		fs.readdir(directory, function(err, files){
			if(err){ console.log(err); done(err); }
			if(files.length === 0){ done(null, results); }

			pendingFiles = files.length;

			files.forEach(function(fileName, index){
				var filePath = directory + '/' + fileName;
				fs.stat(filePath, function(err,stat){

					if(stat && stat.isDirectory()){
						walk(filePath, function(err,subDirFiles){
							if(err){ done(err); }
							results = results.concat(subDirFiles);
							if(--pendingFiles === 0){ done(null, results); }
						});
					} else {
						results.push(filePath);
						if(--pendingFiles === 0){ done(null, results); }

					}
				});
			});
		});
	};

	async.series(
		{
			parseNagiosCFG: function(callback){
				fs.readFile(nagios.cfg.path, function(err,data){
					var i;
					nagios.cfg.main = data.toString().split('\n');
					for (i=0; i<nagios.cfg.main.length; i++){
						detectNagiosCfgDirectives(nagios.cfg.main[i]);
					}

					callback(err);
				});
			},

			findNagiosConfigFiles: function(callback){
				var pending = nagios.cfg.dirs.length;
				var addToCfgFiles = function(err,files){
					nagios.cfg.files = nagios.cfg.files.concat(files);
					if(--pending === 0){ callback(err); }
				};
				
				nagios.cfg.dirs.forEach(function(directory){
					walk(directory, addToCfgFiles);
				});
			},
			
			parseNagiosCfgFiles: function(callback){
				var pending = nagios.cfg.files.length;

				nagios.cfg.files.forEach(function(cfgFile){

					fs.readFile(cfgFile, function(err,buffer){
						if(err){ console.log(err); callback(err); }

						var lines = buffer.toString().split(/\n/);
						var newObject, objectType, inObjectDefn = false;
						var reDefinition = /\s*define\s*(\w*)\s*\{/;
						var reDirectives = /\s*(\w*)\s*([^;]*)/;
						var reTimeDirectives = /(.*?)(\d\d:\d\d-\d\d:\d\d.*?);?/;

						lines.forEach(function(line){
							var directives, timeDirectives;

							if(line.match(/^#/)){ null; }		// Comments
							else if(line.match(/^$/)){ null; }	// Blank Lines
							else if(reDefinition.exec(line)){	// Object Defn
								inObjectDefn = true;
								newObject = [];
								objectType = reDefinition.exec(line)[1] + 's';
							}
							else if (inObjectDefn === true && objectType === 'timeperiods'){
								
								if(line.match(/\}/)){ 			// End of Object Defn
									inObjectDefn = false;
									nagios.objects[objectType].push(newObject);
								}
								else { 

									directives = reDirectives.exec(line);
									timeDirectives = reTimeDirectives.exec(line);

									if (timeDirectives){
										newObject.push({
											directive: timeDirectives[1].trim(),
											value: timeDirectives[2].trim()
										});
									} else {
										newObject.push({
											directive: directives[1].trim(),
											value: directives[2].trim()
										});
									}
								}
							}
							else if (inObjectDefn === true){	// In Object Defn
								directives = reDirectives.exec(line);

								if(line.match(/\}/)){ 			// End of Object Defn
									inObjectDefn = false;
									nagios.objects[objectType].push(newObject);
								}
								else { newObject.push({			// Object Directives
										directive: directives[1].trim(),
										value: directives[2].trim()
									});
								}
							}
							else { console.log(line); }
						});

						if(--pending===0){ callback(); }
					});

				});
			},
		},

		function(err,results){
			console.log('async callback');
			callback(err,nagios);
		}
	);
};
