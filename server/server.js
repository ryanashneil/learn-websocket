const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { Users } = require('./utils/users');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));
app.get('/', (req, res) => { });

io.on('connection', socket => {
	console.log('New user connected');

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback('Name and room name required');
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));

		// To the new user
		socket.emit('newMessage', generateMessage('admin', 'Welcome to the chat app'));
		// To everyone but the new user
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('admin', `${params.name} has joined`));

		callback();
	});

	socket.on('createMessage', (message, callback) => {
		var user = users.getUser(socket.id);
		if (user && isRealString(message.text)) {
			io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
		}
		callback();
	});

	socket.on('disconnect', () => {
		console.log('User disconnected from Server');
		var user = users.removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('admin', `${user.name} has left`));
		}
	});
});

server.listen(port, () => {
	console.log('Server up on', port);
});
