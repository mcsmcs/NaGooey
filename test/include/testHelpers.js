'use strict';

var async = require('async');

exports.dropModel = function(Model, callback){ Model.remove({}, callback); };

exports.seedModel = function(Model, instances, callback){

	var documents = [], key;
	function getCreateFn(Model, data){ 	return function(callback){ 	Model.create(data, callback); }; }

	for(key in instances){
		if(instances.hasOwnProperty(key)){ 
			documents.push(getCreateFn(Model, instances[key])); 
		}
	}

	async.parallel(documents, 
		function(err){ 
			if(err){ console.log(err); callback(err); }
			else{ callback(); }
		}
	);
};