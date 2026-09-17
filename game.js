
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const IMG = {};
const missing = [];
let loaded = 0, loadTotal = Object.keys(SOURCE_FILES).length, ready = false;

function loadAll(){
  for (const [k,file] of Object.entries(SOURCE_FILES)){
    const im = new Image();
    im.onload = ()=>{ loaded++; checkReady(); };
    im.onerror = ()=>{ missing.push(file); loaded++; checkReady(); };
    im.src = 'assets/' + encodeURI(file);
    IMG[k] = im;
  }
}
function checkReady(){ if(loaded>=loadTotal) ready=true; }

function rectFor(sheet,i){ return ATLAS[sheet][i] || ATLAS[sheet][0]; }
function drawComp(sheet,i,x,y,w=null,h=null,flip=false,alpha=1){
  const im=IMG[sheet]; if(!im || !im.complete) return;
  const [x1,y1,x2,y2]=rectFor(sheet,i), sw=x2-x1, sh=y2-y1;
  if(w==null) w=sw; if(h==null) h=sh;
  ctx.save(); ctx.globalAlpha=alpha;
  if(flip){
    ctx.translate(x+w,y); ctx.scale(-1,1);
    ctx.drawImage(im,x1,y1,sw,sh,0,0,w,h);
  } else {
    ctx.drawImage(im,x1,y1,sw,sh,x,y,w,h);
  }
  ctx.restore();
}
function tileComp(sheet,i,x,y,w,h,tw=96,th=96){
  for(let yy=y;yy<y+h;yy+=th){
    for(let xx=x;xx<x+w;xx+=tw){
      drawComp(sheet,i,xx,yy,Math.min(tw,x+w-xx),Math.min(th,y+h-yy));
    }
  }
}

function tileInset(sheet,i,x,y,w,h,inset=12,tw=96,th=96){
  const im=IMG[sheet]; if(!im||!im.complete) return;
  const [x1,y1,x2,y2]=rectFor(sheet,i), sw=x2-x1, sh=y2-y1;
  const sx=x1+inset, sy=y1+inset, sww=Math.max(1,sw-inset*2), shh=Math.max(1,sh-inset*2);
  for(let yy=y;yy<y+h;yy+=th){
    for(let xx=x;xx<x+w;xx+=tw){
      const ww=Math.min(tw,x+w-xx),hh=Math.min(th,y+h-yy);
      ctx.drawImage(im,sx,sy,sww,shh,worldX(xx)-1,worldY(yy)-1,ww+2,hh+2);
    }
  }
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function dist(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by);}
function hit(a,b){return a.x < b.x+b.w && a.x+a.w>b.x && a.y < b.y+b.h && a.y+a.h>b.y;}

const EN = {
 title:'FINDING NO-NO-NAMOSH II', sub:'THE FOUR TRAILS', newGame:'NEW GAME', cont:'CONTINUE', lang:'SVENSKA',
 apt:'Aya’s Apartment', river:'Riverside Village', shore:'Moonshore', cave:'Crystalwater Grotto', mountain:'Windspire Mountain', volcano:'Ember Peak', temple:'Star Temple',
 objective:'OBJECTIVE', interact:'E  INTERACT', attack:'SPACE  ATTACK', map:'M  MAP', pause:'ESC  PAUSE',
 aptObj:'Search Aya’s apartment for Namosh’s clues.', aptObj2:'The clues point outside. Leave through the hallway.', riverObj:'Talk to Hamdi and Nemo.', shoreObj:'Cross Moonshore and investigate the lighthouse.', caveObj:'Collect the 3 glowing crystals.', mountainObj:'Find Abdullah, get the rope, then climb to the summit.', volcanoObj:'Defeat Mr Fox and recover the Ember Shard.', templeObj:'Find Namosh inside the Star Temple.',
 locked:'The apartment door is locked. I need to understand where Namosh went first.',
 clue1:'Tiny wet pawprints cross the hallway mat… heading toward the front door.',
 clue2:'A thread of black-and-white fur is caught on the window latch.',
 clue3:'Namosh’s food bowl is untouched. She left by choice.',
 intro1:'Namosh? ...Namosh?!', intro2:'Her bed is empty. Again.', intro3:'But this time she left clues all over the apartment.',
 hamdi1:'Aya! I saw Namosh near the river before sunrise. She kept staring toward Moonshore.', hamdi2:'Take this shell charm. The current is rough, but it will help you swim across.',
 nemo1:'I found this strange four-slot compass near the old path.', nemo2:'Water. Crystal. Wind. Ember. Namosh wants us to follow the four trails.',
 lighthouse:'Inside the lighthouse lens, a blue shard begins to hum. The first slot of the compass lights up.',
 grotto:'The cave answers the Water Shard. Three crystals flare to life.',
 crystalsDone:'The three crystals combine into the Crystal Shard.',
 abd1:'I knew you’d somehow end up climbing a mountain.', abd2:'Take the rope. And no, I am NOT following you around the entire game.',
 summit:'At the summit the wind coils around Aya. The Wind Shard clicks into the compass.',
 fox1:'You really do not know when to stop.', fox2:'Namosh entered the Star Temple herself. I only took the Ember Shard so nobody could follow.', fox3:'Then I’m taking it back.',
 foxLose:'Mr Fox drops the Ember Shard. The temple gate opens in the distance.',
 dr1:'Ahem. Took you long enough.', dr2:'Dr. Meow Skuttan?!', dr3:'Namosh discovered a hidden kitten sanctuary beneath the temple. She needed the four shards to open it safely.',
 nam1:'Namosh trots out, perfectly fine, and immediately demands food.', nam2:'Then she leads Aya toward a hidden stairway filled with tiny meows.',
 ending:'NAMOSH FOUND\nSANCTUARY OPENED\nMR FOX ANNOYED\n\nPART II COMPLETE'
};
const SV = {
 title:'FINDING NO-NO-NAMOSH II', sub:'DE FYRA LEDERNA', newGame:'NYTT SPEL', cont:'FORTSÄTT', lang:'ENGLISH',
 apt:'Ayas lägenhet', river:'Riverside Village', shore:'Moonshore', cave:'Crystalwater Grotto', mountain:'Windspire Mountain', volcano:'Ember Peak', temple:'Star Temple',
 objective:'MÅL', interact:'E  INTERAGERA', attack:'SPACE  ATTACK', map:'M  KARTA', pause:'ESC  PAUS',
 aptObj:'Sök igenom Ayas lägenhet efter Namoshs ledtrådar.', aptObj2:'Ledtrådarna pekar utåt. Gå ut genom hallen.', riverObj:'Prata med Hamdi och Nemo.', shoreObj:'Korsa Moonshore och undersök fyren.', caveObj:'Samla de 3 lysande kristallerna.', mountainObj:'Hitta Abdullah, ta repet och klättra till toppen.', volcanoObj:'Besegra Mr Fox och ta glödskärvan.', templeObj:'Hitta Namosh inne i Star Temple.',
 locked:'Dörren är låst. Jag måste förstå vart Namosh tog vägen först.',
 clue1:'Små blöta tassavtryck korsar hallmattan… mot ytterdörren.',
 clue2:'Lite svartvit päls har fastnat i fönsterhaspen.',
 clue3:'Namoshs matskål är orörd. Hon gick frivilligt.',
 intro1:'Namosh? ...Namosh?!', intro2:'Hennes bädd är tom. Igen.', intro3:'Men den här gången har hon lämnat ledtrådar i hela lägenheten.',
 hamdi1:'Aya! Jag såg Namosh vid floden före soluppgången. Hon stirrade mot Moonshore.', hamdi2:'Ta den här snäckamuletten. Strömmen är stark men den hjälper dig att simma över.',
 nemo1:'Jag hittade den här märkliga kompassen med fyra tomma fästen.', nemo2:'Vatten. Kristall. Vind. Glöd. Namosh vill att vi följer de fyra lederna.',
 lighthouse:'Inne i fyrens lins börjar en blå skärva sjunga. Kompassens första fäste lyser.',
 grotto:'Grottan svarar på vattenskärvan. Tre kristaller tänds.',
 crystalsDone:'De tre kristallerna förenas till kristallskärvan.',
 abd1:'Jag visste att du på något sätt skulle hamna på ett berg.', abd2:'Ta repet. Och nej, jag följer INTE efter dig genom hela spelet.',
 summit:'På toppen virvlar vinden runt Aya. Vindskärvan klickar in i kompassen.',
 fox1:'Du vet verkligen inte när du ska sluta.', fox2:'Namosh gick in i Star Temple själv. Jag tog bara glödskärvan så ingen kunde följa efter.', fox3:'Då tar jag tillbaka den.',
 foxLose:'Mr Fox tappar glödskärvan. Tempelporten öppnas i fjärran.',
 dr1:'Ahem. Det tog sin tid.', dr2:'Dr. Meow Skuttan?!', dr3:'Namosh hittade en gömd kattungefristad under templet. Hon behövde de fyra skärvorna för att öppna den säkert.',
 nam1:'Namosh kommer fram, helt oskadd, och kräver omedelbart mat.', nam2:'Sedan leder hon Aya mot en dold trappa fylld av små mjau.',
 ending:'NAMOSH HITTAD\nFRISTADEN ÖPPNAD\nMR FOX IRRITERAD\n\nDEL II KLAR'
};
let lang='en'; const T=k=>(lang==='en'?EN:SV)[k]||k;

