<?php
$context = new ZMQContext();

//  Socket to talk to server
echo "Connecting to hello world server\n";
$requester = new ZMQSocket($context, ZMQ::SOCKET_PUB);
$requester->connect("tcp://127.0.0.1:3000");

for ($request_nbr = 0; $request_nbr != 10; $request_nbr++) {
	echo sprintf("Sending request %d\n", $request_nbr);
	$requester->send(["kitty", "ahoj"]);

	//$reply = $requester->recv();
	//printf("Received reply %d: [%s]\n", $request_nbr, $reply);
}