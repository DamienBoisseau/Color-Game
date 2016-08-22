// Express stuff
var express = require('express');
var app = express();
app.use(express.static('public'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Users storage
var connectedUsers = [];
var nextUserId = 1;
var storeUser = function(usr) {
  connectedUsers.push({userId: nextUserId, userName: usr});
  nextUserId++;
}
var removeUser = function(id) {
  connectedUsers.map(function(element, index, array) {
    if(element.userId == id) {
      array.splice(index, 1);
    }
  });
}

var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client) {

  client.on('join', function(userName) {
    client.userName = userName;
    client.userId = nextUserId;
    storeUser(userName);

    // Show to the new user all the users already connected
    connectedUsers.forEach(function(data){
      if(data.userId != client.userId) {
        client.emit('join', data);
      }
    });

    var data = {
      userName: client.userName,
      userId: client.userId
    }

    // 
    client.broadcast.emit('join', data);

    // Log the new user to the node console
    console.log('Player ' + client.userName + '#' + client.userId + ' connected');
  });

  client.on('disconnect', function() {
    removeUser(client.userId);

    console.log(client.userName + ' has left');
    client.broadcast.emit('leave', client.userId);
  });

  client.on('gameStart', function(colorToGuess) {
    client.broadcast.emit('gameStart', colorToGuess);
  });

  client.on('submitColor', function(data) {
    data.userId = client.userId;
    client.broadcast.emit('submitColor', data);
    console.log(client.userName + ' submitted (' + data.colorInput.r + ',' + data.colorInput.g + ',' + data.colorInput.b + ') - Score : ' + data.score + '%');
  });

});

// Listen on port 3000
server.listen(3000);
console.log('Listening on port 3000');
