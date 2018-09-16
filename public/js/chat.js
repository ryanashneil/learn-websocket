let socket = io(); //Empty defaults to current browser page
let currentUserName;

socket.on('connect', function () {
	currentUserName = generateName();
	let params = {
		room: window.location.href,
		name: currentUserName
	};

	let roomName = jQuery('<h3></h3>').text(params.room);
	let userName = jQuery('<p></p>').text('You are ' + params.name);
	jQuery('#room').html(roomName);
	jQuery('#user-name').html(userName);

	socket.emit('join', params, function (err) {
		err ? window.location.href = '/' : null;
	});

});

socket.on('newMessage', function (message) {
	switch (message.from) {
		case currentUserName: return renderMessage('user', message);
		case 'admin': return renderMessage('admin', message);
		default: return renderMessage('default', message);
	}
});

socket.on('updateUserList', function (users) {
	let p = jQuery('<p></p>').text(users.length + ' Online');
	jQuery('#users').html(p);
})

socket.on('disconnect', function () {
	console.log('Disconnected from Server');
});


jQuery('#message-form').on('submit', function (event) {
	event.preventDefault();

	let text = jQuery('[name=message]');
	socket.emit('createMessage', { text: text.val() }, function () {
		text.val('');
	});
});

function scrollToBottom() {
	let messages = jQuery('#messages');
	
	let newMessage = messages.children('li:last-child');
	let clientHeight = messages.prop('clientHeight');
	let scrollTop = messages.prop('scrollTop');
	let scrollHeight = messages.prop('scrollHeight');
	let newMessageHeight = newMessage.innerHeight();
	let lastMessageHeight = newMessage.prev().innerHeight() || 0;

	let newHeight = clientHeight + scrollTop + newMessageHeight + lastMessageHeight;
	newHeight >= scrollHeight ? messages.scrollTop(scrollHeight) : null
}

function renderMessage(user, message) {
	let formattedTime = moment(message.createdAt).format('h:mm a');
	let messageType = {
		admin: '#admin-message-template',
		user: '#user-message-template',
		default: '#message-template',
	}

	let template = jQuery(messageType[user]).html();
	let html = Mustache.render(template, {
		text: message.text,
		from: message.from,
		createdAt: formattedTime
	});

	jQuery('#messages').append(html);
	scrollToBottom();
}

