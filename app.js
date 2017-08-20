const express = require('express');
const { execSync, spawn } = require('child_process')
const app = require('express')();
const http = require('http').Server(app);

let recommendation;

const pythonFilePath = execSync('which python', {encoding: 'utf8'});
if (pythonFilePath.indexOf('gl-env') === -1) {
  console.error('Please be sure that `gl-env` python environment is set:');
  console.log(' > source activate gl-env');
  process.exit(1);
}


// https://stackoverflow.com/questions/10775351/combining-node-js-and-python
function initPython() {
  let recommendationsInitialized = false;
  execSync('python create_recommendation_model.py', {encoding: 'utf8'})

  recommendation = spawn('python', ['get_recommendation.py'], {encoding: 'utf8', stdio: 'pipe'});

  // For some reason we have to read from stderr
  recommendation.stderr.on('data', (data) => {
    if (data == 'started\n') {
      recommendationsInitialized = true;
    } else if (recommendationsInitialized) {
      sendRecommendations(data.toString())
    }
  });
  
  recommendation.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

initPython();

/*
** TODO:
** Add Socket.io
** Continuously run python file
**  - Pipe in data from socket.io
*/
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

const Server = require('socket.io');
const io = new Server(http);

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('get-recommendations', function(itemId) {
    recommendation.stdin.write(`${itemId}||${socket.id}\n`);
  });
});

function sendRecommendations(data) {
  const response = data.split('||');

  const socketId = response[0];
  const recommendations = response[1];

  io.sockets.connected[socketId].emit('recommendation', JSON.parse(recommendations));
}

  
