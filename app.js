'use strict';

var platform      = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	pubnubClient, channel;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	if (isPlainObject(data)) {
		pubnubClient.publish({
			channel: channel,
			message: data,
			callback: function (result) {
				platform.log(JSON.stringify({
					title: 'Pushed data to pubnub channel ' + channel,
					data: data,
					result: result
				}));
			},
			error: function (error) {
				console.error('Error', error);
				platform.handleException(error);
			}
		});
	}
	else
		platform.handleException(new Error('Invalid data received. Data: ' + data));
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	var domain = require('domain');
	var d = domain.create();

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

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	channel = options.channel;

	pubnubClient = require('pubnub')({
		publish_key: options.publish_key,
		subscribe_key: options.subscribe_key,
		ssl: true
	});

	platform.notifyReady();
});