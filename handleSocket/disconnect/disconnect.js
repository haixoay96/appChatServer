var redisClient = require('../../utils/redisDb.js').redisClient;
var handleDisconnect = (socket) => {
	socket.on('disconnect', () => {
		if(socket.username){
			socket.broadcast.emit('removeUser',{
				username: socket.username
			});
			redisClient.srem('listUser', socket.username, (error, rely)=>{
				if(error){
					console.log('Remove username error!');
					return;
				}
				if(rely === 1){
					console.log('Remove username successfull!');
					return;
				}
				console.log('Username not been login!');
			});
		}
		console.log(socket.id + ' disconnect!');

	});
}
module.exports.handleDisconnect = handleDisconnect;