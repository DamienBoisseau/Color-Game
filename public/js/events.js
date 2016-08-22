var socket = io();

socket.on('join', function(data) {
  addPlayer(data.userName, data.userId);
});

socket.on('leave', function(userId) {
  removePlayer(userId);
});

socket.on('gameStart', function(colorToGuess) {
  gameStart(colorToGuess);
});

socket.on('submitColor', function(data) {
  submitColor(data.userId, data.colorInput);
});
