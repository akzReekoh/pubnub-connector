'use strict'

const amqp = require('amqplib')

const PUBLISH_KEY = 'pub-c-7ab76dcc-b213-4a2a-bc09-62ce0fbe944a'
const SUBSCRIBE_KEY = 'sub-c-61013576-7be4-11e5-8495-02ee2ddab7fe'
const CHANNEL = 'devicedata'

let _channel = null
let _conn = null
let app = null

describe('PubNub Connector Test', () => {
  before('init', () => {
    process.env.ACCOUNT = 'adinglasan'
    process.env.CONFIG = JSON.stringify({
      publishKey: PUBLISH_KEY,
      subscribeKey: SUBSCRIBE_KEY,
      channel: CHANNEL
    })
    process.env.INPUT_PIPE = 'ip.pubnub'
    process.env.LOGGERS = 'logger1, logger2'
    process.env.EXCEPTION_LOGGERS = 'ex.logger1, ex.logger2'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
      _channel = channel
    }).catch((err) => {
      console.log(err)
    })
  })

  after('close connection', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(10000)
      app = require('../app')
      app.once('init', done)
    })
  })

  describe('#data', () => {
    it('should send data to third party client', function (done) {
      this.timeout(15000)

      let data = {
        'co2_1hr': '11%',
        'co2_8hr': '8%',
        'n_1hr': '70%',
        'n_8hr': '72%',
        'o2_1hr': '19%',
        'o2_8hr': '20%'
      }

      _channel.sendToQueue('ip.pubnub', new Buffer(JSON.stringify(data)))
      setTimeout(done, 10000)
    })
  })
})