const keys={}, pressed={};
addEventListener('keydown',e=>{
  ensureAudio();
  if(!keys[e.code]) pressed[e.code]=true;
  keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup',e=>keys[e.code]=false);


canvas.addEventListener('pointerup',e=>{
  ensureAudio();
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*W/r.width, y=(e.clientY-r.top)*H/r.height;
  if(!ready) return;
  if(mode==='title'){
    if(y>545 && y<625){ newGame(); return; }
    if(y>620 && y<690 && x<W/2 && hasSave()){ loadSave(); return; }
    if(y>620 && y<690 && x>=W/2){ lang=lang==='en'?'sv':'en'; return; }
  }
  if(dialogue){ nextDialogue(); return; }
  if(mode==='ending'){ mode='title'; return; }
});

for(const b of document.querySelectorAll('[data-key]')){
  const k=b.dataset.key;
  const on=e=>{e.preventDefault(); ensureAudio(); if(!keys[k]) pressed[k]=true; keys[k]=true;};
  const off=e=>{e.preventDefault(); keys[k]=false;};
  b.addEventListener('pointerdown',on);
  b.addEventListener('pointerup',off);
  b.addEventListener('pointercancel',off);
  b.addEventListener('pointerleave',off);
}

let mode='title', mapOpen=false, paused=false, dialogue=null, dialogueIndex=0, dialogueCallback=null;
let fade=0, sceneToast=0;
let titleT=0, last=performance.now();
const SAVE_KEY='nnn2_final_release_v3';

const state={
 scene:'apartment', x:1000, y:650, dir:'down', anim:0, hearts:5, maxHearts:5,
 flags:{clueMat:false,clueWindow:false,clueBowl:false,hamdi:false,nemo:false,shell:false,water:false,crystal:false,rope:false,wind:false,fox:false,ember:false,dr:false,rescued:false},
 crystals:0, crystal0:false, crystal1:false, crystal2:false, foxHP:6, play:0, moonPearls:[false,false,false,false,false]
};
const player={w:54,h:70,speed:235,inv:0,atk:0,vx:0,vy:0,stroke:0,trailT:0};
const cam={x:0,y:0,tx:0,ty:0};
const fx={ripples:[],splashes:[],dust:[],embers:[],sparkles:[]};
const pearlSpots=[[835,250],[1030,430],[1245,730],[930,900],[1310,330]];

// Lightweight original procedural audio. Starts only after a user gesture (browser-safe).
let audioCtx=null, masterGain=null, audioMuted=false, lastMusicBeat=-1, lastFootstep=-1;
function ensureAudio(){
 if(audioCtx) { if(audioCtx.state==='suspended') audioCtx.resume(); return; }
 try{
   audioCtx=new (window.AudioContext||window.webkitAudioContext)();
   masterGain=audioCtx.createGain();masterGain.gain.value=.58;masterGain.connect(audioCtx.destination);
 }catch(e){audioCtx=null;}
}
function tone(freq,dur=.12,type='sine',vol=.035,delay=0){
 if(!audioCtx||audioMuted) return;
 const t=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=audioCtx.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(masterGain);o.start(t);o.stop(t+dur+.02);
}
function noiseBurst(dur=.07,vol=.02){
 if(!audioCtx||audioMuted)return;
 const n=Math.max(1,Math.floor(audioCtx.sampleRate*dur)),buf=audioCtx.createBuffer(1,n,audioCtx.sampleRate),data=buf.getChannelData(0);
 for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);
 const src=audioCtx.createBufferSource(),g=audioCtx.createGain();src.buffer=buf;g.gain.value=vol;src.connect(g);g.connect(masterGain);src.start();
}
function sfx(kind){
 ensureAudio();
 if(kind==='pickup'){tone(660,.10,'triangle',.04);tone(880,.16,'triangle',.035,.07);}
 else if(kind==='dialogue'){tone(420,.045,'sine',.012);}
 else if(kind==='attack'){noiseBurst(.06,.025);tone(180,.08,'square',.025);}
 else if(kind==='splash'){noiseBurst(.09,.022);tone(260,.08,'sine',.018);}
 else if(kind==='hurt'){tone(135,.16,'sawtooth',.035);}
 else if(kind==='transition'){tone(392,.16,'triangle',.025);tone(523,.22,'triangle',.020,.08);}
}
function updateMusic(){
 if(!audioCtx||audioMuted||mode!=='game'||dialogue||paused) return;
 const beat=Math.floor(state.play*2);
 if(beat===lastMusicBeat)return;lastMusicBeat=beat;
 const scales={apartment:[261.6,329.6,392,523.3],riverside:[293.7,369.9,440,587.3],moonshore:[261.6,349.2,440,523.3],grotto:[220,293.7,349.2,440],mountain:[246.9,329.6,392,493.9],volcano:[196,233.1,293.7,392],temple:[261.6,311.1,392,466.2]};
 const sc=scales[state.scene]||scales.riverside,n=sc[(Math.floor(beat/2)+beat)%sc.length];
 if(beat%2===0) tone(n,.42,'triangle',state.scene==='volcano'?.010:.013);
 if(beat%8===0) tone(n/2,.70,'sine',.010);
}


function lerp(a,b,t){return a+(b-a)*t;}
function smoothstep(t){return t*t*(3-2*t);}
function currentAt(x,y,t=state.play){
  const band=Math.sin(y*0.014+t*0.9)*0.5+Math.sin((x+y)*0.006-t*0.55)*0.5;
  const deep=clamp((1-Math.abs(x-1070)/390),0,1);
  return {x:(58+34*band)*deep,y:(18*Math.sin(x*0.011+t*0.7))*deep,deep};
}
function addRipple(x,y,big=false){
  fx.ripples.push({x,y,life:big?0.8:0.55,max:big?0.8:0.55,r:big?16:9,big});
  if(fx.ripples.length>38) fx.ripples.shift();
}
function addSplash(x,y,dirX=0,dirY=0){
  for(let i=0;i<8;i++) fx.splashes.push({x:x+(Math.random()-.5)*12,y:y+(Math.random()-.5)*8,vx:(Math.random()-.5)*65-dirX*20,vy:-25-Math.random()*55-dirY*14,life:.35+Math.random()*.25,max:.6});
  if(fx.splashes.length>80) fx.splashes.splice(0,fx.splashes.length-80);
}
function updateFx(dt){
  for(const r of fx.ripples) r.life-=dt; fx.ripples=fx.ripples.filter(r=>r.life>0);
  for(const p of fx.splashes){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=95*dt;} fx.splashes=fx.splashes.filter(p=>p.life>0);
}
function drawContactShadow(x,y,rx=28,ry=10,a=.22){
  ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#061018';ctx.beginPath();ctx.ellipse(worldX(x),worldY(y),rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function colorGrade(kind){
  ctx.save();
  const g=ctx.createLinearGradient(0,0,0,H);
  if(kind==='water'){g.addColorStop(0,'rgba(45,210,245,.05)');g.addColorStop(1,'rgba(0,70,120,.12)');}
  else if(kind==='cave'){g.addColorStop(0,'rgba(42,77,130,.14)');g.addColorStop(1,'rgba(28,7,55,.13)');}
  else if(kind==='volcano'){g.addColorStop(0,'rgba(255,112,35,.09)');g.addColorStop(1,'rgba(96,10,0,.12)');}
  else if(kind==='temple'){g.addColorStop(0,'rgba(145,104,255,.08)');g.addColorStop(1,'rgba(7,24,52,.08)');}
  else {g.addColorStop(0,'rgba(255,220,150,.035)');g.addColorStop(1,'rgba(0,0,0,.035)');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
}
function vignette(a=.12){
  const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.62);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(2,8,12,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}


function snapshot(){ return JSON.parse(JSON.stringify(state)); }
function save(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify({state:snapshot(),lang})); }catch(e){} }
function hasSave(){ try{return !!localStorage.getItem(SAVE_KEY)}catch(e){return false} }
function loadSave(){
 try{
  const s=JSON.parse(localStorage.getItem(SAVE_KEY)); if(!s) return false;
  Object.assign(state,s.state||{});
  state.flags=Object.assign({},state.flags,(s.state&&s.state.flags)||{});
  lang=s.lang||'en'; mode='game'; return true;
 }catch(e){return false}
}
function newGame(){
 Object.assign(state,{scene:'apartment',x:1000,y:650,dir:'down',anim:0,hearts:5,maxHearts:5,crystals:0,crystal0:false,crystal1:false,crystal2:false,foxHP:6,play:0,moonPearls:[false,false,false,false,false]});
 player.vx=player.vy=0;player.stroke=0;fx.ripples.length=fx.splashes.length=0;
 state.flags={clueMat:false,clueWindow:false,clueBowl:false,hamdi:false,nemo:false,shell:false,water:false,crystal:false,rope:false,wind:false,fox:false,ember:false,dr:false,rescued:false};
 mode='game'; dialogue=null;
 say('aya','Aya',[T('intro1'),T('intro2'),T('intro3')]);
 save();
}
function say(portrait,name,lines,cb=null){
 sfx('dialogue');
 dialogue={portrait,name,lines:Array.isArray(lines)?lines:[lines]};
 dialogueIndex=0; dialogueCallback=cb;
}
function nextDialogue(){
 if(!dialogue) return;
 if(dialogueIndex<dialogue.lines.length-1) dialogueIndex++;
 else{
   const cb=dialogueCallback;
   dialogue=null; dialogueCallback=null;
   if(cb) cb();
 }
}
function sceneName(){
 return {apartment:T('apt'),riverside:T('river'),moonshore:T('shore'),grotto:T('cave'),mountain:T('mountain'),volcano:T('volcano'),temple:T('temple')}[state.scene];
}
function objective(){
 if(state.scene==='apartment') return state.flags.clueMat&&state.flags.clueWindow&&state.flags.clueBowl?T('aptObj2'):T('aptObj');
 if(state.scene==='riverside') return T('riverObj');
 if(state.scene==='moonshore') return T('shoreObj');
 if(state.scene==='grotto') return T('caveObj');
 if(state.scene==='mountain') return T('mountainObj');
 if(state.scene==='volcano') return T('volcanoObj');
 if(state.scene==='temple') return T('templeObj');
 return '';
}
const sceneDims={
 apartment:[1500,900], riverside:[2100,1250], moonshore:[2100,1150], grotto:[1800,1100], mountain:[1900,1300], volcano:[1900,1200], temple:[1700,1050]
};
function playerBox(nx=state.x,ny=state.y){return {x:nx-player.w/2+8,y:ny-player.h/2+22,w:player.w-16,h:player.h-24};}
function solids(){
 if(state.scene==='apartment') return [
   // kitchen wall / cabinets
   {x:80,y:115,w:610,h:185},
   // sofa / coffee area
   {x:120,y:555,w:330,h:165},{x:455,y:600,w:175,h:115},
   // bathroom fixtures and walls
   {x:760,y:95,w:285,h:70},{x:775,y:145,w:140,h:235},{x:930,y:170,w:95,h:155},
   // bed + side furniture + window wall
   {x:1080,y:430,w:235,h:300},{x:1280,y:495,w:100,h:155},{x:1250,y:175,w:190,h:95},
   // room perimeter; hallway/exit remains open at upper right
   {x:40,y:80,w:20,h:760},{x:1435,y:80,w:20,h:760},{x:40,y:820,w:1415,h:20}
 ];
 if(state.scene==='riverside') return [
   // houses
   {x:80,y:35,w:260,h:210},{x:970,y:35,w:285,h:215},
   // market stall + supply pile
   {x:865,y:410,w:250,h:180},{x:1135,y:455,w:175,h:125},
   // bench / trees only where their physical footprint matters
   {x:35,y:450,w:125,h:70},{x:1335,y:250,w:175,h:190},
   // east water boundary
   {x:1510,y:0,w:590,h:1250}
 ];
 if(state.scene==='moonshore') return [
   // coast structures / lighthouse footprint
   {x:40,y:100,w:310,h:250},{x:1540,y:130,w:310,h:480},
   // docks are physical but narrow
   {x:390,y:620,w:300,h:145},{x:1450,y:620,w:300,h:145},
   // rocks in the water
   {x:930,y:190,w:95,h:70},{x:1165,y:585,w:105,h:85},{x:790,y:790,w:82,h:72}
 ];
 if(state.scene==='grotto') return [
   {x:0,y:0,w:1800,h:70},{x:0,y:1030,w:1800,h:70},{x:0,y:0,w:70,h:1100},{x:1730,y:0,w:70,h:1100},
   // crystal pool / boulders
   {x:710,y:750,w:485,h:190},{x:105,y:745,w:285,h:205}
 ];
 if(state.scene==='mountain') return [
   {x:0,y:0,w:1900,h:55},{x:0,y:1245,w:1900,h:55},{x:0,y:0,w:55,h:1300},{x:1845,y:0,w:55,h:1300},
   // cliff masses leave one deliberate rope/climb corridor at x 880-1010
   {x:1050,y:120,w:600,h:250},{x:1040,y:700,w:650,h:250},{x:80,y:80,w:300,h:310}
 ];
 if(state.scene==='volcano') return [
   {x:0,y:0,w:1900,h:55},{x:0,y:1145,w:1900,h:55},{x:0,y:0,w:55,h:1200},{x:1845,y:0,w:55,h:1200},
   // camp structures and arena props
   {x:90,y:120,w:330,h:315},{x:1440,y:720,w:260,h:210}
 ];
 if(state.scene==='temple') return [
   {x:0,y:0,w:1700,h:45},{x:0,y:1005,w:1700,h:45},{x:0,y:0,w:45,h:1050},{x:1655,y:0,w:45,h:1050},
   // central altar / side pillars
   {x:670,y:75,w:360,h:300},{x:180,y:220,w:230,h:330},{x:1290,y:220,w:230,h:330}
 ];
 return [];
}
function canMove(nx,ny){
 const [sw,sh]=sceneDims[state.scene];
 if(nx<35||ny<45||nx>sw-35||ny>sh-40) return false;
 const pb=playerBox(nx,ny);
 for(const r of solids()) if(hit(pb,r)) return false;
 if(state.scene==='riverside' && nx>1490) return false;
 if(state.scene==='moonshore'){
   const water = nx>620 && nx<1510;
   if(water && !state.flags.shell) return false;
 }
 // lava is a hazard, not a wall: only the narrow stone bridges are safe crossings.
 if(state.scene==='volcano'){
   const inHorizontalLava = ny>665 && ny<790 && nx>420 && nx<1280;
   const inVerticalLava = nx>1080 && nx<1200 && ny>180 && ny<790;
   const bridgeAcrossHorizontal = nx>825 && nx<940 && ny>665 && ny<790;
   const bridgeAcrossVertical = ny>475 && ny<590 && nx>1080 && nx<1200;
   if((inHorizontalLava&&!bridgeAcrossHorizontal)||(inVerticalLava&&!bridgeAcrossVertical)) return false;
 }
 return true;
}
function clearPressed(){for(const k in pressed) delete pressed[k];}
function isSwimming(){return state.scene==='moonshore' && state.x>620 && state.x<1510;}
function isClimbing(){return state.scene==='mountain' && state.flags.rope && state.x>880 && state.x<1010 && state.y>310 && state.y<950;}

