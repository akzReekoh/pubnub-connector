# PubNub Connector

[![Build Status](https://travis-ci.org/Reekoh/pubnub-connector.svg)](https://travis-ci.org/Reekoh/pubnub-connector)
![Dependencies](https://img.shields.io/david/Reekoh/pubnub-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/pubnub-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

PubNub Connector Plugin for the Reekoh IoT Platform. Integrates a Reekoh instance to a PubNub to synchronise device data.

The PubNub Connector Plugin will push or publish data coming from your connected devices to your PubNub Channel in real-time.

## Configuration Parameters

The following configuration parameters are injected to the plugin from the platform.

* publish_key - The PubNub publish key to use.
* subscribe_key - The PubNub subscribe key. This is required by the PubNub SDK but is not used by the plugin.
* channel - The PubNub channel where the plugin will publish the device data.

