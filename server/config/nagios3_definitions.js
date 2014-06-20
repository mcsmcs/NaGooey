'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');
var NagiosObject = mongoose.model('NagiosObject');

module.exports = (function(){

	// Host Object Definition
	// Host group Object Definition
	// Service Object Definition
	// Service group Object Definition
	// Contact Object Definition
	// Contact group Object Definition
	// Time period Object Definition
	// Command Object Definition
	// Service dependency Object Definition
	// Service escalation Object Definition
	// Host dependency Object Definition
	// Host escalation Object Definition
	// Extended host information Object Definition
	// Extended service information Object Definition

	// Contact Object Definition
	NagiosObject.create({
		name: "Contact",
		directives: [
			{
				name: "contact_name",
				type: "string (Contact's Name)",
				description: "This directive is used to define a short name used to identify the contact. It is referenced in contact group definitions. Under the right circumstances, the $CONTACTNAME$ macro will contain this value."
			}
		]
	});


}());