function update(dt){
 titleT+=dt;
 updateFx(dt);
 if(!ready) return;
 if(mode==='title'){
   if(pressed.Enter||pressed.Space) newGame();
   if(pressed.KeyL) lang=lang==='en'?'sv':'en';
   if(pressed.KeyC && hasSave()) loadSave();
   clearPressed(); return;
 }
 if(mode==='ending'){
   if(pressed.Enter||pressed.Space||pressed.Escape) mode='title';
   clearPressed(); return;
 }
 if(dialogue){
   if(pressed.KeyE||pressed.Enter||pressed.Space) nextDialogue();
   clearPressed(); return;
 }
 if(pressed.Escape) paused=!paused;
 if(pressed.KeyM) mapOpen=!mapOpen;
 if(pressed.KeyL && paused) lang=lang==='en'?'sv':'en';
 if(paused||mapOpen){ clearPressed(); return; }

 state.play+=dt;
 fade=Math.max(0,fade-dt*2.2);sceneToast=Math.max(0,sceneToast-dt);
 updateMusic();
 player.inv=Math.max(0,player.inv-dt);
 player.atk=Math.max(0,player.atk-dt);
 player.stroke=Math.max(0,player.stroke-dt);
 let dx=0,dy=0;
 if(keys.ArrowLeft||keys.KeyA) dx-=1;
 if(keys.ArrowRight||keys.KeyD) dx+=1;
 if(keys.ArrowUp||keys.KeyW) dy-=1;
 if(keys.ArrowDown||keys.KeyS) dy+=1;
 if(dx||dy){const l=Math.hypot(dx,dy);dx/=l;dy/=l;}

 const swimming=isSwimming();
 if(swimming){
   const cur=currentAt(state.x,state.y);
   const accel=260, drag=Math.pow(.965,dt*60);
   player.vx=(player.vx+dx*accel*dt+cur.x*dt)*drag;
   player.vy=(player.vy+dy*accel*dt+cur.y*dt)*drag;
   const max=185+cur.deep*18, mag=Math.hypot(player.vx,player.vy);
   if(mag>max){player.vx=player.vx/mag*max;player.vy=player.vy/mag*max;}
   if(pressed.Space && player.stroke<=0){
     const aimMag=Math.hypot(dx,dy)||1, ax=(dx||Math.sign(player.vx)||1)/aimMag, ay=dy/aimMag;
     player.vx+=ax*135;player.vy+=ay*135;player.stroke=.42;
     addRipple(state.x,state.y+24,true);addSplash(state.x,state.y+18,ax,ay);sfx('splash');
   }
   const nx=state.x+player.vx*dt,ny=state.y+player.vy*dt;
   if(canMove(nx,state.y)) state.x=nx; else player.vx*=-.28;
   if(canMove(state.x,ny)) state.y=ny; else player.vy*=-.28;
   const mv=Math.hypot(player.vx,player.vy);
   if(mv>16){state.anim+=dt*(4.5+mv/80);player.trailT-=dt;if(player.trailT<=0){addRipple(state.x,state.y+26,false);player.trailT=.14;}}
   if(mv>8){if(Math.abs(player.vx)>Math.abs(player.vy))state.dir=player.vx<0?'left':'right';else state.dir=player.vy<0?'up':'down';}
 } else {
   const accel=1600, friction=Math.pow(.72,dt*60), target=player.speed;
   if(dx||dy){
     player.vx+=(dx*target-player.vx)*Math.min(1,accel*dt/target);
     player.vy+=(dy*target-player.vy)*Math.min(1,accel*dt/target);
   }else{player.vx*=friction;player.vy*=friction;if(Math.abs(player.vx)<1)player.vx=0;if(Math.abs(player.vy)<1)player.vy=0;}
   let nx=state.x+player.vx*dt,ny=state.y+player.vy*dt;
   if(canMove(nx,state.y))state.x=nx;else player.vx=0;
   if(canMove(state.x,ny))state.y=ny;else player.vy=0;
   const mv=Math.hypot(player.vx,player.vy);
   if(mv>8){state.anim+=dt*(5.6+mv/75);if(Math.abs(player.vx)>Math.abs(player.vy))state.dir=player.vx<0?'left':'right';else state.dir=player.vy<0?'up':'down';}
 }

 if(pressed.KeyE) interact();
 if(pressed.Space && !swimming) attack();
 updateTransitions();
 if(state.scene==='volcano') updateBoss(dt);

 if(state.scene==='moonshore'){
   for(let i=0;i<pearlSpots.length;i++) if(!state.moonPearls[i]&&dist(state.x,state.y,...pearlSpots[i])<44){state.moonPearls[i]=true;addSplash(pearlSpots[i][0],pearlSpots[i][1]);sfx('pickup');save();}
 }

 const [sw,sh]=sceneDims[state.scene];
 const lookX=clamp(player.vx*.32,-70,70),lookY=clamp(player.vy*.24,-45,45);
 cam.tx=clamp(state.x-W/2+lookX,0,Math.max(0,sw-W));
 cam.ty=clamp(state.y-H/2+lookY,0,Math.max(0,sh-H));
 const ease=1-Math.pow(.0008,dt);
 cam.x=lerp(cam.x,cam.tx,ease);cam.y=lerp(cam.y,cam.ty,ease);
 clearPressed();
}
function interact(){
 const x=state.x,y=state.y;
 if(state.scene==='apartment'){
   if(dist(x,y,1085,350)<120 && !state.flags.clueMat){state.flags.clueMat=true;say('aya','Aya',T('clue1'),save);return;}
   if(dist(x,y,1290,250)<120 && !state.flags.clueWindow){state.flags.clueWindow=true;say('aya','Aya',T('clue2'),save);return;}
   if(dist(x,y,520,260)<130 && !state.flags.clueBowl){state.flags.clueBowl=true;say('aya','Aya',T('clue3'),save);return;}
   if(dist(x,y,1350,170)<130){
      if(state.flags.clueMat&&state.flags.clueWindow&&state.flags.clueBowl) transition('riverside',250,850);
      else say('aya','Aya',T('locked'));
      return;
   }
 }
 if(state.scene==='riverside'){
   if(dist(x,y,500,790)<135 && !state.flags.hamdi){
     say('hamdi','Hamdi',[T('hamdi1'),T('hamdi2')],()=>{state.flags.hamdi=true;state.flags.shell=true;save();}); return;
   }
   if(dist(x,y,1005,760)<140 && !state.flags.nemo){
     say('explorer','Nemo',[T('nemo1'),T('nemo2')],()=>{state.flags.nemo=true;save();});return;
   }
 }
 if(state.scene==='moonshore'){
   if(dist(x,y,1775,430)<180 && !state.flags.water){
     say('aya','Aya',T('lighthouse'),()=>{state.flags.water=true;sfx('pickup');save();});return;
   }
 }
 if(state.scene==='grotto'){
   const spots=[[470,380],[1000,700],[1410,420]];
   for(let i=0;i<spots.length;i++){
     const key='crystal'+i;
     if(dist(x,y,spots[i][0],spots[i][1])<120 && !state[key]){
       state[key]=true; state.crystals++;sfx('pickup');
       if(state.crystals===1) say('aya','Aya',T('grotto'));
       else if(state.crystals>=3) say('aya','Aya',T('crystalsDone'),()=>{state.flags.crystal=true;save();});
       else say('aya','Aya',lang==='en'?'Another crystal resonates with the compass.':'Ännu en kristall svarar på kompassen.');
       save(); return;
     }
   }
 }
 if(state.scene==='mountain'){
   if(dist(x,y,650,860)<140 && !state.flags.rope){
     say('abdullah','Abdullah',[T('abd1'),T('abd2')],()=>{state.flags.rope=true;sfx('pickup');save();});return;
   }
   if(dist(x,y,1450,220)<150 && !state.flags.wind){
     if(state.flags.rope) say('aya','Aya',T('summit'),()=>{state.flags.wind=true;sfx('pickup');save();});
     return;
   }
 }
 if(state.scene==='volcano'){
   if(dist(x,y,foxPos.x,foxPos.y)<180 && !state.flags.fox){
     say('fox','Mr Fox',[T('fox1'),T('fox2'),T('fox3')]);return;
   }
 }
 if(state.scene==='temple'){
   if(dist(x,y,820,470)<150 && !state.flags.dr){
     say('drmeow','Dr. Meow Skuttan',[T('dr1'),T('dr2'),T('dr3')],()=>{state.flags.dr=true;save();});return;
   }
   if(dist(x,y,1120,560)<150 && state.flags.dr && !state.flags.rescued){
     say('namosh','Namosh',[T('nam1'),T('nam2')],()=>{state.flags.rescued=true;save();mode='ending';});return;
   }
 }
}
function attack(){
 player.atk=.24;sfx('attack');
 if(state.scene==='volcano' && !state.flags.fox && dist(state.x,state.y,foxPos.x,foxPos.y)<150){
   state.foxHP--; foxHit=.25;
   if(state.foxHP<=0){
     state.flags.fox=true;state.flags.ember=true;sfx('pickup');
     say('fox','Mr Fox',T('foxLose'),save);
   }
 }
}
function updateTransitions(){
 if(state.scene==='riverside' && state.x>1450 && state.y>900){
   if(state.flags.hamdi&&state.flags.nemo) transition('moonshore',250,780);
   else if(!dialogue) say('aya','Aya',lang==='en'?'I should talk to Hamdi and Nemo first.':'Jag borde prata med Hamdi och Nemo först.');
 }
 if(state.scene==='moonshore' && state.flags.water && state.x>1925 && state.y<300) transition('grotto',180,650);
 if(state.scene==='grotto' && state.flags.crystal && state.x>1630 && state.y<330) transition('mountain',250,1050);
 if(state.scene==='mountain' && state.flags.wind && state.x>1740 && state.y<300) transition('volcano',200,900);
 if(state.scene==='volcano' && state.flags.ember && state.x>1730 && state.y<260) transition('temple',200,780);
}
function transition(sc,x,y){state.scene=sc;state.x=x;state.y=y;player.vx=player.vy=0;cam.x=cam.y=cam.tx=cam.ty=0;fade=1;sceneToast=2.2;sfx('transition');save();}

