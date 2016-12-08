var redisClient = require('../../utils/redisDb.js').redisClient;
var mysqlDb = require('../../utils/mysqlDb.js').mysqlDb;
var async = require('async');
var handleListUser = (socket) => {
	socket.on('listUser', (data) => {
		if (socket.username) {
			async.waterfall([
				(callback) => {
					redisClient.smembers('listUser', (error, results) => {
						if (error) {
							console.log('Query useronline error!');
							callback(error);
							return;
						}
						console.log(results);
						callback(null, results);
					});
				},
				(results, callback) => {
					if (results.length === 0) {
						console.log(0);
						callback(null, []);
						return;
					}
					mysqlDb.query('SELECT username, nickname, status, avatar FROM users WHERE username IN (?) ', [results], (error, rows) => {
						if (error) {
							console.error(error);
							callback(error);
							return;
						}
						console.log(rows);
						callback(null, rows);
					});
				}
			], (error, listUser) => {
				if (error) {
					console.log('error');
					socket.emit('resultListUser', {
						status: 101
					});
					return;
				}
				console.log(listUser);
				socket.emit('resultListUser', {
					status: 100,
					listUser: listUser
				})
			});
		}
	});
}
module.exports.handleListUser = handleListUser;