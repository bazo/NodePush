<?php
require_once __DIR__ . '/ElephantIO/Client.php';

use ElephantIO\Client as ElephantIOClient;

$client = new ElephantIOClient('http://node.local:8080', 
								'socket.io', 1, true, true, true);

$client->init();

$response = $client->send(
    ElephantIOClient::TYPE_EVENT,
    null,
    null,
    json_encode(array('name' => 'push', 'args' => 'foo'))
);

var_dump($response);

$client->close();