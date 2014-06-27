'use strict';
/*jslint unparam: true, node: true */

/*
 *	Register routes here
 *	Format:  require('path_to_routes')(app);
 *	Excample: require('../routes/resource')(app);
*/

module.exports = function(app){

	app.get('/', function(req,res){
		res.render('index');
	});

	require('../routes/host')(app);
	require('../routes/hostgroup')(app);
	require('../routes/service')(app);
	require('../routes/servicegroup')(app);
	require('../routes/command')(app);
	require('../routes/contact')(app);
	require('../routes/timeperiod')(app);

};
