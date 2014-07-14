'use strict';
/*jslint unparam: true, node: true */


var async = require('async');
var mongoose = require('mongoose');
require('./mongoose')();
var Contact = mongoose.model("Contact");

var paint = function(canvas, brush){
	var property;
	var retObj = canvas;

	for (property in brush){
		if(brush.hasOwnProperty(property) === true){
			retObj[property] = brush[property];
		}
	}

	return retObj;
};

var compileTemplate = function(contactName,done){

	Contact.findOne({$or: [{contact_name: contactName}, {name: contactName}]}, function(err,contact){
		if (err){ console.log(err); }

		if (contact && contact._use){
			var i, fns=[];

			var templates = contact._use;
			for (i=templates.length-1; i>=0; i--){
				fns.push(drillDown(templates[i]));
			}

			async.parallel(fns, function(err,results){
				var j, retObj = {};
				for(j=results.length-1; j>=0; j--){
					retObj = paint(retObj, results[j]);
				}

				retObj = paint(retObj, contact.toObject());
				done(err, retObj);
			});
		} else {
			done(err, contact.toObject());
		}

	});
};


var drillDown = function(contactName){
	var contact = contactName;
	return function(cb){ compileTemplate(contact, cb); };
};

compileTemplate("nagiosadmin", function(err,result){ console.log(result); });
