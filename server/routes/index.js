
/*
 * GET home page.
 */

exports.index = function(req, res){
  console.log('index accessed');
  res.render('host', { title: 'Express' });
};