'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let isArray = require('lodash.isarray')
let isPlainObject = require('lodash.isplainobject')
let async = require('async')
let pubnubClient = null

let sendData = (data, callback) => {
  pubnubClient.publish({
    channel: _plugin.config.channel,
    message: data,
    callback: (result) => {
      _plugin.log(JSON.stringify({
        title: `Pushed data to pubnub channel: ${_plugin.config.channel}`,
        data: data,
        result: result
      }))

      callback()
    },
    error: callback
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) _plugin.logException(error)
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) _plugin.logException(error)
    })
  } else {
    _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`))
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  pubnubClient = require('pubnub')({
    publishKey: _plugin.config.publishKey,
    subscribeKey: _plugin.config.subscribeKey,
    ssl: true
  })

  _plugin.log('Pubnub Connector has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
