"use strict";
let express = require('express');//Load Express library
let socket = require('socket.io');//Load Socket.io library
let session = require('express-session');//Lead Express-session library

let app = express();//Uses Express
app.use(session({
    secret: 'GodIsDead',
    resave: true,
    saveUninitialized: false,
}));
let server = app.listen(2000); //Starts server on port 2000
app.use(express.static('public')); //Allows users to use public folder

app.get('/',(req,res) =>{ //When accessing site redirect to /public/index.html
    res.sendFile(__dirname + '/public/index.html');
});

console.log("Server Started");

let _global_player = [];
let _global_rooms = [];

let io = socket(server);
io.on('connection', function(client){
    client.on('login_try', loginCheck);
});

function loginCheck(data){
    let legal = true;
    _global_player.forEach(obj =>{
        if(obj.login == data.login){
            legal = false;
        }
    })
    if(legal){
        this.player = new playerInstance(this,data.login);
        this.emit('login_recive',{success:true});
        this.removeListener('login_try',loginCheck);
    }else{
        this.emit('login_recive',{success:false});
    }
}

function checkForFreeRooms(){
    let freeRoooms = [];
    _global_rooms.forEach(obj =>{
        if(obj.maxPlayers == false){
            freeRoooms.push(obj);
        }else if(obj.maxPlayers > obj.players.length){
            freeRoooms.push(obj);
        }
    });

    if(freeRoooms.length == 0){
        return 0;
    }else{
        return freeRoooms;
    }
}

class roomInstance{
    constructor(){
        this.players = [];
        this.maxPlayers = 10;
        _global_rooms.push(this);
    }

    addPlayer(player){
        if(this.checkForPlayer(player) == false){
            this.players.push(player);
            player.activeRoom = this;
        }
    }

    checkForPlayer(player){
        let is = false;
        this.players.forEach(obj =>{
            if(obj == player){is=true;}
        });
        return is;
    }

    removePlayer(playerToRemove){
        if(this.checkForPlayer(playerToRemove) == true){
            this.players.splice(this.players.indexOf(playerToRemove),1);
            playerToRemove.activeRoom = false;

            if(this.players.length == 0){
                this.removeRoom();
            }
        }
    }

    removeRoom(){
        if(this.players.length != 0){
            this.players.forEach(obj =>{
                obj.activeRoom = false;
            });
        }

        _global_rooms.splice(_global_rooms.indexOf(this),1);
    }

    broadcast(name,data){
        this.players.forEach(obj =>{
            obj.socket.emit(name,data);
        });
    }
}

class playerInstance{
    constructor(socket,login){
        this.socket = socket;
        _global_player.push(this);
        this.login = login;
        this.position = {
            x: 0,
            y: 0,
        }
        this.activeRoom = false;
        this.speed = 5;

        this.startUp();
    }

    startUp(){

        let roomjoin = checkForFreeRooms();
        if(roomjoin == 0){
            let newroom = new roomInstance();
            newroom.addPlayer(this);
        }else{
            roomjoin[0].addPlayer(this);
        }

        this.socket.on('move', this.reciveMoveUpdate);
        this.socket.on('disconnect', this.disconnect);
        this.socket.on('pos_req',this.sendPositions);
    }

    //This in Socket On Function referse to the Socket, so you need point to this.player

    sendPositions(){
        let sendPosition = [];
        this.player.activeRoom.players.forEach(obj => {
            sendPosition.push(obj.position);
        });
        sendPosition.push(this.player.position);//Send a additional time self position to render on top
        this.emit('players_position', sendPosition);
    }

    reciveMoveUpdate(data){
        if(data.x == 1){
            this.player.position.x += this.player.speed;
        }else if(data.x == -1){
            this.player.position.x -= this.player.speed;
        }
    
        if(data.y == 1){
            this.player.position.y += this.player.speed;
        }else if(data.y == -1){
            this.player.position.y -= this.player.speed;
        }
    }

    disconnect(){
        if(this.player.activeRoom != false){
            this.player.activeRoom.removePlayer(this.player);
        }
        _global_player.splice(_global_player.indexOf(this.player),1);
    }
}

setInterval(function(){
    console.clear();
    _global_player.forEach(obj =>{
        console.log("Login: " + obj.login + " ID: " + obj.socket.id + " X: " + obj.position.x + " Y: " + obj.position.y);
    });

    console.log(_global_rooms);
},50);