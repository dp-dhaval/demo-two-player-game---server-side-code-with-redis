
//#region const - load library
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const redis = require('redis');
const redisURL = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURL);
const util = require('util');
client.hget = util.promisify(client.hget);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
//#endregion

//#region simple variable
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//#endregion

//#region  static public path

app.use(express.static(publicPath));

//#endregion

//#region connection
io.on('connection', (socket) => {
    
    //#region variable
    var currentSocket = null;
    var key = null;

    //#endregion

    //#region join room
    socket.on('join',async (params,callback) => {

        currentSocket = socket.id;

        key = params.room || ' ';

        const isRoom = await client.hget("userConnected",key);
        
        if(isRoom){

            const room = JSON.parse(isRoom);

            if(room.userCount < 2){

                socket.join(params.room);

                room.userCount +=1;

                console.log(`${params.name} joined`);

                room.users.push(params.name);
                
                await client.hset("userConnected",key,JSON.stringify(room));

                await client.hset("userRoom",currentSocket,JSON.stringify({user:params.name,room:params.room}));

                if(room.userCount === 2){

                    io.in(params.room).emit('startGame', `The Game Started`);

                }

            }else{
                callback("Room Full Please join another room.");
            }

        }else{

            const data = {
                userCount:0,
                users:[]
            };

            socket.join(params.room);

            data.userCount +=1;

            data.users.push(params.name);

            console.log(`${params.name} joined`);

            await client.hset("userConnected",key,JSON.stringify(data));

            await client.hset("userRoom",currentSocket,JSON.stringify({user:params.name,room:params.room}));
            
        }
        callback();
    });

    //#endregion

    //#region disconnect User
    socket.on('disconnect', async function(){

        socket.leave(currentSocket);

        var currentRoom = await client.hget("userRoom",currentSocket);

        if(currentRoom){

            currentRoom = JSON.parse(currentRoom);

            console.log(`${currentRoom.user} leaved.`);

            var room = await client.hget("userConnected",currentRoom.room || '');

            room = JSON.parse(room);

            room.userCount -=1;

            var users = room.users;
            
            users.splice(users.indexOf(currentRoom.user),1);
            
            await client.hset("userConnected",currentRoom.room,JSON.stringify(room));
            
            if(room.userCount === 0){
                client.DEL(currentRoom.room);
            }
        }

    });
    //#endregion
});

//#endregion

//#region disconnect
io.on('disconnect', (socket) => {
    console.log('user disconnected.');
});

//#endregion

//#region listen server
server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});

//#endregion