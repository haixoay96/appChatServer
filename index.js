var find = require('lodash');
var express = require('express');
var app = express();
var http = require('http').createServer(app).listen(3000, function () {
	console.log('server running port 3000');
});
var io = require('socket.io')(http);
var emailCheck = require('email-check');
var fs = require('fs');
var formidable = require('formidable');
var nodemailer = require('nodemailer');
var path = require('path');
var transporter = nodemailer.createTransport('smtps://koolsok96%40gmail.com:namnamnam@smtp.gmail.com');
var mailOption = {
	from: 'Admin App chat<koolsok96@gmail.com>',
	to : 'haixoay96@gmail.com',
	subject: 'Khoi phuc pass',
	text: 'pass is 1000',
	html: '<b>Password cua ban la 123456</b>'
};
/*
format profileAccount
{
	account: name,
	socket:socket

}
*/
/*
	code error
	100 success
	101 already
	102 email error
	103 invaild password or account not exist
*/
/*
	userOnlien  {
		username
		socket
		account
	}
*/
//define code error
const ERROR_SUCCESS = 100;
const ERROR_ALREADY = 101;
const ERROR_MAIL = 102;
const ERROR_INVAILD = 103;
const ERROR_NOT_FOUND = 104;
const ERROR_TRY_AGAIN = 105;
const ERROR_ALREADY_LOGIN = 106;

var listUsersOnline = [];
// when there is person connect
io.on('connection', function (socket) {
	// when there is person sign up
	socket.on('signUp', function (data) {
		console.log(data);
		// check exitst mail
		emailCheck(data.account)
		.then(function (res) {
			console.log(res);
			if(res){
				// when email invaild
				console.log(res);
				fs.readFile(__dirname +'/public/data/users.json','utf8', function(err,users) {
					var objectUsers = JSON.parse(users);
					if(find.findIndex(objectUsers.list, {account:data.account}) ===-1){
						// when account not exists
						console.log('thanh cong');
						socket.emit('resultSignUp', {
							status: ERROR_SUCCESS
						});
						objectUsers.list.push({account:data.account, password:data.password,avatar:'/data/avatar/defaultavatar.jpg'});
						fs.writeFile(__dirname+'/public/data/users.json', JSON.stringify(objectUsers, null, 2),'utf8', function (err) {
						console.log(err);
						});
					}
					else {
						// when account already exists
						socket.emit('resultSignUp',{
							status: ERROR_ALREADY
						});
					}

				});
			}
			else{
				console.log("thua");
				// when email not invaild
				socket.emit('resultSignUp', {
					status: ERROR_MAIL
				});

			}
		})
		.catch(function (err) {
			console.log(err);
			socket.emit('resultSignUp', {
				status: ERROR_MAIL
			});
		});
	});

	// when there is login
	socket.on('login', function (data) {
		fs.readFile(__dirname +'/public/data/users.json','utf8', function(err,users) {
			var objectUsers = JSON.parse(users);
			var indexRemove = find.findIndex(listUsersOnline, {
				account:data.account
			});
			if(indexRemove!==-1){
				console.log(listUsersOnline);
				socket.broadcast.emit('removeUser', listUsersOnline[indexRemove]);
				listUsersOnline.splice(indexRemove,1);
				console.log("da remove");
			}
			var indexUsers = find.findIndex(objectUsers.list, data);
			if(indexUsers!==-1 ){
				socket.join(data.account);
				socket.emit('resultLogin', {
					status:ERROR_SUCCESS,
					listUsersOnline: listUsersOnline
				});
				listUsersOnline.push({
					account:data.account,
					socket:socket.id,
					avatar:objectUsers.list[indexUsers].avatar
				});
				socket.broadcast.emit('addUser', listUsersOnline[listUsersOnline.length-1]);	
				console.log(data.account + ' '+ socket.id + ' login');

		
			}
			else{
				console.log(data.account + ' '+ socket.id+ ' that bai');
				socket.emit('resultLogin', {
					status:ERROR_INVAILD
				});
			}
			});
	});
	socket.on('logout', function () {
		var index = find.findIndex(listUsersOnline, {
			socket:socket.id
		});
		if(index!==-1){
			socket.broadcast.emit('removeUser', listUsersOnline[index]);
			listUsersOnline.splice(index,1);
			console.log(data.account + ' '+ socket.id + ' logout');
		}
		console.log(listUsersOnline);

	});	

	socket.on('forgetPassword', function (data) {
		console.log('reset');
		fs.readFile(__dirname + '/public/data/users.json', 'utf8', function (err, users) {
			var objectUsers = JSON.parse(users);
			var index = find.findIndex(objectUsers.list, data);
			if(index ===-1){
				socket.emit('resultForgetPassword', {
					status:ERROR_NOT_FOUND,
				});
			}
			else {
				mailOption.to = objectUsers.list[index].account;
				transporter.sendMail(mailOption, function (error, infor) {
					if(error){
						console.log(error);
						socket.emit('resultForgetPassword', {
							status:ERROR_TRY_AGAIN,
						});
					}
					else{
						console.log(infor);
						socket.emit('resultForgetPassword', {
							status:ERROR_SUCCESS,
						});
					}
				});

			}
		});
	});


	socket.on('sendMessage', function (data) {
		// data = {account:name , message:mess}
		var indexSender = find.findIndex(listUsersOnline, {
			socket:socket.id
		});
		if(indexSender!==-1){
			socket.emit('resultSendMessage', data);
			var receiver = data.account;
			data.account = listUsersOnline[indexSender].account;
			socket.broadcast.to(receiver).emit('receiveMessage', data);
		}
		
	});
	socket.on('disconnect', function () {
			var index = find.findIndex(listUsersOnline, {
				socket:socket.id
			});
			if(index!==-1){
				console.log('disconnect' + socket.id + ' '+ listUsersOnline[index].account);
				socket.broadcast.emit('removeUser', listUsersOnline[index]);
				listUsersOnline.splice(index,1);
				console.log( 'List ' + listUsersOnline);
			}
			
	});

	console.log('co nguoi connect' + socket.id);
});

//static file
app.use(express.static('public'));

// handle http
 app.post('/set/avatar/:account/:password', function (req,res) {
 	// dosomething
 	var user = {
 		account:req.params.account,
 		password:req.params.password
 	};
 	var form = new formidable.IncomingForm();
 	form.encoding = 'utf8';
 	form.uploadDir =  path.join(__dirname,'/public/data/avatar');
 	form.on('file', function (field, file) {
 		fs.readFile(__dirname+'/public/data/users.json', 'utf8', function (err, users) {
 			var objectUsers = JSON.parse(users);
 			var index = find.findIndex(objectUsers.list, user);
 			if(index !== -1){
 				fs.rename(file.path, path.join(form.uploadDir,user.account+ file.name), function (err) {
 					if(!err){
 						objectUsers.list[index].avatar = file.path;
 						console.log(file.path);
 					}
 					
 				});
 			}
 		});

 	});
 	form.on('end', function () {
 		res.end('success');
 	});
 	form.on('error', function (error) {
 		console.log(error);
 	});

 	form.parse(req);

 });
