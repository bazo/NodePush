var fs = require('fs');
var socket = require('socket.io');
var http = require("http")

var configPath = './config.json';

var defaults = {
	"server": {
		"host": "127.0.0.1",
		"port": 8080
	},
	"app": {
		"debug": false
	},
	"io": {
		"log level": 1
	}
};

if(fs.existsSync(configPath)) {
	var config = require(configPath);
} else {
	console.log('config.json missing, using default host and port: ' + defaults.server.host + ':' +defaults.server.port);
	var config = defaults;
}

var appOptions = config.hasOwnProperty('app') ? config.app : {};

var server = http.createServer();
server.listen(config.server.port, config.server.host);
var io = socket.listen(server, appOptions);

if(config.hasOwnProperty('io')) {
	for(option in config.io) {
		io.set(option, config.io.option);
	}
}

io.sockets.on('connection', function (socket) {

	socket.on('subscribe', function(data) {
		if(appOptions.debug) {
			console.log(socket.id + ' joined room: ' + data.room);
		}
		socket.join(data.room);
	});

	socket.on('unsubscribe', function(data) {
		if(appOptions.debug) {
			console.log(socket.id + ' left room: ' + data.room);
		}
		socket.leave(data.room); 
	});

	socket.on('push', function(data) {
		data = JSON.parse(data);
		io.sockets.in(data.room).emit(data.event, data.data);
	});

	socket.on('disconnect', function () {
		if(appOptions.debug) {
			console.log(socket.id + ' disconnected');
		}
	});
});