const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));
var rooms = [];
var roomClient = {};

io.on('connection', (socket) => {
    console.log('New user connected');
    socket.on('join',async (params,callback) => {
        
    Object.keys(io.sockets.adapter.rooms[params.room].sockets).length;
        if(rooms.indexOf(params.room) === -1){
            rooms.push(params.room);
            roomClient[params.room] = 0;
            console.log("Room Created");
        }
        if(rooms.indexOf(params.room) !== -1 && roomClient[params.room] <2){
            socket.join(params.room);
            roomClient[params.room] += 1;
            if(roomClient[params.room] === 2)
                io.in(params.room).emit('startGame', 'the game will start soon');
        }
        callback();
   
    });
    socket.on('disconnect',function(){
		console.log("User disconnected!") ;
	});
});

io.on('disconnect', (socket) => {
    console.log('user disconnected.');
});

server.listen(port, () => {
    console.log(`Server is up on ${port}`);
  });