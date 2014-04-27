'use strict';

/*
 *	Register routes here
 *	Format:  require('path_to_routes')(app);
 *	Excample: require('../routes/resource')(app);
*/

module.exports = function(app){

	require('../routes/host')(app);
	require('../routes/hostgroup')(app);
	require('../routes/service')(app);
	require('../routes/servicegroup')(app);

}
