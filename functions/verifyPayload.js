var hmac = null;

function verifyPayload(config, crypto, data, callback, errorCallback) {
	var unixTimestamp = Math.round(new Date / 1000);
	
	if(config.security.enabled === false) {
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
		console.log(hash, signature, hash === signature);
		if(hash === signature) {
			callback();
		} else {
			errorCallback('Signature mismatch.');
		}
	}
}

module.exports = verifyPayload;