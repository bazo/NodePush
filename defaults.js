var config = {
	"server": {
		"host": "0.0.0.0", //all interfaces
		"port": 8080, //example port
		"https": {
			"enabled": false,
			"format": null, //keyCert or pfx
			"keyCert": {
				"key": "path/to/key-file",
				"cert": "path/to/cert-file"
			},
			"pfx": "path/to/pfx-file",
			"passphrase": "your passphrase"
		}
	},
	"app": {
		"debug": false
	},
	"push": {
		"volatile": false
	},
	"security": {
		"enabled": false, //if you want to prevent others to send messages through this server
		"key": "changeThisToSomethingRandomAndSecure",
		"allowedTimeDiff": 5
	}
};
module.exports = config;