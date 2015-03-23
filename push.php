<?php
$context	 = new ZMQContext();
$publisher	 = $context->getSocket(ZMQ::SOCKET_PUB);
$publisher->bind("tcp://*:3000");
//$publisher->bind("ipc://weather.ipc");
usleep(120000);
$num = 0;
for($i = 1; $i <= 1; $i++) {
	//  Get values that will fool the boss
	$num++;
	$event = "push";

	$data = [
		'room' => 1,
		'payload' => [
			'message' => 'ahoj '.$num
		]
	];

	//  Send message to all subscribers
	$update = sprintf("%s %s", $event, json_encode($data));
	echo $update."\n";
	$publisher->send($update);
}
