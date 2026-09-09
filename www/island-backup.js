<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Island Panic</title>

<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#07101a}
body{font-family:Arial,sans-serif;touch-action:none}
canvas{position:fixed;inset:0;width:100%;height:100%}

#hud{
 position:fixed;top:0;left:0;right:0;
 height:70px;padding:14px 16px;
 display:flex;justify-content:space-between;
 align-items:center;color:white;z-index:5;
 pointer-events:none
}
.title{font-size:18px;font-weight:900;letter-spacing:1px}
#timer{font-size:28px;font-weight:900}

#scores{
 position:fixed;top:68px;left:0;right:0;
 display:flex;justify-content:center;gap:7px;
 z-index:5;pointer-events:none
}
.score{
 padding:6px 10px;border-radius:10px;
 background:#101a28dd;color:white;
 font-size:12px;font-weight:800
}

#controls{
 position:fixed;bottom:16px;left:0;right:0;
 display:flex;justify-content:space-around;
 z-index:10;padding:0 10px
}
.pad{
 width:72px;height:62px;border-radius:18px;
 background:#142033dd;border:2px solid;
 color:white;font-weight:900;
 display:flex;align-items:center;
 justify-content:center;
 user-select:none
}
.pad:active{transform:scale(.9)}

#overlay{
 position:fixed;inset:0;
 display:flex;align-items:center;
 justify-content:center;
 flex-direction:column;
 background:#050a12d9;
 backdrop-filter:blur(8px);
 color:white;z-index:20;text-align:center
}
#overlay h1{font-size:38px;margin-bottom:8px}
#overlay p{color:#aeb9c9;margin-bottom:22px}
#start{
 border:0;border-radius:15px;
 padding:14px 28px;
 background:white;color:#08101a;
 font-weight:900;font-size:16px
}
.hidden{display:none!important}
</style>
</head>

<body>

<canvas id="game"></canvas>

<div id="hud">
 <div class="title">🏝️ ISLAND PANIC</div>
 <div id="timer">20</div>
</div>

<div id="scores"></div>
<div id="controls"></div>

<div id="overlay">
 <h1>🏝️ ISLAND PANIC</h1>
 <p>Stay on the island!</p>
 <button id="start">START GAME</button>
</div>

<script>
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const timerEl=document.getElementById("timer");
const scoresEl=document.getElementById("scores");
const controlsEl=document.getElementById("controls");
const overlay=document.getElementById("overlay");
const startBtn=document.getElementById("start");

let W,H,dpr;
let running=false;
let timeLeft=20;
let last=0;
let destroyTimer=0;

const COLS=7;
const ROWS=8;
const SIZE=46;

const colors=[
 "#35a7ff",
 "#ff4964",
 "#55e56d",
 "#ffd447"
];

let tiles=[];
let players=[];
let keys={};

function resize(){
 dpr=devicePixelRatio||1;
 W=innerWidth;
 H=innerHeight;

 canvas.width=W*dpr;
 canvas.height=H*dpr;
 canvas.style.width=W+"px";
 canvas.style.height=H+"px";

 ctx.setTransform(dpr,0,0,dpr,0,0);
}

addEventListener("resize",resize);
resize();

function makeIsland(){

 tiles=[];

 const sx=(W-COLS*SIZE)/2;
 const sy=Math.max(125,(H-ROWS*SIZE)/2-15);

 for(let y=0;y<ROWS;y++){
  for(let x=0;x<COLS;x++){
   tiles.push({
    x:sx+x*SIZE,
    y:sy+y*SIZE,
    alive:true,
    warning:false,
    warningTime:0
   });
  }
 }
}

function makePlayers(){

 players=[];

 const spots=[
  [1,1],[5,1],[1,6],[5,6]
 ];

 for(let i=0;i<2;i++){

  const s=spots[i];
  const t=tiles[s[1]*COLS+s[0]];

  players.push({
   id:i,
   x:t.x+SIZE/2,
   y:t.y+SIZE/2,
   vx:0,
   vy:0,
   color:colors[i],
   alive:true,
   score:0
  });
 }
}

function makeControls(){

 controlsEl.innerHTML="";

 players.forEach((p,i)=>{

  const b=document.createElement("div");
  b.className="pad";
  b.style.borderColor=p.color;
  b.textContent="P"+(i+1);

  b.addEventListener("pointerdown",e=>{
   e.preventDefault();

   if(!p.alive)return;

   p.vx+=(W/2-p.x)*.8;
   p.vy+=(H/2-p.y)*.8;
  });

  controlsEl.appendChild(b);
 });
}

addEventListener("keydown",e=>{
 keys[e.key.toLowerCase()]=true;
});

addEventListener("keyup",e=>{
 keys[e.key.toLowerCase()]=false;
});

function movePlayer(p){

 let x=0,y=0;

 if(p.id===0){
  if(keys.a)x--;
  if(keys.d)x++;
  if(keys.w)y--;
  if(keys.s)y++;
 }

 if(p.id===1){
  if(keys.arrowleft)x--;
  if(keys.arrowright)x++;
  if(keys.arrowup)y--;
  if(keys.arrowdown)y++;
 }

 const speed=170;

 p.vx+=x*speed;
 p.vy+=y*speed;
}

