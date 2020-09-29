function movement(){
    let data = {
      x: 0,
      y: 0,
    }
  
    if (keyIsDown(65)) { //A
        data.x -= 1;
      }
  
      if (keyIsDown(68)) { //D
        data.x += 1;
      }
  
      if (keyIsDown(87)) { //W
        data.y -= 1;
      }
  
      if (keyIsDown(83)) { //S
        data.y += 1;
    }

    if(data.x != 0 || data.y != 0){
      socket.emit('move',data);
    }
  }