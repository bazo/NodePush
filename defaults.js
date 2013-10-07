var config = {
	"server": {
		"host": "0.0.0.0",
		"port": 8080,
		"https": {
			"enabled": false,
			"format": null, //keyCert or pfx
			"keyCert": {
				"key": null,
				"cert": null
			},
			"pfx": null
		}
	},
	"app": {
		"debug": false
	},
	"push": {
		"volatile": false
	},
	"io": {
		"set": {
			"log level": 1
		},
		"enable": [
			"browser client minification",
			"browser client etag",
			"browser client gzip"
		]
	},
	"security": {
		"enabled": false,
		"key": "changeThisToSomethingRandomAndSecure",
		"allowedTimeDiff": 5
	}
};
module.exports = config;