#!/usr/bin/env node
var util = require('util');
var socket = require('socket.io');
var http = require("http");
var commander = require('commander');
var applyConfig = require('./applyConfig.js');

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

var useVerification = false;
var hmac = null;

if(config.hasOwnProperty('security')) {
	if(!config.security.hasOwnProperty('enabled')) {
		console.log('Missing config.security.enabled');
		process.exit(1);
	}
	if(config.security.enabled === true) {
		useVerification = true;
		if(!config.security.hasOwnProperty('key')) {
			console.log('Missing config.security.key');
			process.exit(1);
		}
		
		if(!config.security.hasOwnProperty('allowedTimeDiff')) {
			config.security.allowedTimeDiff = 5;
		}
		
		var crypto = require('crypto');
	}
}

function verifyPayload(data, callback, errorCallback) {
	var unixTimestamp = Math.round(new Date / 1000);
	
	if(useVerification === false) {
		callback();
		
	} else if((unixTimestamp - data.timestamp) > config.security.allowedTimeDiff) {
		errorCallback('Payload too old.');
		
	} else if(!data.hasOwnProperty('signature')) {
		errorCallback('Missing signature.');
		
	} else {
		var signature = data.signature;
		delete data.signature;
		
		hmac = crypto.createHmac('md5', config.security.key);
		var hash = hmac.update(JSON.stringify(data)).digest('hex');
		if(hash === signature) {
			callback();
		} else {
			errorCallback('Signature mismatch.');
		}
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
		var callback = function() {
			io.sockets.in(data.room).emit(data.event, data.data);
		};
		
		var errorCallback = function (message) {
			if(appOptions.debug) {
				console.log('Could not verify payload: ' + message);
			}
		}
		
		verifyPayload(data, callback, errorCallback);
	});

	socket.on('disconnect', function () {
		if(appOptions.debug) {
			console.log(socket.id + ' disconnected');
		}
	});
});