#!/usr/bin/env node
var util = require('util');
var commander = require('commander');
var merge = require('deepmerge');
var verifyPayload = require('./functions/verifyPayload.js');
var zmq = require('zmq');
var WebSocket = require('ws');
var Cookies = require("cookies");

commander
		.version('0.5')
		.option('-c, --config [value]', 'Set config file, use relative or absolute paths', './config.js')
		.parse(process.argv);

var configPath = commander.config;
var defaultConfig = './defaults.js';

var defaults = require(defaultConfig);
var config = {};

try {
	config = require(configPath);
} catch (err) {
	console.log(util.format('%s not found, using default host and port: %s:%s', configPath, defaults.server.host, defaults.server.port));
}
config = merge(defaults, config);

var cookieName = config.cookieName;

if (config.server.https.enabled === true) {
	var protocol = require("https");
	var fs = require('fs');
	if (config.server.https.format === 'keyCert') {
		console.log('key+cert');
		var options = {
			key: fs.readFileSync(config.server.https.keyCert.key),
			cert: fs.readFileSync(config.server.https.keyCert.cert)
		};
	}

	if (config.server.https.format === 'pfx') {
		var options = {
			pfx: fs.readFileSync(config.server.https.pfx)
		};

	}

	if (config.server.https.passphrase !== null) {
		options.passphrase = config.server.https.passphrase;
	}

	try {
		var server = protocol.createServer(options);
	} catch (err) {
		if (err.message === 'mac verify failure') {
			console.log('You need to provide a valid passphrase.');
		}
		process.exit(1);
	}
} else {
	var protocol = require("http");
	var server = protocol.createServer();
}

server.listen(config.server.port, config.server.host);

if (config.security.enabled === true) {
	var crypto = require('crypto');
}

var sock = zmq.socket('rep');

var Storage = function () {
	var rooms = {};
	var clients = {};

	var sockets = {};

	this.join = function (id, client, room) {

		room = room.toString();

		if (!rooms.hasOwnProperty(room)) {
			rooms[room] = [];
		}

		if (rooms[room].indexOf(id) === -1) {
			rooms[room].push(id);
		}

		if (!clients.hasOwnProperty(id)) {
			clients[id] = [];
		}

		if (clients[id].indexOf(room) === -1) {
			clients[id].push(room);
		}

		if (!sockets.hasOwnProperty(id)) {
			sockets[id] = client;
		}
	};

	this.leave = function (id, room) {

		if (rooms.hasOwnProperty(room)) {
			var index = rooms[room].indexOf(id);
			console.log(index);
			if (index !== -1) {
				rooms[room].splice(index);
			}
		}

		if (clients.hasOwnProperty(id)) {
			var index = rooms[room].indexOf(id);
			var clientRooms = clients[id];
			for(var i in clientRooms) {
				var room = clientRooms[i];

				var index = clientRooms.indexOf(room);
				if (index !== -1) {
					clientRooms.splice(index);
				}
			}
		}
	};

	this.leaveAll = function (id) {
		console.log(id);
		var roomsToLeave = clients[id];

		for(var i in roomsToLeave) {
			var room = roomsToLeave[i];
			this.leave(id, room);
		}
	};

	this.getClientsInRoom = function*(room) {
		var hasRoom = rooms.hasOwnProperty(room);

		if(hasRoom) {
			var clientIds = rooms[room];
			for(var index in clientIds) {
				var id = clientIds[index];
				var client = sockets[id];
				yield client;
			}
		}
	};

	this.getData = function () {
		return {
			rooms: rooms,
			clients: clients,
			//sockets: sockets
		};
	};
};

sock.bind('tcp://' + config.server.host + ':' + config.server.zmqPort);
console.log('Request socket connected to port %s', config.server.zmqPort);

var rooms = new Storage();

var WebSocketServer = WebSocket.Server;

var wss = new WebSocketServer({server: server});

wss.on('connection', function (client) {

	var cookies = Cookies(client.upgradeReq, null);

	client.on('message', function (json) {
		var id = cookies.get(config.cookieName);
		var data = JSON.parse(json);

		if (data.event === 'join') {
			for (var i in data.rooms) {
				var room = data.rooms[i];
				rooms.join(id, client, room);
			}

			console.log(rooms.getData());
		}

		if (data.event === 'leave') {
			rooms.leave(id, data.room);
			console.log(rooms.getData());
		}
	});

	client.on('close', function (client) {
		var id = cookies.get(config.cookieName);
		rooms.leaveAll(id);
		console.log(rooms.getData());
	});

});

console.log(wss.emit)


var push = function(room, data) {
	var clients = rooms.getClientsInRoom(room);
	for (var client of clients) {
		client.send(data);
	}
};

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function (client) {
		client.send(data);
	});
};

sock.on('message', function (buffer) {
	var message = buffer.toString();

	var data = JSON.parse(message);

	if (!data.hasOwnProperty('room')) {
		return;
	}

	var room = data.room;
	var payload = JSON.stringify(data.payload);
	if (room === '*') {
		wss.broadcast(payload);
	} else {
		console.log('pushing to room: ' + room)
		push(room, payload);
	}


	sock.send('ok');
});