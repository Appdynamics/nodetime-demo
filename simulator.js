

var request = require('request');
var async = require('async');

function run(url, duration, rate, callback) {
  var funcs = [];

  var duration = duration * 1000;
  var interval = Math.round(1000 / rate);
  for(var i = 0; i < duration; i = i + interval) {
    (function() {
      var timeout = i;

      funcs.push(function(callback) {
        setTimeout(function() {
          request(url, function(err, headers, body) {
            if(err) return callback(err);

            callback();
          });
        }, timeout);
      });
    })();
  }

  async.parallel(funcs, function(err, results) {
    callback(err);
  });
}

// Simulate constant load
run('http://demo.nodetime.com/', 60, 1, function(err) {
  if(err) console.error(err);
})

// Exit if not finished yet
setTimeout(function() {
  process.exit();
}, 65000)