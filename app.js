'use strict';

var platform      = require('./platform'),
	isArray       = require('lodash.isarray'),
	async         = require('async'),
	isPlainObject = require('lodash.isplainobject'),
	pubnubClient, channel;

let sendData = (data, callback) => {
	pubnubClient.publish({
		channel: channel,
		message: data,
		callback: (result) => {
			platform.log(JSON.stringify({
				title: `Pushed data to pubnub channel: ${channel}`,
				data: data,
				result: result
			}));

			callback();
		},
		error: callback
	});
};

platform.on('data', function (data) {
	if (isPlainObject(data)) {
		sendData(data, (error) => {
			if (error) platform.handleException(error);
		});
	}
	else if (isArray(data)) {
		async.each(data, (datum, done) => {
			sendData(datum, done);
		}, (error) => {
			if (error) platform.handleException(error);
		});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.on('close', function () {
	var d = require('domain').create();

	d.on('error', function (error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
	});

	d.run(function () {
		pubnubClient.shutdown();
		platform.notifyClose();
	});
});

platform.once('ready', function (options) {
	channel = options.channel;

	pubnubClient = require('pubnub')({
		publish_key: options.publish_key,
		subscribe_key: options.subscribe_key,
		ssl: true
	});

	platform.notifyReady();
});