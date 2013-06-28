#!/usr/bin/env node
var util = require('util');
var socket = require('socket.io');
var http = require("http");
var commander = require('commander');
var applyConfig = require('./functions.js');

commander
	.version('0.5')
	.option('-c, --config [value]', 'Set config file, use relative or absolute paths', './config.js')
	.parse(process.argv);

var configPath = commander.config;
var defaults = './defaults.js';

try {
	var config = require(configPath);
} catch(err) {
	var config = require(defaults);
	console.log(util.format('%s not found, using default host and port: %s:%s', configPath, config.server.host, config.server.port));
}

var appOptions = config.hasOwnProperty('app') ? config.app : {};

var server = http.createServer();
server.listen(config.server.port, config.server.host);
var io = socket.listen(server, appOptions);

applyConfig(config, appOptions, io);

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