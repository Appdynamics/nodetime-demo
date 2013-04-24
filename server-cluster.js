var cluster = require('cluster');
var loadTest = require('./load-test.js')

if(cluster.isMaster) {
  for (var i = 0; i < 2; i++) {
      console.log('forking a worker');
      cluster.fork();
  }

  cluster.on('online', function(worker) {
      console.log('worker ' + worker.process.pid + ' online');
  });

  cluster.on('exit', function(worker, code, signal) {
      console.log('worker ' + worker.process.pid + ' died');
      console.log('forking a new worker');
      cluster.fork();
  });

  setInterval(function() {
    console.log('test start');
    loadTest.run('http://demo.nodetime.com/', 60, 0.5, function(err) {
      if(err) console.error(err);
    
      console.log('test done');
    });
  }, 60000);
}
else {
  require('./server');
}

