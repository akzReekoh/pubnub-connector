'use strict';

const PUBLISH_KEY   = 'pub-c-7ab76dcc-b213-4a2a-bc09-62ce0fbe944a',
	  SUBSCRIBE_KEY = 'sub-c-61013576-7be4-11e5-8495-02ee2ddab7fe',
	  CHANNEL       = 'devicedata';

var cp     = require('child_process'),
	should = require('should'),
	pubnubConnector, pubnubClient;

describe('Pubnub Connector', function () {
	this.slow(5000);

	before('create pubnub client', function () {
		pubnubClient = require('pubnub')({
			ssl: true,
			publish_key: PUBLISH_KEY,
			subscribe_key: SUBSCRIBE_KEY
		});
	});

	after('terminate child process', function () {
		this.timeout(5000);

		setTimeout(function () {
			pubnubConnector.kill('SIGTERM');
		}, 4000);
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(pubnubConnector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			pubnubConnector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			pubnubConnector.send({
				type: 'ready',
				data: {
					options: {
						publish_key: PUBLISH_KEY,
						subscribe_key: SUBSCRIBE_KEY,
						channel: CHANNEL
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should be able to publish the data', function (done) {
			this.timeout(6000);

			pubnubClient.subscribe({
				channel: CHANNEL,
				callback: function (message) {
					should.equal(message.co2_1hr, '11%', 'Data validation failed. Field: co2_1hr');
					should.equal(message.co2_8hr, '8%', 'Data validation failed. Field: co2_8hr');
					should.equal(message.n_1hr, '70%', 'Data validation failed. Field: n_1hr');
					should.equal(message.n_8hr, '72%', 'Data validation failed. Field: n_8hr');
					should.equal(message.o2_1hr, '19%', 'Data validation failed. Field: o2_1hr');
					should.equal(message.o2_8hr, '20%', 'Data validation failed. Field: o2_8hr');
					done();
				}
			});

			setTimeout(function () {
				pubnubConnector.send({
					type: 'data',
					data: {
						co2_1hr: '11%',
						co2_8hr: '8%',
						n_1hr: '70%',
						n_8hr: '72%',
						o2_1hr: '19%',
						o2_8hr: '20%'
					}
				}, function (error) {
					should.ifError(error);
				});
			}, 3000);
		});
	});
});