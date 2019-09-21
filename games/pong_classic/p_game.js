//for documanetation -> https://thoughtbot.com/blog/pong-clone-in-javascript
var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 600;
var height = 400;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

var step = function() {
  update();
  render();
  animate(step);
};

var render = function() {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
}

Paddle.prototype.render = function() {
  context.fillStyle = "#FFFFFF";
  context.fillRect(this.x, this.y, this.width, this.height);
};
function Player() {
   this.paddle = new Paddle(580, 175, 10, 50);
}
function Computer() {
  this.paddle = new Paddle(10, 175, 10, 50);
}
Player.prototype.render = function() {
  this.paddle.render();
};
Computer.prototype.render = function() {
  this.paddle.render();
};
function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 3;
  this.y_speed = 0
  this.radius = 5;
  this.score_ai = 0;
  this.score_player=0;
}
Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#FFFFFF";
  context.fill();
};
var player = new Player();
var computer = new Computer();
var ball = new Ball(300, 200);
var ai = new AI();

Ball.prototype.update = function(paddle1, paddle2) {
  this.x += this.x_speed;
  this.y += this.y_speed;
  var top_x = this.x - 5;
  var top_y = this.y - 5;
  var bottom_x = this.x + 5;
  var bottom_y = this.y + 5;
  if(this.y - 5 < 0) { // hitting the top wall
    this.y = 5;
    this.y_speed = -this.y_speed;
  } else if(this.y + 5 > 400) { // hitting the bottom wall
    this.y = 395;
    this.y_speed = -this.y_speed;
  }

  if(this.x < 0) { // a point was scored by the player
    this.x_speed = 3;
    this.y_speed = 0;
    this.x = 300;
    this.y = 200;
    this.score_player=this.score_player+1;
    document.getElementById('playerscore').innerHTML = "Player score - "+this.score_player;
    ai.new_turn();
  }
  if(this.x > 600) { // a point was scored by the ai
    this.x_speed = 3;
    this.y_speed = 0;
    this.x = 300;
    this.y = 200;
    this.score_ai=this.score_ai+1;
    document.getElementById('aiscore').innerHTML = "AI1 score - "+this.score_ai;
    ai.new_turn();
  }
  this.player_strikes = false;
  this.ai_strikes = false;
  if(top_x > 300) {
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
      // hit the player's paddle
      this.x_speed = -3;
      this.y_speed += (paddle1.y_speed / 2);
      this.x += this.x_speed;
      this.player_strikes = true;
      //console.log('player strikes');
    }
  } else {
    if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
      // hit the computer's paddle
      this.x_speed = 3;
      this.y_speed += (paddle2.y_speed / 2);
      this.x += this.x_speed;
      this.ai_strikes = true;
      //log('ai strikes');
    }
  }
};

var keysDown = {};
window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
  //console.log(keysDown);
  //test
});
window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
  //console.log(keysDown);
});

