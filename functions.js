var util = require('util');

function applyConfig (config, appOptions, io) {
	if(config.hasOwnProperty('io')) {
		if(config.io.hasOwnProperty('set')) {
			for(option in config.io.set) {
				var value = config.io.set[option];
				if(appOptions.debug) {
					console.log(util.format('setting option:%s to value: %s', option, value))
				}
				io.set(option, value);
			}
		}

		if(config.io.hasOwnProperty('enable')) {
			for(option in config.io.enable) {
				var value = config.io.enable[option];
				if(appOptions.debug) {
					console.log(util.format('enabling option: %s', value))
				}
				io.enable(option);
			}
		}
	}
};

module.exports = applyConfig;