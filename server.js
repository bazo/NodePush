#!/usr/bin/env node
var util = require('util');
var commander = require('commander');
var merge = require('deepmerge');
var verifyPayload = require('./functions/verifyPayload.js');
var zmq = require('zmq');
var WebSocket = require('ws');

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

var sock = zmq.socket('sub');



sock.connect('tcp://127.0.0.1:3000');
sock.subscribe('push');
console.log('Subscriber connected to port 3000');


var WebSocketServer = WebSocket.Server;

var wss = new WebSocketServer({server: server});

wss.on('connection', function (ws) {

	ws.on('message', function (json) {

		var data = JSON.parse(json);

		console.log(data);

	});

});

wss.broadcast = function broadcast(data) {
	console.log('broadcasting');
	console.log(data);
		wss.clients.forEach(function each(client) {
			client.send(data);
		});
	};

sock.on('message', function (buffer) {
	message = buffer.toString();
	var topic = message.substring(0, 4);
	if (topic === 'push') {
		var data = message.substring(5);
	}

	console.log(topic, data);

	wss.broadcast(data);

	console.log('received a message related to:', topic, 'containing message:', data);
});