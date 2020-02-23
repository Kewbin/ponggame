// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/ZjVyKXp9hec

// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

var players = [];
var ball;
var score = 0;
var e_score = 0;

function Ball(x, y, dx, dy, speed) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.speed = speed;
}

function Player(id, x, name) {
  this.id = id;
  this.x = x;
  this.name = name;
}

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 33);

function heartbeat() {
  io.sockets.emit('heartbeat', players);
}

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function (socket) {
    console.log('We have a new client: ' + socket.id);

    socket.on('start', function (data) {
      //console.log(socket.id + ' ' + data);
      var player = new Player(socket.id, data.x, data.name);
      players.push(player);
      socket.emit('playernum', players.length);
      if (players.length == 2) {
        io.sockets.emit('gamestart', players);
        ball = new Ball(125, 200, 1, 1, 1);
        io.sockets.emit('updatedball', ball);
      }
    });

    socket.on('update', function (data) {
      //console.log(socket.id + " " + data);
      var player;
      for (var i = 0; i < players.length; i++) {
        if (socket.id == players[i].id) {
          players[i].x = data;
        }
      }
      //player.x = data;
    });

    socket.on('updatescore', function (data) {
      score = data[0];
      e_score = data[1];
      //console.log(score + ' ' + e_score);

      scores = [score, e_score];
      io.sockets.emit('scoreupd', scores);
    });

    socket.on('updateball', function (data) {
      ball.x = data.x;
      ball.y = data.y;
      ball.dx = data.dx;
      ball.dy = data.dy;
      ball.speed = data.speed;

      io.sockets.emit('updatedball', ball);
    });

    socket.on('disconnect', function () {
      console.log(socket.id + ' disconnected');
      for (i = 0; i < players.length; i++) {
        if (players[i].id == socket.id) {
          players.splice(i, 1);
        }
      }
      if (players.length != 0) {
        ball.x = 125;
        ball.y = 200;
        ball.dx = 0;
        ball.dy = 0;
        ball.speed = 1;
        io.sockets.emit('updatedball', ball);
        io.sockets.emit('playernum', players.length);
        score = 0;
        e_score = 0;

        scores = [score, e_score];
        io.sockets.emit('scoreupd', scores);
        io.sockets.emit('waiting');
      }
    });
  }
);
