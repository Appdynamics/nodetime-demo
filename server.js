// nodetime agent initialization
var nodetime = require('nodetime');
nodetime.profile({
  accountKey: '8dac6f222f8ed7a18b974964630fd8e734b00744',
  appName: 'Nodetime Demo',
  features: {
    hostMetrics: true
  }
});



var http = require('http');
var redis = require('redis');
var express = require('express');
var mongodb = require('mongodb');


var Db = mongodb.Db;
var Server = mongodb.Server;

// Create Redis client
var redisClient = redis.createClient();

// Create MongoDB client. Uses authentication to get access to server status metrics
var mongoDb;
var db = mongodb.connect('mongodb://localhost:27017/demo', function(err, db) {
  if(err) return console.error(err);

  db.admin().authenticate('adminuser', 'adminpass', function(err) {
    db.authenticate('demouser', 'demopass', function(err) {
      if(err) return console.error(err);

      mongoDb = db;
    });
  });
});

// Initialize Express and Socket.io
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.set('view engine', 'ejs');
app.set('view options', {layout: false});
app.set('views', __dirname + '/views');
app.use(app.router);
app.use(nodetime.expressErrorHandler()); //optional. Error handler to catch errors from middleware chain
app.use(express.errorHandler());


// The request handler
app.get('/', function(req, res) {
  redisClient.zinterstore("zset3", 2, "zset1", "zset2", function(err, ret) {
    if(err) console.error(err);

    mongoDb.collection('demo_collection', function(err, collection) {
      if(err) return console.error(err);

      var randomId = Math.round(Math.random() * 100);
      collection.insert({random_id: randomId}, {safe: true}, function(err) {
        if(err) return console.error(err);

        collection.count({random_id: randomId}, function(err, count) {
          if(err) return console.error(err);

          // sending a custom metric to Nodetime, see http://docs.nodetime.com/#agent-api
          nodetime.metric('Custom Metrics', 'Sample metric', 1, null, 'inc');

          // simulating CPU load
          slow();

          res.render('index');
        });
      });
    });
  });
});


// Socket.io configuration
io.configure(function() {
  io.set('log level', 1);

  var RedisStore = require('socket.io/lib/stores/redis');
  io.set('store', new RedisStore({
    redisPub:redis.createClient(), 
    redisSub:redis.createClient(), 
    redisClient:redis.createClient()
  }));
});

io.sockets.on('connection', function (socket) {
  socket.on('ping', function(data) {
    // tell agent to start tracing a transaction, see http://docs.nodetime.com/#agent-api
    var time = nodetime.time('Socket.io Events', 'ping');

    redisClient.incr("socketio_ping", function(err) {
      if(err) return console.error(err);

      socket.emit("pong", 'pong-payload');

      // tell agent to stop tracing
      time.end();
    });
  });
});

// Start the app
server.listen(3000);
console.log('listening on 3000');



// Slow functions, simulating CPU load
function slow3(count) {
  if(count < 10000) {
    slow3(count + 1)
  }
  
  var b = 3 + 4;
}

function slow2() {
  var a = 1 + 2;
}

function slow() {
  slow3(0);

  for(var i = 0; i < 100000000; i++) {
    slow2();
  }
}

// Leaking function, simulating memory leak
var exampleLeak1 = {exampleLeak2: []};
var exampleLeak3 = {exampleLeak4: "aa"};

for(var i = 0; i < 30000; i++) {
  exampleLeak1.exampleLeak2[i] = {exampleLeak5: "long text " + i};
  exampleLeak3.exampleLeak4 += "long text " + i;
}