let foxPos={x:1390,y:520}, foxHit=0;
function updateBoss(dt){
 foxHit=Math.max(0,foxHit-dt);
 if(state.flags.fox) return;
 const d=dist(state.x,state.y,foxPos.x,foxPos.y);
 if(d<520){
   const ang=Math.atan2(state.y-foxPos.y,state.x-foxPos.x);
   foxPos.x+=Math.cos(ang)*72*dt; foxPos.y+=Math.sin(ang)*72*dt;
   if(d<75 && player.inv<=0){
     state.hearts--;player.inv=1.1;sfx('hurt');
     if(state.hearts<=0){state.hearts=state.maxHearts;state.x=300;state.y=900;}
   }
 }
}

function worldX(x){return x-cam.x}
function worldY(y){return y-cam.y}

// World props preserve the source sprite's aspect ratio. Older prototype code
// stretched every crop to arbitrary width/height boxes, which made furniture,
// rocks, buildings and decorations look warped and disproportionate.
// Scale discipline: source-sheet crops already encode their intended relative size.
// Keep authored boxes from warping sprites, but also stop props from being blown up or
// shrunk to arbitrary extremes. Tiles use drawWorldExact/tileWorld and are unaffected.
const PROP_SCALE_LIMITS={
  apartment:[0.78,1.28], bathroom:[0.78,1.28], village:[0.78,1.30], beach:[0.78,1.28],
  cave:[0.76,1.30], forest:[0.76,1.30], volcano:[0.76,1.28], temple:[0.76,1.28]
};
function drawWorldComp(sheet,i,x,y,w,h,flip=false,alpha=1){
  const [x1,y1,x2,y2]=rectFor(sheet,i), sw=x2-x1, sh=y2-y1;
  const srcAR=sw/sh, boxAR=w/h;
  let dw=w,dh=h,dx=x,dy=y;
  const distortion=Math.max(srcAR/boxAR,boxAR/srcAR);
  if(distortion>1.08){
    if(srcAR>boxAR){ dw=w; dh=w/srcAR; dy=y+(h-dh); }
    else { dh=h; dw=h*srcAR; dx=x+(w-dw)/2; }
  }
  const limits=PROP_SCALE_LIMITS[sheet];
  if(limits){
    let scale=dw/sw;
    const clamped=clamp(scale,limits[0],limits[1]);
    if(Math.abs(clamped-scale)>.001){
      const ndw=sw*clamped, ndh=sh*clamped;
      // Keep the sprite centered in its authored slot and grounded at the slot bottom.
      dx=x+(w-ndw)/2; dy=y+h-ndh; dw=ndw; dh=ndh;
    }
  }
  drawComp(sheet,i,worldX(dx),worldY(dy),dw,dh,flip,alpha);
}
function drawWorldExact(sheet,i,x,y,w,h,flip=false,alpha=1){drawComp(sheet,i,worldX(x),worldY(y),w,h,flip,alpha);}
function drawWorldActor(sheet,i,cx,feetY,targetH,flip=false,alpha=1){
  const [x1,y1,x2,y2]=rectFor(sheet,i), sw=x2-x1, sh=y2-y1;
  const targetW=targetH*(sw/sh);
  drawComp(sheet,i,worldX(cx-targetW/2),worldY(feetY-targetH),targetW,targetH,flip,alpha);
}
function tileWorld(sheet,i,x,y,w,h,tw=96,th=96){
 // 2px overscan hides hairline seams caused by transparent sprite edges / scaling.
 for(let yy=y;yy<y+h;yy+=th){
   for(let xx=x;xx<x+w;xx+=tw){
     const ww=Math.min(tw,x+w-xx),hh=Math.min(th,y+h-yy);
     drawWorldExact(sheet,i,xx-1,yy-1,ww+2,hh+2);
   }
 }
}

