/* Nodetime */
require('nodetime').profile({debug: true});

var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

process.on('uncaughtException', function (err) {
  console.error(err, err.stack)
});

var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);


app.set('views', __dirname);
app.set('view options', {layout: false});

app.get('/', function(req, res){
  res.render('server-sio.ejs');
});



io.sockets.on('connection', function (socket) {
  socket.on('ping', function(data) {
    var client = new Db('test', new Server("127.0.0.1", 27017, {}));
    client.open(function(err) {
      client.collection('test_col', function(err, collection) {
        collection.insert({test: 123}, {safe: true}, function(err, docs) {
          collection.count({test: 123}, function(err, count) {
            socket.emit("pong", count);
          });
        });
      });
    });
  });
});

app.listen(3000);

console.log('socket.io app started');
