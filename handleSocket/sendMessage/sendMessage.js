var handleSendMessage = (socket) => {
	socket.on('sendMessage', (data) => {
		if (socket.username) {
			var username = data.username;
			socket.emit('resultSendMessage', data);
			socket.broadcast.to(username).emit('receiveMessage', {
				username: socket.username,
				message: data.message
			});
			console.log(socket.username + ' to ' + username + ' ' + data.message );
		}
	});
}
module.exports.handleSendMessage = handleSendMessage;