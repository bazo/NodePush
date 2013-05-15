var config = require('./config.json');
var io = require('socket.io').listen(config.server.port);

io.sockets.on('connection', function (socket) {

	socket.on('subscribe', function(data) { 
		console.log(socket.id + ' joined room: ' + data.room);
		socket.join(data.room);
	});

	socket.on('unsubscribe', function(data) { 
		console.log(socket.id + ' left room: ' + data.room);
		socket.leave(data.room); 
	});

	socket.on('push', function(data) {
		data = JSON.parse(data);
		io.sockets.in(data.room).emit(data.event, data.data);
	});

	socket.on('disconnect', function () {
		console.log(socket.id + ' disconnected');
	});
});