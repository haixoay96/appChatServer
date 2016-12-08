var mysqlDb = require('../../utils/mysqlDb.js').mysqlDb;
var async = require('async');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://koolsok96%40gmail.com:namnamnam@smtp.gmail.com');
var handleForgetPassword = (socket) => {
	socket.on('forgetPassword', (data) => {
		var username = data.username;
		async.waterfall([
			(callback) => {
				mysqlDb.query('SELECT password FROM users WHERE username = ?', [username], (error, rows) => {
					if (error) {
						callback(error);
						return
					}
					callback(null, rows);
				});
			},
			(rows, callback) => {
				if (rows.length !== 0) {
					var mailOption = {
						from: 'Admin App chat<koolsok96@gmail.com>',
						to: username,
						subject: 'Khoi phuc pass',
						text: 'Pass is ' + rows[0].password,
						html: '<b>Pass is ' + rows[0].password + '</b>'
					};
					transporter.sendMail(mailOption, function(error, infor) {
						if (error) {
							callback(error);
							return;
						}
						callback(null, rows);
					});
					return;
				}
				callback(null, rows);
			}
		], (error, rows) => {
			if (error) {
				console.log('System error');
				socket.emit('resultForgetPassword', {
					status: 101
				});
				return;
			}
			if (rows.length === 0) {
				console.log('username not exists!');
				socket.emit('resultForgetPassword', {
					status: 102
				});
				return;
			}
			console.log('Successfull!');
			socket.emit('resultForgetPassword', {
				status: 100,
			});
		})

	});
}
module.exports.handleForgetPassword = handleForgetPassword;