function render(){
 ctx.clearRect(0,0,W,H);
 if(!ready){drawLoading();return;}
 if(mode==='title'){drawTitle();return;}
 if(mode==='ending'){drawEnding();return;}
 drawScene(); drawSceneEffectsBack(); drawPlayer(); drawInteractBubble(); drawSceneEffectsFront();
 if(state.scene==='moonshore') colorGrade('water'); else if(state.scene==='grotto') colorGrade('cave'); else if(state.scene==='volcano') colorGrade('volcano'); else if(state.scene==='temple') colorGrade('temple'); else colorGrade('warm');
 vignette(state.scene==='grotto'||state.scene==='volcano'?0.18:0.10); drawHUD();
 if(sceneToast>0){ctx.save();ctx.globalAlpha=clamp(sceneToast/1.2,0,1);ctx.fillStyle='#071a22c8';roundRect(W/2-190,150,380,62,16,true);ctx.strokeStyle='#e5c66f';ctx.lineWidth=2;roundRect(W/2-190,150,380,62,16,false,true);ctx.fillStyle='#fff7df';ctx.textAlign='center';ctx.font='900 25px Georgia';ctx.fillText(sceneName(),W/2,189);ctx.restore();}
 if(fade>0){ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='#06151d';ctx.fillRect(0,0,W,H);ctx.restore();}
 if(mapOpen) drawMap();
 if(paused) drawPause();
 if(dialogue) drawDialogue();
}
function drawLoading(){
 ctx.fillStyle='#071820';ctx.fillRect(0,0,W,H);
 const p=loadTotal?loaded/loadTotal:0;
 ctx.fillStyle='#fff';ctx.font='700 34px system-ui';ctx.textAlign='center';
 ctx.fillText(`Loading source spritesheets… ${Math.round(p*100)}%`,W/2,H/2-20);
 ctx.fillStyle='#17333d';ctx.fillRect(W/2-260,H/2+20,520,18);
 ctx.fillStyle='#f0c86b';ctx.fillRect(W/2-260,H/2+20,520*p,18);
 if(missing.length){
   ctx.font='16px system-ui';ctx.fillStyle='#ffb4b4';
   ctx.fillText('Missing: '+missing.slice(0,3).join(', '),W/2,H/2+75);
 }
}
function drawTitle(){
 tileComp('village',0,0,0,W,H,96,96);
 for(let x=0;x<W;x+=100) drawComp('village',12,x,520,100,105);
 drawComp('village',94,120,180,310,250);
 drawComp('village',93,850,175,300,250);
 drawComp('village',70,590,350,150,130);
 drawComp('aya',0,510,375,80,127);
 drawComp('namosh',0,705,438,48,68);
 ctx.fillStyle='#0a1d21cc';ctx.fillRect(0,0,W,155);
 ctx.textAlign='center';ctx.fillStyle='#fff7df';ctx.font='900 48px Georgia';
 ctx.fillText(T('title'),W/2,64);
 ctx.fillStyle='#f6d57b';ctx.font='800 25px Georgia';
 ctx.fillText(T('sub'),W/2,108);
 const pulse=.65+.35*Math.sin(titleT*3);
 button(W/2-160,560,320,58,T('newGame'),pulse);
 if(hasSave()) button(W/2-160,628,155,46,T('cont'),1);
 button(W/2+5,628,155,46,T('lang'),1);
 ctx.font='15px system-ui';ctx.fillStyle='#18343a';
 ctx.fillText('Enter = '+T('newGame')+'   •   C = '+T('cont')+'   •   L = '+T('lang'),W/2,703);
}
function button(x,y,w,h,label,a=1){
 ctx.save();ctx.globalAlpha=a;
 ctx.fillStyle='#17323b';roundRect(x,y,w,h,13,true);
 ctx.strokeStyle='#e8c66c';ctx.lineWidth=3;roundRect(x,y,w,h,13,false,true);
 ctx.fillStyle='#fff7df';ctx.font='800 20px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(label,x+w/2,y+h/2);ctx.restore();
}
function roundRect(x,y,w,h,r,fill=false,stroke=false){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke();
}
function drawScene(){
 if(state.scene==='apartment') drawApartment();
 else if(state.scene==='riverside') drawRiverside();
 else if(state.scene==='moonshore') drawMoonshore();
 else if(state.scene==='grotto') drawGrotto();
 else if(state.scene==='mountain') drawMountain();
 else if(state.scene==='volcano') drawVolcano();
 else if(state.scene==='temple') drawTemple();
}

