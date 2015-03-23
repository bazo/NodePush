<?php


$room = $argv[1];

$context	 = new ZMQContext();
$publisher	 = $context->getSocket(ZMQ::SOCKET_REQ);
$publisher->connect("tcp://127.0.0.1:3000");
//$publisher->bind("ipc://weather.ipc");
//usleep(120000);
$num = 0;
while(TRUE) {
	//  Get values that will fool the boss
	$num++;
	$event = "push";

	$data = [
		'room' => $room,
		'payload' => [
			'message' => 'ahoj '.$num
		]
	];

	//  Send message to all subscribers
	$update = sprintf("%s", json_encode($data));
	echo $update."\n";
	$publisher->send($update, ZMQ::MODE_NOBLOCK);
	$publisher->recv();
}
