'use strict';

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var APSchema = new Schema({

  mac : { type: String, required: true, index: true, unique: true },
  cc  : String,   // country code
  chn : String,   // channel
  ht  : String,   // high throughput mode
  loc : String,   // location
  rssi: String,   // received signal strength indication
  sec : String,   // security
  ssid: String    // service set identifier
}, {
  versionKey: false,
  collection: 'aps',
  autoIndex:  process.env.NODE_ENV !== 'production'
});

mongoose.model('AP', APSchema);