var update = function() {
  player.update();
  computer.update(ball);
  ball.update(player.paddle, computer.paddle);
  ai.save_data(player.paddle, computer.paddle, ball);
};
Player.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 38) { // up arrow
      this.paddle.move(0, -4);
    } else if (value == 40) { // down arrow
      this.paddle.move(0, 4);
    } else {
      this.paddle.move(0, 0);
    }
  }
};
Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.y < 0) { //if paddle goes all the way to the top
    this.y = 0;
    this.y_speed = 0;
  } else if (this.y + this.height > 400) { //if paadle goes all the way to the bottom
    this.y = 400 - this.height;
    this.y_speed = 0;
  }
}
Computer.prototype.update = function(ball) {
  var y_pos = ball.y;
  
  var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
  if(diff < 0 && diff < -4) { // max speed top
    diff = -5;
  } else if(diff > 0 && diff > 4) { // max speed bottom
    diff = 5;
  }
  this.paddle.move(0, diff);
  if(this.paddle.y < 0) {
    this.paddle.y = 0;
  } else if (this.paddle.y + this.paddle.height > 400) {
    this.paddle.y = 400 - this.paddle.height;
  }
};
//saves data
// stores data for ai.
function AI(){
    this.previous_data = null;                  // data from previous frame
    this.training_data = [[], [], []];          // empty training dataset
    this.training_batch_data = [[], [], []];    // empty batch (dataset to be added to training data)
    this.previous_xs = null;                    // input data from previus frame
    this.turn = 0;                              // number of turn
    this.grab_data = true;                      // enables/disables data grabbing
    this.flip_table = true;                     // flips table
    this.keep_trainig_records = true;           // keep some number of training records instead of discardin them each session
    this.training_records_to_keep = 4000;     // number of training records to keep
    this.first_strike = true;
}
// saves data from current frame of a game
AI.prototype.save_data = function(player, computer, ball){

    // return if grabbing is disabled
    if(!this.grab_data)
        return;

    // fresh turn, just fill initial data in
    if(this.previous_data == null){
        this.previous_data = [player.y, computer.y, ball.x, ball.y];
        return;
    }

    // if ai strikes, start recording data - empty batch
    if(ball.ai_strikes){
        this.training_batch_data = [[], [], []];
        //console.log('emtying batch')
    }
    //console.log('previous data');
    //console.log(this.previous_data);
    // create current data object [player_x, computer_x, ball_x, ball_y]
    // and embedding index (0 - up, 1 - no move, 2 - down)
    data_ys = [player.y, computer.y, ball.x, ball.y];
    index = (player.y < this.previous_data[0])?0:((player.y == this.previous_data[0])?1:2);
    //console.log('data ys');
    //console.log(data_ys);
    //console.log('index');
    //console.log(index);
    // save data as [...previous data, ...current data]
    // result - [old_player_x, old_computer_x, old_ball_x, old_ball_y, player_x, computer_x, ball_x, ball_y]
    this.previous_ys = [...this.previous_data, ...data_ys];
    // add data to training set depending on index value (depending if that data relates to the move to the left, no move or move to the right)
    // only player and ball position
    //console.log('previous_ys');
    //console.log(this.previous_ys);
    this.training_batch_data[index].push([this.previous_ys[1], this.previous_ys[2], this.previous_ys[3], this.previous_ys[5], this.previous_ys[6], this.previous_ys[7]]);
    // set current data as previous data for next frame
    this.previous_data = data_ys;
    //console.log('training_batch_data');
    //console.log(this.training_batch_data);
    
    // if player strikes, add batch to training data
    if(ball.player_strikes){
        if(this.first_strike){
            this.first_strike = false;
            this.training_batch_data = [[], [], []];
            //console.log('emptying batch');
        }else{
            for(i = 0; i < 3; i++)
                this.training_data[i].push(...this.training_batch_data[i]);
            //console.log('training_data');
            //console.log(this.training_data);
            this.training_batch_data = [[], [], []];
            //console.log('adding batch');
        }
    }
}

AI.prototype.new_turn=function(){
  console.log('lost');
  this.turn =this.turn +1;
  console.log(this.turn);
  if(this.turn > 9){
    this.write_file();
  }
}
AI.prototype.write_file=function(){
  console.log('called');
  //console.log(this.training_data);
  // trim data and find minimum number of training records in data for all 3 embeddings
  if(this.keep_trainig_records){
    for(i = 0; i < 3; i++){
      if(this.training_data[i].length > this.training_records_to_keep)
        this.training_data[i] = this.training_data[i].slice(
                    Math.max(0, this.training_data[i].length - this.training_records_to_keep),
                    this.training_data[i].length
                );
        }
      }
  len = Math.min(this.training_data[0].length, this.training_data[1].length, this.training_data[2].length);

  document.getElementById('end-game').innerHTML = 'Game ending in : '+len+'/'+this.training_records_to_keep;

    //console.log(this.training_data);
    // if it equals zero - we don't have any data to train model on
    if(!len){
        console.log('no data to train on');
        return;
    }

    data_xs = [];
    data_ys = [];
    
    if(len < this.training_records_to_keep){
        this.turn = 0;
        console.log(len);
        
        return;
      }

    // now we need to trim data so every embedding will contain exactly the same amount of training records
    // then randomize that data
    // and create embedding records one embedding record for every input data record
    // finally add training data records and embedding records to common tables (for training)
    // tf.fit() will do final data shuffle for us
    for(i = 0; i < 3; i++){
        data_xs.push(...this.training_data[i].slice(0, len)
            .sort(()=>Math.random()-0.5).sort(()=>Math.random()-0.5));      // trims training data to 'len' length and shuffle it
        data_ys.push(...Array(len).fill([i==0?1:0, i==1?1:0, i==2?1:0]));   // creates 'len' number records of embedding data
        //[1,0,0]=for [0](up)
        //[0,1,0]=for [1](no change)
        //[0,0,1]=for [0](down)
      }
      console.log(len);
      console.log('reached');
      console.log(data_xs);
      console.log(data_ys);
      var a = document.getElementById("a");
      var file = new Blob([JSON.stringify({xs: data_xs, ys: data_ys})], {type: 'application/json'});
      a.href = URL.createObjectURL(file);
      a.download = 'training_data.json';
      a.click();
      context=null;
}
