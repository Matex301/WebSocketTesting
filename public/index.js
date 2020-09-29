let _global = [];
let canvas;
let socket;

function preload(){
  socket = io.connect();//Connect to server
  socket.on('players_position', renderPlayers);//Set a player posision reciver handler
  socket.on('disconnect', disconnect);

  let login_div = document.getElementById('loginDiv');
  let login_input = document.getElementById('login-input');
  let login_button = document.getElementById('login-button');
  let error_taken = document.getElementById('error-taken');

  login_button.onclick = function(){
    socket.emit('login_try',{login:login_input.value});
  }
  socket.on('login_recive',function(data){
    if(data.success){
      login_div.style.display = 'none';
      canvas.style('display','block');
      loop();
    }else{
      error_taken.style.display = 'block';
    }
  });
}

function setup() {
  canvas = createCanvas(1600, 900);
  canvas.style('display', 'none');
  noLoop();
}

function draw() {
  movement();
  console.log("draw");
}

function renderPlayers(data){
  clear();
  if(data.lenght != 0){
    data.forEach(obj =>{
        fill(255);
        rect(obj.x,obj.y,100,100);
    });
  }
}

function disconnect(){
  location.reload();
}

let positionRefresher = setInterval(function(){
  socket.emit('pos_req');
},1000/30);