function drawApartment(){
 // warm wood floor, studio layout, uncluttered navigation lanes
 tileWorld('apartment',4,50,90,1400,760,110,110);
 // upper wall panels
 for(let x=50;x<1450;x+=115) drawWorldExact('apartment',1,x,80,116,105);
 // kitchen: one continuous run, top-left
 const kitchen=[[31,95,175,110,230],[32,205,175,112,230],[33,318,175,108,230],[34,428,175,108,230],[35,538,175,120,230]];
 for(const p of kitchen) drawWorldComp('apartment',...p);
 drawWorldComp('apartment',48,665,185,90,170);
 // living area: sofa, coffee table, media unit, rug
 drawWorldComp('apartment',58,110,565,320,165);
 drawWorldComp('apartment',64,455,600,170,100);
 drawWorldComp('apartment',67,120,405,235,110);
 drawWorldComp('apartment',61,380,710,260,105);
 drawWorldComp('apartment',62,1030,245,115,168);
 // bathroom upper-middle/right, with actual bathroom fixtures only inside it
 for(let x=770;x<1045;x+=92) drawWorldExact('bathroom',4,x,110,94,92);
 drawWorldComp('bathroom',25,785,160,126,185);
 drawWorldComp('bathroom',28,935,250,68,105);
 drawWorldComp('bathroom',30,925,145,85,108);
 drawWorldComp('apartment',20,845,90,92,148);
 // sleeping side: bed by barred window, fridge/wardrobe on right wall
 drawWorldComp('apartment',57,1090,445,195,285);
 drawWorldComp('apartment',55,1285,500,96,138);
 drawWorldComp('apartment',26,1245,180,185,112);
 drawWorldComp('apartment',75,1290,650,120,185);
 drawWorldComp('apartment',22,1315,95,105,175);
 // clue mat in hallway and tiny bowl by kitchen
 drawWorldComp('apartment',82,1045,315,82,72);
 drawWorldComp('bathroom',42,505,240,42,42);
 // restrained ambient lighting
 ctx.save();
 const lamp=ctx.createRadialGradient(worldX(1175),worldY(575),20,worldX(1175),worldY(575),230);
 lamp.addColorStop(0,'rgba(255,210,140,.13)');lamp.addColorStop(1,'rgba(255,210,140,0)');ctx.fillStyle=lamp;ctx.fillRect(0,0,W,H);
 ctx.restore();
 // clues only sparkle until found
 if(!state.flags.clueMat) sparkle(1085,350);
 if(!state.flags.clueWindow) sparkle(1315,230);
 if(!state.flags.clueBowl) sparkle(525,258);
 arrow(1280,125,lang==='en'?'HALL / EXIT':'HALL / UT');
}
function drawRiverside(){
 // grass base with only a few subtle texture variants
 tileWorld('village',0,0,0,1510,1250,105,105);
 for(const [i,x,y] of [[1,140,300],[2,430,470],[4,710,190],[6,1180,285],[8,310,980],[9,1240,980]]) drawWorldExact('village',i,x,y,105,105);
 // east river: pure water only
 for(let yy=0;yy<1250;yy+=124) for(let xx=1510;xx<2100;xx+=124) drawWorldExact('beach',11,xx-3,yy-3,130,130);
 // clean village paths: left home -> crossroads -> market -> river exit
 for(let y=155;y<955;y+=100) drawWorldExact('village',14,235,y,100,105);
 for(let x=235;x<1390;x+=100) drawWorldExact('village',12,x,820,100,105);
 drawWorldExact('village',18,235,820,100,105);
 // branch to upper-right home / market
 for(let y=420;y<825;y+=100) drawWorldExact('village',14,1085,y,100,105);
 drawWorldExact('village',19,1085,820,100,105);
 // short south-east exit spur
 for(let y=820;y<1120;y+=100) drawWorldExact('village',14,1385,y,100,105);
 drawWorldExact('village',15,1285,820,100,105);
 // two main houses, enough detail without creating clutter
 drawWorldComp('village',93,70,45,275,225);
 drawWorldComp('village',92,965,45,290,230);
 drawWorldComp('village',75,350,170,62,72);
 drawWorldComp('village',97,1200,175,92,70);
 // bench on grass, deliberately clear of roads
 drawWorldComp('village',61,35,505,120,65);
 // market zone: stall, crates/barrels together and nowhere else
 drawWorldComp('village',48,855,430,245,175);
 drawWorldComp('village',59,900,610,120,65);
 drawWorldComp('village',53,1140,485,92,92);
 drawWorldComp('village',63,1120,405,58,70);
 drawWorldComp('village',60,1245,500,58,70);
 // framed greenery along map edges, never blocking a doorway or route
 for(const [x,y,s] of [[20,280,150],[1325,270,155],[1355,900,145],[35,980,150]]) drawWorldComp('village',36,x,y,s,s);
 drawWorldComp('village',42,1210,315,145,72);
 drawWorldComp('village',42,380,300,125,65);
 // tasteful signs by destinations
 drawWorldComp('village',51,1390,760,78,76);
 drawWorldComp('village',103,1450,650,46,92);
 // NPCs: consistent human scale and deliberate standing positions
 drawContactShadow(500,790,22,7,.18); drawWorldActor('hamdi',0,500,790,96); labelWorld(460,650,'Hamdi');
 drawContactShadow(1005,760,22,7,.18); drawWorldActor('explorer',1,1005,760,96); labelWorld(965,620,'Nemo');
 // shoreline foam only at water boundary
 ctx.save();ctx.strokeStyle='rgba(235,252,255,.52)';ctx.lineWidth=3;
 ctx.beginPath();for(let y=0;y<=1250;y+=18){const x=1508+Math.sin(y*.028+state.play*.8)*4;if(y===0)ctx.moveTo(worldX(x),worldY(y));else ctx.lineTo(worldX(x),worldY(y));}ctx.stroke();ctx.restore();
 if(state.flags.hamdi&&state.flags.nemo) arrow(1370,1030,lang==='en'?'TO MOONSHORE →':'TILL MOONSHORE →');
}
function drawMoonshore(){
 // left/right islands separated by a single continuous swimming channel
 tileWorld('beach',0,0,0,620,1150,105,105);
 tileWorld('beach',0,1510,0,590,1150,105,105);
 for(let yy=0;yy<1150;yy+=124) for(let xx=620;xx<1510;xx+=124) drawWorldExact('beach',11,xx-3,yy-3,130,130);
 // foam only at shoreline, never sand inside water
 ctx.save();
 for(const [shore,sgn] of [[620,1],[1510,-1]]){
   for(let band=0;band<2;band++){ctx.beginPath();for(let y=0;y<=1150;y+=16){const x=shore+sgn*(4+band*7+Math.sin(y*.032+band+state.play*.9)*3);if(y===0)ctx.moveTo(worldX(x),worldY(y));else ctx.lineTo(worldX(x),worldY(y));}ctx.strokeStyle=`rgba(235,253,255,${.42-band*.13})`;ctx.lineWidth=3-band;ctx.stroke();}
 }
 ctx.restore();
 // left camp/hut and dock are fully on land/coast
 drawWorldComp('beach',75,70,150,330,285);
 drawWorldComp('beach',44,75,735,190,225);
 drawWorldComp('beach',63,360,650,300,215);
 // lighthouse island: tower and dock stay on right shore
 drawWorldComp('beach',56,1660,155,235,460);
 drawWorldComp('beach',45,1770,740,185,225);
 drawWorldComp('beach',62,1450,650,300,215);
 // sparse coastal plants / shells, not random obstacles
 drawWorldComp('beach',32,285,535,42,42);drawWorldComp('beach',37,350,510,45,45);
 // three purposeful rock obstacles in channel
 drawWorldComp('beach',22,930,190,95,72);
 drawWorldComp('beach',23,1165,585,105,85);
 drawWorldComp('beach',22,790,790,82,72);
 // current ribbons aligned with physics flow
 ctx.save();for(let lane=0;lane<6;lane++){ctx.beginPath();for(let x=660;x<1480;x+=16){const y=105+lane*165+Math.sin(x*.012+lane+state.play*.8)*14;if(x===660)ctx.moveTo(worldX(x),worldY(y));else ctx.lineTo(worldX(x),worldY(y));}ctx.strokeStyle='rgba(217,250,255,.20)';ctx.lineWidth=3;ctx.stroke();}ctx.restore();
 // collectibles
 pearlSpots.forEach((p,i)=>{if(!state.moonPearls[i]) drawMoonPearl(p[0],p[1],i);});
 if(!state.flags.water) sparkle(1775,430);
 arrow(1740,340,lang==='en'?'LIGHTHOUSE':'FYR');
 if(state.flags.water) arrow(1900,150,lang==='en'?'GROTTO →':'GROTTA →');
}
function drawMoonPearl(x,y,i){
 const sx=worldX(x),sy=worldY(y),pulse=1+.12*Math.sin(state.play*4+i);
 ctx.save();ctx.globalCompositeOperation='screen';
 const g=ctx.createRadialGradient(sx,sy,2,sx,sy,28*pulse);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.3,'rgba(160,243,255,.55)');g.addColorStop(1,'rgba(90,210,250,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,30*pulse,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';
 ctx.fillStyle='#f7ffff';ctx.strokeStyle='#68d8ef';ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx,sy,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
function drawGrotto(){
 // coherent earthen chamber with two mine openings and one crystal-water sanctuary
 tileWorld('cave',8,0,0,1800,1100,105,105);
 for(let x=0;x<1800;x+=130){drawWorldComp('cave',26+(Math.floor(x/130)%3),x,0,130,150);drawWorldComp('cave',26+((Math.floor(x/130)+1)%3),x,950,130,150);}
 // actual entrance and exit
 drawWorldComp('cave',21,105,745,285,205);
 drawWorldComp('cave',22,1480,90,260,190);
 drawWorldComp('cave',43,415,760,52,82);
 drawWorldComp('cave',44,1420,155,52,82);
 // natural rock masses stay against the perimeter
 drawWorldComp('cave',26,90,110,165,220);
 drawWorldComp('cave',54,1390,820,180,95);
 drawWorldComp('cave',54,380,150,145,80);
 // crystal water sanctuary: three aligned pool tiles with no objects stacked on top
 drawWorldExact('cave',94,720,760,155,170);
 drawWorldExact('cave',94,875,760,155,170);
 drawWorldExact('cave',95,1030,760,155,170);
 // a single mine cart zone, deliberately away from crystals
 drawWorldComp('cave',42,250,500,120,92);
 drawWorldComp('cave',41,365,510,155,82);
 // three crystal objectives each have their own clear pocket
 if(!state.crystal0){drawWorldComp('cave',79,420,300,108,125);sparkle(470,380);}
 if(!state.crystal1){drawWorldComp('cave',70,945,585,112,130);sparkle(1000,700);}
 if(!state.crystal2){drawWorldComp('cave',64,1355,330,112,148);sparkle(1410,420);}
 // localized glow only
 ctx.save();ctx.globalCompositeOperation='screen';for(const [x,y,c] of [[470,380,'120,185,255'],[1000,700,'85,205,255'],[1410,420,'165,105,255'],[950,845,'70,185,255']]){const g=ctx.createRadialGradient(worldX(x),worldY(y),5,worldX(x),worldY(y),105);g.addColorStop(0,`rgba(${c},.18)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(worldX(x),worldY(y),105,0,Math.PI*2);ctx.fill();}ctx.restore();
 if(state.flags.crystal) arrow(1535,210,lang==='en'?'MOUNTAIN →':'BERGET →');
}
function drawMountain(){
 // forest floor and a readable S-shaped trail to the rope wall
 tileWorld('forest',1,0,0,1900,1300,105,105);
 const trail=[[16,150,1040],[16,260,1040],[17,370,1040],[14,480,1040],[15,590,1040],[16,700,1040],[17,810,1040],[18,810,930],[18,810,820],[18,810,710],[18,810,600],[18,810,490],[18,810,380],[15,920,280],[16,1030,280],[16,1140,280],[16,1250,280],[16,1360,280],[16,1470,280],[16,1580,280]];
 for(const [i,x,y] of trail) drawWorldExact('forest',i,x,y,112,112);
 // cliffs define the route; large masses stay at edges
 drawWorldComp('forest',38,45,90,325,325);
 drawWorldComp('forest',34,1080,110,185,210);drawWorldComp('forest',27,1265,110,190,215);drawWorldComp('forest',31,1455,110,185,210);
 drawWorldComp('forest',35,1110,735,210,190);drawWorldComp('forest',36,1350,740,205,190);
 // camp at trailhead, grouped logically
 drawWorldComp('forest',90,350,850,255,185);
 drawWorldComp('forest',93,615,930,115,105);
 drawWorldComp('forest',94,740,920,112,120);
 // rope bridge / wall aligned with climbing corridor at x 880-1010
 drawWorldComp('forest',74,850,690,205,270);
 drawWorldComp('forest',81,900,330,125,610);
 // summit shrine and flags
 drawWorldComp('forest',104,1400,115,235,205);
 drawWorldComp('forest',103,1428,120,150,165);
 drawWorldComp('forest',109,1640,155,88,190);
 // foliage only around edges
 drawWorldComp('forest',39,250,170,165,275);drawWorldComp('forest',40,1610,650,165,275);
 drawWorldComp('forest',42,1040,900,160,90);drawWorldComp('forest',42,1550,900,160,90);
 // Abdullah at camp, not blocking the path
 drawContactShadow(650,860,22,8,.18);drawWorldActor('abdullah',0,650,860,98);labelWorld(605,725,'Abdullah');
 if(!state.flags.rope) sparkle(650,810);
 if(state.flags.rope&&!state.flags.wind) sparkle(1450,220);
 if(state.flags.wind) arrow(1660,190,lang==='en'?'EMBER PEAK →':'EMBER PEAK →');
}
function drawVolcano(){
 // dark basalt floor with clear lava geometry and safe stone bridges
 tileInset('volcano',5,0,0,1900,1200,15,105,105);
 // horizontal lava river
 for(let x=420;x<1280;x+=100) drawWorldExact('volcano',34,x,680,102,110);
 // vertical branch
 for(let y=180;y<790;y+=100) drawWorldExact('volcano',35,1085,y,110,102);
 // two real stone crossings, visually matching the collision-safe routes
 drawWorldExact('volcano',72,830,675,105,120);
 drawWorldExact('volcano',72,1080,485,120,105);
 // camp left, grouped
 drawWorldComp('volcano',95,100,120,280,205);
 drawWorldComp('volcano',96,390,160,205,160);
 drawWorldComp('volcano',103,620,175,135,125);
 // arena on far right with altar/torches only
 drawWorldComp('volcano',109,1445,170,250,240);
 drawWorldComp('volcano',104,1430,480,78,135);
 drawWorldComp('volcano',104,1645,480,78,135);
 drawWorldComp('volcano',98,1440,770,240,185);
 // cliffs at perimeter, no random lava towers in walkable space
 drawWorldComp('volcano',71,55,760,245,310);
 drawWorldComp('volcano',68,310,805,185,270);
 drawWorldComp('volcano',115,1550,840,240,230);
 // boss readable, slightly bigger than Aya but not gigantic
 drawContactShadow(foxPos.x,foxPos.y+54,24,8,.22);drawWorldActor('fox',1,foxPos.x,foxPos.y+54,104,false,foxHit?0.55:1);
 if(!state.flags.fox) sparkle(foxPos.x,foxPos.y-15);
 if(state.flags.ember) arrow(1640,180,lang==='en'?'STAR TEMPLE →':'STAR TEMPLE →');
}
function drawTemple(){
 // clean luminous temple floor; symmetrical composition
 tileWorld('temple',5,0,0,1700,1050,110,110);
 // central aisle inlaid with star tiles
 for(let y=810;y>=380;y-=110) drawWorldExact('temple',9,795,y,110,110);
 // grand gate / altar at top center
 drawWorldComp('temple',36,680,55,340,320);
 // side arches and columns, mirrored with breathing room
 drawWorldComp('temple',37,155,225,250,340);drawWorldComp('temple',37,1295,225,250,340);
 drawWorldComp('temple',44,450,115,150,300);drawWorldComp('temple',39,1100,115,150,300);
 // banners hung at walls; never on top of columns
 drawWorldComp('temple',58,590,160,105,175);drawWorldComp('temple',58,1005,160,105,175);
 // two braziers flanking central approach
 drawWorldComp('temple',48,570,600,95,215);drawWorldComp('temple',48,1035,600,95,215);
 // ritual circle / sanctuary portal at lower center
 drawWorldComp('temple',79,710,690,280,150);
 drawWorldComp('temple',80,650,850,400,110);
 // small side statues/planters only against walls
 drawWorldComp('temple',81,120,760,86,105);drawWorldComp('temple',82,1495,760,86,105);
 // cats are cat-sized and placed beside, not inside, altar geometry
 drawContactShadow(820,470,13,5,.16);drawWorldActor('drmeow',0,820,470,58);
 drawContactShadow(1120,560,11,4,.14);drawWorldActor('namosh',0,1120,560,46);
 if(!state.flags.dr) sparkle(820,420);
 if(state.flags.dr&&!state.flags.rescued) sparkle(1120,520);
}
function drawSceneEffectsBack(){
 if(state.scene==='riverside'){
   ctx.save();for(let i=0;i<18;i++){const x=(i*211+state.play*10)%1580,y=120+(i*113)%980;ctx.fillStyle='rgba(255,244,180,.12)';ctx.beginPath();ctx.arc(worldX(x),worldY(y),1.5+(i%3),0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 if(state.scene==='grotto'){
   ctx.save();ctx.globalCompositeOperation='screen';for(const [x,y,c] of [[470,380,'100,220,255'],[1000,700,'100,190,255'],[1410,420,'175,115,255']]){const g=ctx.createRadialGradient(worldX(x),worldY(y),3,worldX(x),worldY(y),125);g.addColorStop(0,`rgba(${c},.28)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(worldX(x),worldY(y),125,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 if(state.scene==='volcano'){
   ctx.save();for(let i=0;i<32;i++){const x=(i*167+state.play*22)%1900,y=1150-((i*131+state.play*(24+i%5*5))%1050);ctx.fillStyle=`rgba(255,${95+i%3*35},35,${.28+i%4*.05})`;ctx.beginPath();ctx.arc(worldX(x),worldY(y),2+i%3,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 if(state.scene==='temple'){
   ctx.save();for(let i=0;i<22;i++){const x=80+(i*193)%1520,y=90+(i*137)%850;const a=.08+.06*Math.sin(state.play*1.4+i);ctx.fillStyle=`rgba(220,210,255,${a})`;ctx.beginPath();ctx.arc(worldX(x),worldY(y),1.5+(i%3),0,Math.PI*2);ctx.fill();}ctx.restore();
 }
}
function drawSceneEffectsFront(){
 // contact/ripple particles after player, before post-processing/HUD
 ctx.save();
 for(const r of fx.ripples){const t=1-r.life/r.max,rr=r.r+t*(r.big?55:30);ctx.globalAlpha=(1-t)*.45;ctx.strokeStyle='#e7fbff';ctx.lineWidth=r.big?3:2;ctx.beginPath();ctx.ellipse(worldX(r.x),worldY(r.y),rr,rr*.28,0,0,Math.PI*2);ctx.stroke();}
 for(const p of fx.splashes){ctx.globalAlpha=clamp(p.life/p.max,0,1)*.8;ctx.fillStyle='#eafbff';ctx.beginPath();ctx.arc(worldX(p.x),worldY(p.y),2.2,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
function sparkle(x,y){
 const sx=worldX(x),sy=worldY(y),r=10+4*Math.sin(titleT*5);
 ctx.save();ctx.translate(sx,sy);ctx.rotate(titleT);ctx.fillStyle='#ffe071';
 for(let i=0;i<4;i++){
   ctx.rotate(Math.PI/2);
   ctx.beginPath();ctx.moveTo(0,-r*2);ctx.lineTo(5,-5);ctx.lineTo(0,0);ctx.lineTo(-5,-5);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}
function arrow(x,y,s){
 ctx.fillStyle='#142d36dd';roundRect(worldX(x)-8,worldY(y)-25,160,48,12,true);
 ctx.strokeStyle='#f2d27c';ctx.lineWidth=2;roundRect(worldX(x)-8,worldY(y)-25,160,48,12,false,true);
 ctx.fillStyle='#fff';ctx.font='700 16px system-ui';ctx.textAlign='center';
 ctx.fillText(s,worldX(x)+72,worldY(y)+5);
}
function labelWorld(x,y,s){
 ctx.fillStyle='#0b1f26c9';roundRect(worldX(x)-8,worldY(y)-28,95,26,8,true);
 ctx.fillStyle='#fff7df';ctx.font='700 13px system-ui';ctx.textAlign='left';
 ctx.fillText(s,worldX(x),worldY(y)-10);
}

function nearbyPrompt(){
 const x=state.x,y=state.y,arr=[];
 if(state.scene==='apartment'){
   if(!state.flags.clueMat)arr.push([1085,350]);if(!state.flags.clueWindow)arr.push([1290,250]);if(!state.flags.clueBowl)arr.push([520,260]);arr.push([1350,170]);
 }else if(state.scene==='riverside'){arr.push([500,790],[1005,760]);}
 else if(state.scene==='moonshore')arr.push([1775,430]);
 else if(state.scene==='grotto')arr.push([470,380],[1000,700],[1410,420]);
 else if(state.scene==='mountain')arr.push([650,860],[1450,220]);
 else if(state.scene==='volcano')arr.push([foxPos.x,foxPos.y]);
 else if(state.scene==='temple')arr.push([820,470],[1120,560]);
 let best=null,bd=1e9;for(const p of arr){const dd=dist(x,y,p[0],p[1]);if(dd<bd){bd=dd;best=p;}}
 return bd<145?best:null;
}
function drawInteractBubble(){
 if(dialogue||isSwimming())return;const p=nearbyPrompt();if(!p)return;
 const sx=worldX(p[0]),sy=worldY(p[1]-62);ctx.save();ctx.fillStyle='#0a2027dc';roundRect(sx-24,sy-18,48,34,11,true);ctx.strokeStyle='#efd578';ctx.lineWidth=2;roundRect(sx-24,sy-18,48,34,11,false,true);ctx.fillStyle='#fff7df';ctx.textAlign='center';ctx.font='900 16px system-ui';ctx.fillText('E',sx,sy+5);ctx.restore();
}

function drawPlayer(){
 let idx=0,flip=false,w=60,h=96;
 const moving=(keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown||keys.KeyA||keys.KeyD||keys.KeyW||keys.KeyS);
 if(isSwimming()){
   const seq=[38,39,42,40,43,41];
   idx=seq[Math.floor(state.anim)%seq.length]; w=110;h=72; flip=state.dir==='right';
 } else if(isClimbing()){
   const seq=[50,51,52,53,54,55];
   idx=seq[Math.floor(state.anim)%seq.length]; w=54;h=108;
 } else if(state.dir==='left'){
   idx=moving?8+(Math.floor(state.anim)%8):8;
 } else if(state.dir==='right'){
   idx=moving?16+(Math.floor(state.anim)%8):16;
 } else {
   idx=moving?Math.floor(state.anim)%8:0;
 }
 const sx=worldX(state.x)-w/2, sy=worldY(state.y)-h/2;
 if(!isSwimming()) drawContactShadow(state.x,state.y+h*.28,isClimbing()?18:27,isClimbing()?6:9,.20);
 if(player.inv>0 && Math.floor(player.inv*12)%2===0) ctx.globalAlpha=.35;
 drawComp('aya',idx,sx,sy,w,h,flip);
 ctx.globalAlpha=1;
 if(player.atk>0){
   ctx.save();ctx.strokeStyle='#fff6b0';ctx.lineWidth=8;
   ctx.beginPath();ctx.arc(worldX(state.x),worldY(state.y),72,-.8,.8);ctx.stroke();ctx.restore();
 }
}
function drawHUD(){
 ctx.fillStyle='#0a2027e6';roundRect(18,18,470,112,18,true);
 ctx.strokeStyle='#e5c66f';ctx.lineWidth=3;roundRect(18,18,470,112,18,false,true);
 ctx.fillStyle='#fff7df';ctx.textAlign='left';ctx.font='900 27px Georgia';ctx.fillText(sceneName(),38,55);
 ctx.fillStyle='#f5d677';ctx.font='800 14px system-ui';ctx.fillText(T('objective')+':',38,84);
 ctx.fillStyle='#fff';ctx.font='700 16px system-ui';wrapText(objective(),38,106,430,20);

 for(let i=0;i<state.maxHearts;i++) heart(510+i*38,42,i<state.hearts?'#f15572':'#394750');

 const shards=[state.flags.water,state.flags.crystal,state.flags.wind,state.flags.ember];
 ctx.fillStyle='#0a2027d9';roundRect(W-270,18,250,80,16,true);
 ctx.strokeStyle='#e5c66f';ctx.lineWidth=2;roundRect(W-270,18,250,80,16,false,true);
 ctx.font='700 14px system-ui';ctx.fillStyle='#fff7df';ctx.textAlign='left';ctx.fillText('FOUR TRAILS',W-250,43);
 for(let i=0;i<4;i++){
   ctx.beginPath();ctx.arc(W-238+i*50,69,12,0,Math.PI*2);
   ctx.fillStyle=shards[i]?['#58bffa','#a66cff','#d8e7f5','#ff724f'][i]:'#20323b';ctx.fill();
   ctx.strokeStyle='#e5c66f';ctx.stroke();
 }
 ctx.fillStyle='#ffffffaa';ctx.font='700 12px system-ui';ctx.fillText(T('map')+'  •  '+T('pause'),W-250,92);
 if(state.scene==='moonshore'){const got=state.moonPearls.filter(Boolean).length;ctx.fillStyle='#0a2027d9';roundRect(W-270,106,250,40,12,true);ctx.fillStyle='#dffcff';ctx.font='700 13px system-ui';ctx.fillText('MOON PEARLS   '+got+' / 5',W-250,131);}

 if(!dialogue && !nearbyPrompt()){
   ctx.fillStyle='#0b1d24b8';roundRect(W-190,H-54,172,36,11,true);
   ctx.fillStyle='#fff';ctx.font='700 14px system-ui';ctx.textAlign='center';
   ctx.fillText(isSwimming()?'SPACE  SWIM STROKE':T('interact'),W-104,H-31);
 }
}
function heart(x,y,c){
 ctx.save();ctx.translate(x,y);ctx.fillStyle=c;ctx.beginPath();
 ctx.moveTo(0,10);ctx.bezierCurveTo(-24,-8,-29,15,0,34);ctx.bezierCurveTo(29,15,24,-8,0,10);
 ctx.fill();ctx.restore();
}
function wrapText(text,x,y,maxW,lineH){
 const words=String(text).split(' ');let line='',yy=y;
 for(const word of words){
   const t=line?line+' '+word:word;
   if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,yy);yy+=lineH;line=word;}
   else line=t;
 }
 if(line)ctx.fillText(line,x,yy);return yy;
}
function portraitSpec(p){
 const m={
  aya:['aya',0],hamdi:['hamdi',0],explorer:['explorer',1],abdullah:['abdullah',0],fox:['fox',1],drmeow:['drmeow',0],namosh:['namosh',0]
 };
 return m[p]||['aya',0];
}
function drawPortraitPanel(sheet,idx,x,y,w,h){
 const im=IMG[sheet];if(!im||!im.complete)return;
 const [x1,y1,x2,y2]=rectFor(sheet,idx),sw=x2-x1,sh=y2-y1;
 const cat=(sheet==='drmeow'||sheet==='namosh');
 const focusH=sh*(cat?.92:.70),srcY=y1,srcH=focusH;
 const ar=sw/srcH,targetAR=w/h;let dw,dh;
 if(ar>targetAR){dw=w;dh=w/ar;}else{dh=h;dw=h*ar;}
 ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.clip();
 const dx=x+(w-dw)/2,dy=y+h-dh+4;
 ctx.drawImage(im,x1,srcY,sw,srcH,dx,dy,dw,dh);ctx.restore();
}
function drawDialogue(){
 const y=H-205;
 ctx.fillStyle='#fff1ce';roundRect(155,y,1090,170,20,true);
 ctx.strokeStyle='#17303a';ctx.lineWidth=6;roundRect(155,y,1090,170,20,false,true);

 ctx.fillStyle='#0b222a';roundRect(25,y-60,180,220,22,true);
 ctx.strokeStyle='#e4c571';ctx.lineWidth=4;roundRect(25,y-60,180,220,22,false,true);

 const [sh,idx]=portraitSpec(dialogue.portrait);
 drawPortraitPanel(sh,idx,45,y-45,140,195);

 ctx.fillStyle='#102632';roundRect(185,y-38,240,50,12,true);
 ctx.fillStyle='#fff7df';ctx.textAlign='center';ctx.font='900 21px Georgia';
 ctx.fillText(dialogue.name,305,y-7);

 ctx.fillStyle='#21323c';ctx.textAlign='left';ctx.font='700 26px Georgia';
 wrapText(dialogue.lines[dialogueIndex],205,y+45,990,36);

 ctx.font='900 16px system-ui';ctx.fillStyle='#17303a';ctx.textAlign='right';
 ctx.fillText('E ▶',1210,y+142);
}
function drawMap(){
 ctx.fillStyle='#071a22ee';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#fff7df';ctx.textAlign='center';ctx.font='900 36px Georgia';
 ctx.fillText('THE FOUR TRAILS',W/2,70);
 const nodes=[
  ['apartment','HOME',170,340],['riverside','RIVERSIDE',360,340],['moonshore','MOONSHORE',560,340],
  ['grotto','GROTTO',750,340],['mountain','MOUNTAIN',930,250],['volcano','EMBER PEAK',1070,400],['temple','STAR TEMPLE',930,540]
 ];
 ctx.lineWidth=5;ctx.strokeStyle='#d2b25d';ctx.beginPath();
 nodes.forEach((n,i)=>{if(i===0)ctx.moveTo(n[2],n[3]);else ctx.lineTo(n[2],n[3]);});ctx.stroke();
 for(const [id,name,x,y] of nodes){
   ctx.beginPath();ctx.arc(x,y,28,0,Math.PI*2);
   ctx.fillStyle=id===state.scene?'#f6d36e':'#173440';ctx.fill();ctx.strokeStyle='#fff5d1';ctx.stroke();
   ctx.fillStyle='#fff';ctx.font='700 13px system-ui';ctx.fillText(name,x,y+55);
 }
 ctx.font='16px system-ui';ctx.fillStyle='#ffffffb0';ctx.fillText('M / ESC to close',W/2,670);
}
function drawPause(){
 ctx.fillStyle='#06151dda';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#fff7df';ctx.textAlign='center';ctx.font='900 46px Georgia';
 ctx.fillText(lang==='en'?'PAUSED':'PAUS',W/2,270);
 ctx.font='700 20px system-ui';
 ctx.fillText('ESC — '+(lang==='en'?'resume':'fortsätt'),W/2,330);
 ctx.fillText('L — '+T('lang'),W/2,366);
}
function drawEnding(){
 tileComp('temple',5,0,0,W,H,110,110);
 ctx.fillStyle='#06151dbb';ctx.fillRect(0,0,W,H);
 drawComp('aya',25,390,365,88,140);
 drawComp('namosh',0,590,430,46,62);
 drawComp('drmeow',0,785,405,58,82);
 drawComp('abdullah',0,950,382,70,122);

 ctx.fillStyle='#fff7df';ctx.textAlign='center';ctx.font='900 42px Georgia';
 const lines=T('ending').split('\n');
 lines.forEach((s,i)=>ctx.fillText(s,W/2,95+i*48));
 ctx.fillStyle='#f6d470';ctx.font='700 17px system-ui';ctx.fillText('Enter / Space',W/2,680);
}
function loop(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;
 update(dt);render();requestAnimationFrame(loop);
}

// QA helpers: ?scene=riverside&debug=1 opens an unlocked scene for visual inspection.
(function applyDebugScene(){
  const q=new URLSearchParams(location.search);const sc=q.get('scene');
  if(!sc||!sceneDims[sc]) return;
  const starts={apartment:[1000,650],riverside:[720,900],moonshore:[900,550],grotto:[430,650],mountain:[650,1080],volcano:[1280,560],temple:[850,780]};
  Object.assign(state.flags,{clueMat:true,clueWindow:true,clueBowl:true,hamdi:true,nemo:true,shell:true,water:true,crystal:true,rope:true,wind:true,ember:true});
  state.scene=sc;[state.x,state.y]=starts[sc];mode='game';ready=true;loaded=loadTotal;
})();

loadAll();
requestAnimationFrame(loop);
