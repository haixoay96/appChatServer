var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'duclinh',
  password : '123456',
  database : 'btltk'
});
connection.connect((error)=>{
	if(error){
		console.log('Mysql connect error!');
		console.error(error);
		process.exit(0);
	}
	console.log('Mysql connect successfull!');
});
module.exports.mysqlDb = connection;
