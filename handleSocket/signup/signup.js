var mysqlDb = require('../../utils/mysqlDb.js').mysqlDb;
var emailCheck = require('email-check');
var async = require('async');
var handleSignup = (socket) => {
	socket.on('signup', (data) => {
		var username = data.username;
		var password = data.password;
		console.log(data);
		async.waterfall([
			(callback) => {
				emailCheck(username).
				then((res) => {
					console.log(res);
					callback(null, res);
				}).
				catch((error) => {
					console.log('loi');
					console.error(error);
					callback(error);
				});
			},
			(res, callback) => {
				if (res) {
					mysqlDb.query('INSERT INTO users (username, password,nickname, avatar , status, token ) values(?, ?, ? , ?, ?, ?)', [username, password, username.split('@')[0], '/data/avatar/defaultavatar.jpg', 'None', Date.now().toString()], (error, rows) => {
						if (error) {
							callback(error);
							return;
						}
						callback(null, res);
					});
					return;
				}
				callback(null, res);

			}

		], (error, res) => {
			if (error) {
				// error system
				console.log('error system');
				socket.emit('resultSignup', {
					status: 102
				});
				return;
			}
			if (res) {
				console.log('Successfull!');
				socket.emit('resultSignup', {
					status: 100
				});
				return;
			}
			// mail wrong
			console.log('mail error');
			socket.emit('resultSignup', {
				status: 101
			});

		});

	});
}
module.exports.handleSignup = handleSignup;