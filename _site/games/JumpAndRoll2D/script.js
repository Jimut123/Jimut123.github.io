
var downPressed = false;
var cnv_width = 480;
var cnv_height = 320;
var upPressed = false;
var jump = 0;
var jump_height = 120;
var lock=false;
var time_int = 0;
var building_width = 30;
var building_max_height = 40;
var score=0;
var checker=0;
var main_audio = new Audio('game.mp3');
main_audio.loop = true;
main_audio.play();

// https://freesound.org/people/jalastram/packs/21727/
var jump_Audio = new Audio('jump1.mp3');

var game_over_Audio = new Audio('game_over.mp3')


// https://www.audioblocks.com/royalty-free-audio/game+over?search-origin=filters


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var stck_building = [];
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
//document.addEventListener("mousemove", mouseMoveHandler, false);

function buttonFunction(){
        upPressed = true;
        jump_Audio.play();
        lock = true;
        checker++;
}

function keyDownHandler(e) {
    if(e.key == "Up" || e.key == "ArrowUp") {
        upPressed = true;
        jump_Audio.play();
        lock = true;
        checker++;
        //console.log("UP ARROW PRESSED!",upPressed);
        //console.log(checker);
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        upPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        downPressed = false;
    }
}



var ballRadius=20;
var x = 30+ballRadius;
var y = cnv_height-ballRadius;
var velx = cnv_width;


function gen_rn(num){
    k = parseInt(Math.random()*num);
    return k;
}
 
function generate_random_color(){
    var color_array_hex = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F']
    var i = 5;
    l = '#';
    while(parseInt(i)>=0)
    {
        l = l+color_array_hex[gen_rn(16)];
        i=i-1;
    }
    return l;
}


function drawBall(jump=0) {
  ctx.beginPath();
  ctx.arc(x, y-jump, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = "#42f4c5";
  ctx.fill();
  ctx.closePath();
}

function drawBuildings(building_height,building_col,building_gap){
    ctx.beginPath();
    // (x, y, width, height);
    ctx.fillRect(velx-building_gap, cnv_height-building_height, building_width, building_height)
    ctx.fillStyle = String(building_col);
    ctx.fill();
    ctx.closePath();

}

function showScore(){
    //console.log(score);
    document.getElementById('playerscore').innerHTML = "Player score - "+score;
}

function CollisionDetection(){
    
    if(stck_building.length>0){
        //for (var iter = 0; iter<stck_building.length;iter++)
        //{
        iter = 0;
        col_x = velx-stck_building[iter][2];
        col_y = cnv_height -stck_building[iter][0];
        col_width = building_width;
        col_height = stck_building[iter][0];

        //console.log("x = ",col_x,"y = ",col_y,"width = ",col_width," height = ",col_height);

        ball_x = x;
        ball_y = y-jump;
        ball_rad = ballRadius;
        //console.log(jump)
        //console.log("ball_x = ",ball_x," ball_y = ",ball_y,"ball_rad = ",ball_rad);
        // make the collision detector !!
        //console.log(ball_x-ball_rad,"--",ball_x+ball_rad);
        //console.log("iter = ",iter," --> ",col_x,"--",col_x+col_width);
        if( ( (ball_x-ball_rad)<col_x && col_x<(ball_x+ball_rad))|| ((ball_x-ball_rad)<(col_x+col_width) && (col_x+col_width)<(ball_x+ball_rad) ) ){
            if(ball_y+ball_rad>col_y ){
                    main_audio.pause();
                    game_over_Audio.play();
                    alert("GAME OVER! ");
                    //console.log((ball_x-ball_rad),"--",(ball_x+ball_rad));
                    //console.log("ball_y",ball_y,"col_y",col_y);
                    //console.log("iter = ",iter," --> ",col_x,"--",(col_x+col_width));

                    document.location.reload();
                    game_over_Audio.pause();
            }
            
            else{
                    //console.log("not collided");
            }
        }
           
    }
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //console.log(checker);
    CollisionDetection();
    showScore();
    time_int += 2;
    if(time_int>120)
    {
        
        building_height = gen_rn(building_max_height)+10;        //40 is the max building height
        building_col = "red";//generate_random_color();
        building_gap = 30+gen_rn(80);
        drawBuildings(building_height,building_col,building_gap);
        stck_building.push([building_height,building_col,building_gap]);
        //console.log(stck_building);
        time_int=0;
        if (velx-stck_building[0][2]<0)
        {
            stck_building.shift();
            score++;
        }
        
    }
    //console.log(stck_building)
    
    if(stck_building.length>0){
        for (var iter = 0; iter<stck_building.length;iter++)
        {
            //console.log(stck_building[iter][0]+"  "+stck_building[iter][1])
            drawBuildings(stck_building[iter][0],stck_building[iter][1],stck_building[iter][2]);
            //console.log(typeof(stck_building[iter][1]));
            //console.log(stck_building[iter][1].length);
            stck_building[iter][2] = stck_building[iter][2]+3;
        }
        
        //console.log(stck_building);
    }
    

    requestAnimationFrame(draw);
    if (upPressed == true){
        //CollisionDetection();
        if (jump<=jump_height && lock==true && checker<=2){
            jump = jump+5;
            if(jump>=jump_height)
            {   
                lock=false;
            }
        }
        else if(jump >= 0 && lock == false && checker<=2){
            
            jump=jump-5;
            if(jump<=0)
            {
                jump=0;
                checker=0;
                //console.log(checker);
            }

        } 
        else if(checker>2)
        {
            jump=jump-5;
            if(jump<=0)
            {
                jump=0;
                checker=0;
                //console.log(checker);
            }
        }
        drawBall(jump);
    }
    else{
        drawBall();
    }
}

draw();