function onTile(p){

 for(const t of tiles){

  if(!t.alive)continue;

  if(
   p.x>t.x &&
   p.x<t.x+SIZE &&
   p.y>t.y &&
   p.y<t.y+SIZE
  )return true;
 }

 return false;
}

function destroyRandomTile(){

 const available=tiles.filter(
  t=>t.alive&&!t.warning
 );

 if(available.length<=12)return;

 const t=available[
  Math.floor(Math.random()*available.length)
 ];

 t.warning=true;
 t.warningTime=.65;
}

function update(dt){

 if(!running)return;

 timeLeft-=dt;
 timerEl.textContent=Math.max(0,Math.ceil(timeLeft));

 destroyTimer-=dt;

 if(destroyTimer<=0){
  destroyRandomTile();
  destroyTimer=Math.max(.45,.85-timeLeft*.01);
 }

 for(const t of tiles){

  if(t.warning){
   t.warningTime-=dt;

   if(t.warningTime<=0){
    t.warning=false;
    t.alive=false;
   }
  }
 }

 for(const p of players){

  if(!p.alive)continue;

  movePlayer(p);

  p.x+=p.vx*dt;
  p.y+=p.vy*dt;

  p.vx*=.82;
  p.vy*=.82;

  p.x=Math.max(12,Math.min(W-12,p.x));
  p.y=Math.max(100,Math.min(H-95,p.y));

  if(!onTile(p)){
   p.alive=false;
  }
 }

 const alive=players.filter(p=>p.alive);

 if(alive.length<=1){
  finish(alive[0]);
 }

 if(timeLeft<=0){
  finish(alive[0]);
 }
}

function draw(){

 ctx.clearRect(0,0,W,H);

 const bg=ctx.createRadialGradient(
  W/2,H/2,10,
  W/2,H/2,Math.max(W,H)*.7
 );

 bg.addColorStop(0,"#17364b");
 bg.addColorStop(1,"#06101a");

 ctx.fillStyle=bg;
 ctx.fillRect(0,0,W,H);

 if(tiles.length){

  const minX=tiles[0].x-12;
  const minY=tiles[0].y-12;

  ctx.fillStyle="#02060baa";
  ctx.beginPath();
  ctx.roundRect(
   minX,minY,
   COLS*SIZE+24,
   ROWS*SIZE+24,
   24
  );
  ctx.fill();
 }

 for(const t of tiles){

  if(!t.alive)continue;

  if(t.warning){
   const pulse=.65+
    Math.sin(performance.now()/60)*.3;
   ctx.fillStyle=`rgba(255,65,65,${pulse})`;
  }else{
   ctx.fillStyle="#20a968";
  }

  ctx.beginPath();
  ctx.roundRect(
   t.x+2,t.y+2,
   SIZE-4,SIZE-4,
   9
  );
  ctx.fill();

  if(!t.warning){
   ctx.fillStyle="#ffffff14";
   ctx.fillRect(
    t.x+7,t.y+7,
    SIZE-14,5
   );
  }
 }

 for(const p of players){

  if(!p.alive)continue;

  ctx.fillStyle="#00000055";
  ctx.beginPath();
  ctx.ellipse(
   p.x,p.y+12,16,6,
   0,0,Math.PI*2
  );
  ctx.fill();

  ctx.fillStyle=p.color;
  ctx.beginPath();
  ctx.arc(
   p.x,p.y,15,
   0,Math.PI*2
  );
  ctx.fill();

  ctx.fillStyle="#111722";

  ctx.beginPath();
  ctx.arc(p.x-5,p.y-3,2.5,0,Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(p.x+5,p.y-3,2.5,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="white";
  ctx.font="bold 10px Arial";
  ctx.textAlign="center";
  ctx.fillText(
   "P"+(p.id+1),
   p.x,p.y-22
  );
 }
}

function updateScores(){

 scoresEl.innerHTML="";

 players.forEach(p=>{

  const s=document.createElement("div");
  s.className="score";
  s.style.border="1px solid "+p.color;

  s.textContent=
   "P"+(p.id+1)+"  "+p.score;

  scoresEl.appendChild(s);
 });
}

function finish(winner){

 if(!running)return;

 running=false;

 if(winner)winner.score+=10;

 updateScores();

 setTimeout(()=>{

  overlay.classList.remove("hidden");

  overlay.querySelector("h1").textContent=
   winner
   ?"🏆 P"+(winner.id+1)+" WINS!"
   :"DRAW!";

  overlay.querySelector("p").textContent=
   winner
   ?"The island belongs to you!"
   :"Everyone fell!";

  startBtn.textContent="PLAY AGAIN";

 },400);
}

function startGame(){

 running=false;

 timeLeft=20;
 destroyTimer=.8;

 makeIsland();
 makePlayers();
 makeControls();
 updateScores();

 overlay.classList.add("hidden");

 running=true;
 last=performance.now();
}

function loop(now){

 const dt=Math.min(
  .035,
  (now-last)/1000
 );

 last=now;

 update(dt);
 draw();

 requestAnimationFrame(loop);
}

startBtn.onclick=startGame;

requestAnimationFrame(loop);
</script>

</body>
</html>
