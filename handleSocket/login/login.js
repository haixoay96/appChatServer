var redisClient = require('../../utils/redisDb.js').redisClient;
var mysqlDb = require('../../utils/mysqlDb.js').mysqlDb;
var async = require('async');
var handleLogin = (socket) => {
	socket.on('login', (data) => {
		if (socket.username) {
			//same same socket
			socket.emit('resultLogin', {
				status: 101
			});
			return;
		}
		var username = data.username;
		var password = data.password;
		async.parallel({
			one: (callback) => {
				redisClient.sadd('listUser', username, (error, rely) => {
					if (error) {
						callback(error);
						return;
					}
					callback(null, rely);
				});
			},
			two: (callback) => {
				mysqlDb.query('SELECT * FROM users WHERE username=? AND password=?', [username, password], (err, rows) => {
					if (err) {
						callback(err);
						return;
					}
					callback(null, rows);
				});
			}
		}, (err, results) => {
			if (err) {
				//error system
				socket.emit('resultLogin', {
					status: 102
				})
			}
			var one = results.one;
			var two = results.two;
			if (one === 1 && two.length !== 0) {
				console.log('login successfull!');
				socket.emit('resultLogin', {
					statusCode: 100,
					avatar: two[0].avatar,
					nickname: two[0].nickname,
					status: two[0].status,
					username: username
				});
				socket.join(username);
				socket.username = username;
				socket.nickname = two[0].nickname;
				socket.password = password;
				socket.broadcast.emit('addUser', {
					nickname: two[0].nickname,
					avatar: two[0].avatar,
					status: two[0].status,
					username: two[0].username
				});
				return;
			}
			if (one === 0) {
				// username already loign
				console.log('username already login');
				socket.emit('resultLogin', {
					statusCode: 103
				});
				return;
			}
			redisClient.srem('listUser', username, (error, rely) => {
				if (error) {
					socket.emit('resultLogin', {
						status: 102
					})
					return;
				}
				//wrong username or password
				socket.emit('resultLogin', {
					statusCode: 104
				});
			});


		});
	});
}
module.exports.handleLogin = handleLogin;