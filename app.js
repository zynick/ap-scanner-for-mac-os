'use strict';

var program  = require('commander');
var fs       = require('fs');
var mongoose = require('mongoose');
var liner    = require('./liner');

program
  .version('1.0.0')
  .option('-f, --file [ap.txt]'        , 'input file'      , 'ap.txt')
  .option('-l, --location  [location]' , 'ap location')
  .option('-h, --mongoHost [localhost]', 'mongodb host'    , 'localhost')
  .option('-p, --mongoPort [27017]'    , 'mongodb port'    , 27017)
  .option('-d, --database  [tidedb]'   , 'mongodb database', 'tidedb')
  .parse(process.argv);


// 1. Some input verification

if (!program.location) {
  return console.log('please specify location (using -l)');
}

if (!fs.existsSync('./' + program.file)) {
  return console.log('file not found: ' + program.file);
}


// 2. Parse APs from File

var line,
    mac,
    hashmap = {},
    source  = fs.createReadStream('./' + program.file);
    source.pipe(liner);


liner.on('readable', function () {
  line = liner.read();

  // verify this line has a proper format by validating mac address
  mac = line.substr(33, 17);
  if (!/\w\w(:\w\w){5}/.test(mac)) { return; }

  hashmap[mac] = {
    loc  : program.location,
    ssid : line.substr(0, 32).trim(),
    mac  : mac,
    rssi : line.substr(51, 4).trim(),
    chn  : line.substr(56, 7).trim(),
    ht   : line.substr(64, 1),
    cc   : line.substr(67, 2),
    sec  : line.substr(70).trim()
  };
});


liner.on('end', function () {

  var keys = Object.keys(hashmap);

  console.log('MAC Found: ' + keys.length);

  // 3. Store APs into DB
  
  mongoose.connect('mongodb://' + program.mongoHost + ':' + program.mongoPort + '/' + program.database);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {

    require('./models/ap.js');
    var AP   = mongoose.model('AP'),
        bulk = AP.collection.initializeUnorderedBulkOp();

    keys.forEach(function (key) {
      bulk.find({ mac: key }).upsert().replaceOne(hashmap[key]);
    });

    bulk.execute(function(err, result) {
      console.log(JSON.stringify(result, null, 2)); // will show errors too
      db.close();
    });

  });

});

