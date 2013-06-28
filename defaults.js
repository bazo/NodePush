var config = {
	"server": {
		"host": "127.0.0.1",
		"port": 8080
	},
	"app": {
		"debug": false
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
	}
};
module.exports = config;