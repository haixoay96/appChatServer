var mysqlDb = require('../../utils/mysqlDb.js').mysqlDb;
var handleChangePassword = (socket) => {
	socket.on('changePassword', (data) => {
		var oldpassword = data.oldpassword;
		var password = data.password;
		if (socket.password === oldpassword) {
			mysqlDb.query('UPDATE users SET password = ? WHERE username = ?', [password, socket.username], (error, results) => {
				if (error) {
					console.log('error');
					console.error(error);
					socket.emit('resultChangePassword', {
						status: 102
					});
					return;
				}
				console.log('Success!');
				console.log(results);
				socket.emit('resultChangePassword', {
					status: 100
				})
			});
		}
	});

}
module.exports.handleChangePassword = handleChangePassword;