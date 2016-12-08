var handleLogin = require('./login/login.js').handleLogin;
var handleSignup = require('./signup/signup.js').handleSignup;
var handleDisconnect = require('./disconnect/disconnect.js').handleDisconnect;
var handleListUser = require('./listUser/listUser.js').handleListUser;
var handleChangePassword = require('./changePassword/changePassword.js').handleChangePassword;
var handleForgetPassword =require('./forgetPassword/forgetPassword.js').handleForgetPassword;
var handleSendMessage = require('./sendMessage/sendMessage.js').handleSendMessage;
var handleIo = (io) => {
	io.on('connection', (socket) => {
		console.log('There\'s one connect!');
		handleLogin(socket);
		handleSignup(socket);
		handleListUser(socket);
		handleChangePassword(socket);
		handleForgetPassword(socket);
		handleDisconnect(socket);
		handleSendMessage(socket);
	});
}
module.exports.handleIo = handleIo;