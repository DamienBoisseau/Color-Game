// Initializations
var colorToGuess = {r: 0, g: 0, b: 0};
var colorInput = {r: 0, g: 0, b: 0};
var colorDistance = 0;
var colorMaxDistance = 0;
var score = 0;
var showDebug = false;
var randomButton = $('#random');
var submitButton = $('#submit');
var debug = $('.debug');

// Generate a random color (RGB)
function gameStart(color) {

  // Get color values
  if(typeof color === 'undefined') {
    colorToGuess.r = Math.ceil((Math.random() * 255));
    colorToGuess.g = Math.ceil((Math.random() * 255));
    colorToGuess.b = Math.ceil((Math.random() * 255));
  }
  else {
    colorToGuess = color;
  }

  // Set background color with the new color
  $('body').css('background-color', setColor(colorToGuess));

  showButton(false);

}

// Get the inputted color and display it in the preview
function updateSelfPreviewColor() {

  // Get color values
  colorInput.r = $('#red-value').val();
  colorInput.g = $('#green-value').val();
  colorInput.b = $('#blue-value').val();

  // Display color values
  $('.red > .value').text(colorInput.r);
  $('.green > .value').text(colorInput.g);
  $('.blue > .value').text(colorInput.b);

  // Set preview background with the new color
  $('#self').find('.preview').css('background-color', setColor(colorInput));

}

// Helper function to set rgb() css value
function setColor(color) {

  return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";

}

// Calculate the absolute distance of the inputted color with the color to guess
function getDistance(color) {

  var distance = {
    r: Math.abs(color.r - colorToGuess.r),
    g: Math.abs(color.g - colorToGuess.g),
    b: Math.abs(color.b - colorToGuess.b)
  };

  return (distance.r + distance.g + distance.b);

}

// Get the max distance between the edges of the input range and the inputed values
function getMaxDistance(color) {

  var maxDistance = {
    r: (colorToGuess.r < 127) ? 255 : 0,
    g: (colorToGuess.g < 127) ? 255 : 0,
    b: (colorToGuess.b < 127) ? 255 : 0
  }

  return getDistance(maxDistance);

}

// Submit the color and show the score (%)
function submitColor(userId, color) {

  colorDistance = getDistance(color);
  colorMaxDistance = getMaxDistance(colorToGuess);
  score = (100 * (1 - (colorDistance / colorMaxDistance))).toFixed(2);

  $('#' + userId).find('.score').text(score + ' %');

}

// Enable or disable debug
function enableDebug() {

  if(showDebug === true) {
    debug.show();
  }
  else {
    debug.hide();
  }

}

// Update debug values
function updateDebug() {
  
  $('.debugGuess').text(setColor(colorToGuess));
  $('.debugInput').text(setColor(colorInput));
  $('.debugDistance').text(colorDistance);
  $('.debugMaxDistance').text(colorMaxDistance);
  $('.debugScore').text(score + ' %');
  
}

// Hide/Show Start button
function showButton(show) {
  if(show === true) {
    randomButton.show();
    submitButton.hide();
  }
  else {
    randomButton.hide();
    submitButton.show();
  }
}

// jQuery events
$(function() {

  // Debug
  enableDebug();

  // Random color
  showButton(true);

  // Random color
  $('#random').click(function() {
    gameStart();
    socket.emit('gameStart', colorToGuess);
    updateDebug();
  });
  
  // Update preview color when range changes
  $('.range').on('input change', function() {
    updateSelfPreviewColor();
    updateDebug();
  });
  
  // Submit the inputted color
  $('#submit').click(function() {
    submitColor('self', colorInput);
    updateDebug();
    showButton(true);
    socket.emit('submitColor', {colorInput, score});
  });

  // Ask user's name
  var username;
  while(!username) {
    username = window.prompt('Enter your name');
  }
  $('#self > .username').text(username);
  socket.emit('join', username);

});

function addPlayer(userName, userId) {

  var html = '<div class="block" id="' + userId + '">' + 
             '<div class="username">' + userName + '</div>' +
             '<div class="preview"></div>' +
             '<div class="score"></div>' +
             '</div> ';

  $('.row').append(html);
  
}

function removePlayer(userId) {

  $('#' + userId).remove();
  
}
