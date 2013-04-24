var cluster = require('cluster');

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
}
else {
  require('./server');
}

