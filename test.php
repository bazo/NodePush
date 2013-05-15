<?php
require_once __DIR__ . '/ElephantIO/Client.php';

use ElephantIO\Client as ElephantIOClient;

$client = new ElephantIOClient('http://pure-garden-1366.herokuapp.com:8080/',//'http://node.local:8080', 
								'socket.io', 1, true, true, true);

$client->init();

$data = [
	'id' => 1,
	'timestamp' => time(),
	'message' => 'lorem ipsum'
];

$response = $client->emit('push', json_encode([
	'room' => 'demo',
	'event' => 'new-message',
	'data' => $data
]), null);

var_dump($response);exit('koot');

$client->close();