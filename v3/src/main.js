import {createHardwareStore,doorAt,fixtureAt,nearestOpen,walkable,key} from './world.js?v=signs-walls-tiles-20261023-1';
import {makeGame,updateGame,applyPower,POWER_LIST,ITEMS} from './simulation.js?v=signs-walls-tiles-20261023-1';
import {hasSave,loadGame,saveGame,unlockMap} from './persistence.js?v=signs-walls-tiles-20261023-1';
import {createArtwork} from './artwork.js?v=signs-walls-tiles-20261023-1';
import {renderDepth,compareRenderDepth} from './render-depth.js?v=signs-walls-tiles-20261023-1';
import {formatGameTime,emotionState,POWER_HELP,hairAppearance,npcWeakness} from './hud.js?v=signs-walls-tiles-20261023-1';
import {hitProjectedFixture,isGroundTileTap,selectionLabel} from './selection.js?v=signs-walls-tiles-20261023-1';
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d');
let game=null,scene=createHardwareStore(),zoom=.72,offset={x:0,y:0},last=performance.now(),acc=0,lastHud=0,lastSave=0,lastViewport={w:0,h:0},drag=null,selected=null,resultShown=false,activeTab='world',selectedPowerId='whisper',pendingPower=null,feedback='';
const TW=48,TH=24,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const artwork=createArtwork(ctx,project,()=>zoom);
const view=()=>({w:canvas.clientWidth,h:canvas.clientHeight});
function show(screen){for(let id of ['mainMenu','howToPlayScreen','worldSetup'])$(id).classList.toggle('hidden',id!==screen)}
function setup(step){show('worldSetup');$('setupMapStep').hidden=step!==1;$('setupOptionsStep').hidden=step!==2;$('setupStepLabel').textContent='STEP '+step+' OF 2 · '+(step===1?'SELECT MAP':'NEW WORLD')}
$('startGame').onclick=()=>setup(1);$('howToPlayButton').onclick=()=>show('howToPlayScreen');$('howToBack').onclick=()=>show('mainMenu');$('setupBack').onclick=()=>{$('setupOptionsStep').hidden?show('mainMenu'):setup(1)};
$('mapHardware').onclick=()=>setup(2);$('home').onclick=()=>{if(game&&!game.completed)saveGame(game);show('mainMenu');refreshContinue()};
$('setupLaunch').onclick=()=>{scene=createHardwareStore();game=makeGame(scene,{staff:+$('setupStaff').value,customers:+$('setupCustomers').value,clockStartMinutes:+$('setupTime').value});selected=null;resultShown=false;pendingPower=null;feedback='';activateTab('world');show(null);centerCamera();refreshHud()};
$('continueGame').onclick=()=>{let restored=loadGame();if(!restored){$('continueGame').disabled=true;return}game=restored;scene=game.world;selected=null;resultShown=false;pendingPower=null;feedback='';activateTab('world');show(null);centerCamera();refreshHud()};
function refreshContinue(){$('continueGame').disabled=!hasSave()}
refreshContinue();
$('saveV3').onclick=()=>{if(!game)return;let ok=saveGame(game);feedback=ok?'Game saved.':'Save failed: browser storage unavailable';$('settingsFeedback').textContent=feedback;refreshContinue()};
$('pause').onclick=()=>{if(game){game.paused=!game.paused;$('pause').textContent=game.paused?'Resume':'Pause';refreshHud()}};
$('stopFollow').onclick=()=>clearSelection();
function activateTab(tab){
 activeTab=tab;
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 for(const name of ['world','people','powers','settings'])$(name+'Panel').classList.toggle('hidden',name!==tab);
}
function clearSelection(){selected=null;feedback='';$('stopFollow').classList.add('hidden');refreshHud()}
function selectTarget(obj){
 selected=obj;
 if(obj&&game?.npcs.some(n=>n.id===obj.id))activateTab('people');
 pendingPower=null;feedback='';
 refreshHud();
}

document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{if(!game)return;game.speed=+b.dataset.speed;document.querySelectorAll('[data-speed]').forEach(t=>t.classList.toggle('active',t===b))});
function centerCamera(){let v=view();zoom=Math.min(.87,Math.max(.43,Math.min(v.w/1300,v.h/870)));offset=iso(36,20)}
function followSelected(){const n=game?.npcs.find(o=>o.id===selected?.id);if(n){offset=iso(n.rx,n.ry);$('stopFollow').classList.remove('hidden')}else $('stopFollow').classList.add('hidden')}
function iso(x,y){return{x:(x-y)*TW*.5,y:-(x+y)*TH*.5}}
function project(x,y,z=0){let v=view(),p=iso(x,y);return{x:v.w*.5+(p.x-offset.x)*zoom,y:v.h*.56+(p.y-offset.y-z)*zoom}}
function unproject(sx,sy){let v=view(),px=(sx-v.w*.5)/zoom+offset.x,py=(sy-v.h*.56)/zoom+offset.y;return{x:Math.round(px/TW-py/TH),y:Math.round(-px/TW-py/TH)}}
function resize(){let dpr=Math.min(2,window.devicePixelRatio||1),v=view();if(lastViewport.w!==v.w||lastViewport.h!==v.h||canvas.width!==Math.round(v.w*dpr)){canvas.width=Math.round(v.w*dpr);canvas.height=Math.round(v.h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);lastViewport={...v}}}
function drawHair(n,z,h){
 const appearance=hairAppearance(n),style=appearance.style,c=appearance.color;
 const head=-h*z*.82;
 // Protect the role-specific helmets; civilian hair uses world-scale silhouettes.
 if(n.role==='police'||n.role==='firefighter'||n.role==='paramedic'){
  ctx.fillStyle=n.role==='firefighter'?'#cfb059':n.role==='police'?'#27465c':'#e6ebdc';
  ctx.fillRect(-8*z,head-9*z,16*z,6*z);ctx.fillRect(-11*z,head-4*z,20*z,3*z);return;
 }
 ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=3*z;
 const tuft=(x,y,r)=>{ctx.beginPath();ctx.arc(x*z,head+y*z,r*z,0,Math.PI*2);ctx.fill()};
 if(style==='buzz'){ctx.beginPath();ctx.ellipse(0,head-2*z,7*z,5*z,0,Math.PI,Math.PI*2);ctx.fill()}
 else if(style==='sidePart'){ctx.fillRect(-7*z,head-9*z,14*z,5*z);tuft(-6,-5,4)}
 else if(style==='curly'||style==='messy'){for(let k=0;k<6;k++)tuft(-7+k*2.8,-6-(k%3)*2,style==='curly'?3:3.4)}
 else if(style==='wavy'){ctx.fillRect(-7*z,head-9*z,14*z,5*z);tuft(-8,1,3);tuft(8,2,3)}
 else if(style==='bob'){ctx.fillRect(-8*z,head-7*z,16*z,9*z);tuft(0,-8,7)}
 else if(style==='ponytail'){tuft(0,-5,7);tuft(9,4,3);tuft(11,8,3)}
 else if(style==='bun'){tuft(0,-5,7);tuft(1,-13,4)}
 else if(style==='long'){ctx.fillRect(-8*z,head-7*z,16*z,13*z);tuft(0,-7,7)}
 else{tuft(0,-5,7);tuft(-4,-5,4)}
}
function stick(n,t){let p=project(n.rx,n.ry),z=zoom*(n.role==='customer'||n.role==='employee'?1:1.07),moving=n.path.length>0,step=moving?Math.sin(t*10+n.id.length):0,h=n.unconscious>0?5:35;ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#121a1c';ctx.lineWidth=2.6*z;ctx.lineCap='round';ctx.fillStyle='#121b2380';ctx.beginPath();ctx.ellipse(0,2*z,10*z,4*z,0,0,7);ctx.fill();if(!n.alive){ctx.rotate(Math.PI/2);ctx.translate(0,9*z)}if(n.unconscious>0){ctx.rotate(1.4);ctx.translate(0,9*z)}
 const leg=h*.45*z;ctx.beginPath();ctx.moveTo(0,-h*z*.56);ctx.lineTo(0,-10*z);ctx.moveTo(0,-10*z);ctx.lineTo((-7+step*4)*z,0);ctx.moveTo(0,-10*z);ctx.lineTo((7-step*4)*z,0);const pose=n.action||'idle',wave=Math.sin((n.actionPhase||0)*7),bob=moving?Math.sin(t*12+n.id.length)*1.4:0;
 ctx.moveTo(0,-h*z*.45);
 if(pose==='offerHelp')ctx.lineTo((-10-2*wave)*z,(-34+3*wave)*z);
 else if(pose==='scan'||pose==='type')ctx.lineTo((-12-2*wave)*z,(-12+3*wave)*z);
 else if(pose==='inspect'||pose==='stock')ctx.lineTo((-13-2*wave)*z,(-20-4*wave)*z);
 else if(pose==='drink')ctx.lineTo(-4*z,-h*z*.66);
 else ctx.lineTo((-10-step*3)*z,(-19+bob)*z);
 ctx.moveTo(0,-h*z*.45);
 if(pose==='offerHelp')ctx.lineTo((10+2*wave)*z,(-23+4*wave)*z);
 else if(pose==='scan')ctx.lineTo((13+3*wave)*z,(-11+4*wave)*z);
 else if(pose==='type')ctx.lineTo((11-2*wave)*z,(-12+2*wave)*z);
 else if(pose==='inspect'||pose==='stock')ctx.lineTo((10+3*wave)*z,(-26+3*wave)*z);
 else if(pose==='talk')ctx.lineTo((10+3*wave)*z,(-18+3*wave)*z);
 else ctx.lineTo((9+step*3)*z,(-19+bob)*z);
 ctx.stroke();ctx.fillStyle='#f8faf7';ctx.strokeStyle='#0c1416';ctx.lineWidth=2*z;ctx.beginPath();ctx.arc(0,-h*z*.82,7*z,0,Math.PI*2);ctx.fill();ctx.stroke();if(n.role==='employee'){
  // Two tailored red vest panels, shoulder seams, a V-neck and an open black center.
  ctx.lineWidth=1.15*z;ctx.strokeStyle='#171a1c';ctx.fillStyle='#c92f38';
  ctx.beginPath();
  ctx.moveTo(-6.7*z,-h*z*.55);ctx.lineTo(-2.2*z,-h*z*.50);
  ctx.lineTo(-.9*z,-h*z*.32);ctx.lineTo(-1.3*z,-h*z*.18);
  ctx.lineTo(-5.5*z,-h*z*.18);ctx.lineTo(-7.0*z,-h*z*.37);ctx.closePath();
  ctx.fill();ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6.7*z,-h*z*.55);ctx.lineTo(2.2*z,-h*z*.50);
  ctx.lineTo(.9*z,-h*z*.32);ctx.lineTo(1.3*z,-h*z*.18);
  ctx.lineTo(5.5*z,-h*z*.18);ctx.lineTo(7.0*z,-h*z*.37);ctx.closePath();
  ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f17e78';ctx.lineWidth=.9*z;
  ctx.beginPath();ctx.moveTo(-5.5*z,-h*z*.21);ctx.lineTo(-5*z,-h*z*.29);
  ctx.moveTo(5.5*z,-h*z*.21);ctx.lineTo(5*z,-h*z*.29);ctx.stroke();
  ctx.fillStyle='#f0e9df';ctx.fillRect(2.3*z,-h*z*.42,3.3*z,2*z);
}
 if(n.alive&&n.unconscious<=0&&n.action==='scan'){
  ctx.fillStyle='#3c5c66';ctx.fillRect((9+Math.sin((n.actionPhase||0)*7)*3)*z,-12*z,5*z,7*z);
  ctx.fillStyle='#9ac9cd';ctx.fillRect(10*z,-11*z,3*z,2*z);
 }else if(n.alive&&n.unconscious<=0&&n.action==='drink'){
  ctx.fillStyle='#ddd1b3';ctx.fillRect(-5*z,-h*z*.70,5*z,6*z);
  ctx.fillStyle='#b0dce1';ctx.fillRect(-5*z,-h*z*.70,5*z,2*z);
 }
 drawHair(n,z,h);ctx.restore();
 if(n.alive&&n.unconscious<=0&&n.action==='offerHelp'&&n.task?.kind==='help'){
  ctx.save();ctx.font=`bold ${Math.max(8,9*z)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';
  const bw=39*z,bh=16*z,bx=p.x-bw/2,by=p.y-60*z;
  ctx.fillStyle='#e9f1e9';ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle='#5b7779';ctx.lineWidth=1.4*z;ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle='#294a4e';ctx.fillText('HELP?',p.x,by+bh*.5,bw-5*z);ctx.restore();
 }
 if(n.alive&&n.unconscious<=0&&n.cleaning){artwork.drawCleaningSet(n.rx,n.ry,n.cleaningPhase||0)}
 else if(n.alive&&n.unconscious<=0&&n.inventory?.length&&(n.role!=='employee'||!['cashier','service','patrol','break','help'].includes(n.task?.kind))){artwork.drawItem(n.inventory[0],n.rx+.28,n.ry+.12,15,.66)}
 if(selected?.id===n.id){ctx.strokeStyle='#f5de79';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,14*z,7*z,0,0,7);ctx.stroke()}
}
function drawHazard(h,t){let p=project(h.x,h.y),z=zoom;ctx.save();if(h.kind==='fire'){for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#ed743f':i===1?'#ffc15e':'#fae2a5';ctx.beginPath();ctx.ellipse(p.x+(i-1)*6*z,p.y-11*z-Math.sin(t*8+i)*3*z,7*z,15*z,0,0,Math.PI*2);ctx.fill()}}else if(h.kind==='spill'){ctx.fillStyle='#75bdbaad';ctx.beginPath();ctx.ellipse(p.x,p.y,19*z,6*z,0,0,7);ctx.fill()}else{ctx.strokeStyle=h.kind==='electric'?'#f4da78':'#e8b0a1';ctx.lineWidth=3*z;ctx.beginPath();ctx.moveTo(p.x-9*z,p.y);ctx.lineTo(p.x,p.y-17*z);ctx.lineTo(p.x+3*z,p.y-5*z);ctx.lineTo(p.x+14*z,p.y-20*z);ctx.stroke()}ctx.restore()}
const departmentSigns=[
 {x:5.5,y:16.5,name:'PAINT',accent:'#b75e4f'},
 {x:11.5,y:16.5,name:'TOOLS',accent:'#b88e56'},
 {x:17.5,y:16.5,name:'ELECTRICAL',accent:'#c9a946'},
 {x:23.5,y:16.5,name:'PLUMBING',accent:'#5e90b0'},
 {x:29.5,y:16.5,name:'HARDWARE',accent:'#688779'},
 {x:10,y:12.3,name:'CHECKOUT',accent:'#b75e4f'},
 {x:31.5,y:12.3,name:'SERVICE',accent:'#558c9a'},
 {x:14,y:34,name:'LUMBER',accent:'#b58a5b'},
 {x:28.5,y:38.2,name:'RECEIVING',accent:'#c08b55'},
 {x:42.7,y:29,name:'GARDEN',accent:'#63905b'}
];
function render(t){
 resize();
 const viewport=view(),world=game?.world||scene;
 ctx.fillStyle='#263b39';ctx.fillRect(0,0,viewport.w,viewport.h);
 artwork.drawFloor(world,viewport);
 const items=[
  ...world.fixtures.map(o=>({kind:'fixture',depth:renderDepth('fixture',o),fn:()=>artwork.drawFixture(o)})),
  ...world.doors.map(o=>({kind:'door',depth:renderDepth('door',o),fn:()=>artwork.drawDoor(o,t)})),
  ...[...world.walls.values()].map(o=>({kind:'wall',depth:renderDepth('wall',o),fn:()=>artwork.drawWall(o,world)})),
  ...world.props.map(o=>({kind:'vehicle',depth:renderDepth('vehicle',o),fn:()=>o.type==='wetFloorSign'?artwork.drawWetFloorSign(o.x,o.y):artwork.drawVehicle(o,t)})),
  ...(world.drops||[]).map(o=>({kind:'item',depth:renderDepth('item',o),fn:()=>artwork.drawDrop(o)})),
  ...departmentSigns.map(o=>({kind:'sign',depth:renderDepth('sign',o)+.1,fn:()=>artwork.drawDepartmentSign(o.x,o.y,o.name,o.accent)})),
  ...world.hazards.filter(h=>h.kind==='spill'&&h.beingCleaned&&h.life>0).map(h=>({kind:'sign',depth:renderDepth('sign',h)+.2,fn:()=>artwork.drawWetFloorSign(h.x,h.y)})),
  ...(game?game.npcs.map(o=>({kind:'npc',depth:renderDepth('npc',o),fn:()=>stick(o,t)})):[]),
  ...world.hazards.map(o=>({kind:'hazard',depth:renderDepth('hazard',o),fn:()=>drawHazard(o,t)}))
 ];
 items.sort(compareRenderDepth);for(const item of items)item.fn();
 if(selected){const p=project(selected.x,selected.y);ctx.strokeStyle='#ffe69c';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,9*zoom,5*zoom,0,0,Math.PI*2);ctx.stroke()}
}
function inspect(x,y){
 if(!game)return;
 // Explicit ground fallback: a floor tap never silently selects a nearby
 // shelf or NPC simply because its model occupies a tall bounding box.
 selectTarget({id:'tile-'+x+'-'+y,x,y,type:'tile'});
}
function portraitHTML(n){
 const mood=emotionState(n),{color,style}=hairAppearance(n);
 const angry=['Furious','Irritated'].includes(mood),fear=['Terrified','Nervous'].includes(mood);
 const stressed=['Stressed','Uneasy'].includes(mood);
 const brow=angry?'M24 40l12 5 M64 45l12-5':fear?'M24 41l12-6 M64 35l12 6':
  stressed?'M23 39q7-7 13 0 M64 39q7-7 13 0':'M24 38q6-3 12 0 M64 38q6-3 12 0';
 const eyes=!n.alive?'<path d="M28 49l10 6m0-6-10 6 M62 49l10 6m0-6-10 6" stroke="#202a2a" stroke-width="3"/>':
  fear?'<ellipse cx="33" cy="51" rx="4.5" ry="7" fill="#172326"/><ellipse cx="67" cy="51" rx="4.5" ry="7" fill="#172326"/>':
  stressed?'<ellipse cx="33" cy="52" rx="3" ry="3.8"/><ellipse cx="67" cy="52" rx="3" ry="3.8"/>':
  '<circle cx="33" cy="51" r="3.1"/><circle cx="67" cy="51" r="3.1"/>';
 const mouth=!n.alive?'M39 70h22':angry?'M36 73q14-17 28 0':fear?'M42 67q8-13 16 0q-8 19-16 0':
  stressed?'M38 72q12-7 24 0':mood==='Calm'?'M36 63q14 15 28 0':'M39 69q11 5 22 0';
 const hairShape=style==='buzz'?'<path d="M20 38q0-42 30-42t30 42q-13-25-30-25T20 38"/>':
  style==='bun'?'<circle cx="51" cy="4" r="13"/><path d="M19 38Q14-4 50-5q37 1 32 43-12-28-32-27-19 0-31 27"/>':
  style==='ponytail'?'<path d="M18 35Q13-5 50-6q36 0 32 38l-10-15-47 0z"/><path d="M77 10q23 10 15 43l-11-8 1-24z"/>':
  style==='long'||style==='bob'?'<path d="M18 40Q7-6 50-7q43 1 33 45l2 43H70V31Q49 12 30 30v51H15z"/>':
  style==='curly'?'<path d="M15 41Q4 16 21 8Q18-13 40-7Q58-21 69-5Q89-7 88 13Q100 35 81 43L73 23Q50 11 27 25z"/>':
  style==='wavy'?'<path d="M16 43Q6 2 32-5Q62-20 82 11l2 31-10 17-6-30Q45 13 29 30l-6 29z"/>':
  style==='messy'?'<path d="M12 37l9-26 13-14 8 7 9-16 11 15 18-1 9 30-18-9Q47 6 26 29z"/>':
  '<path d="M19 38Q11-5 50-7q38 0 31 45l-9-15Q50 12 28 26z"/>';
 const helmet=n.role==='police'?'<path d="M22 20h56v10H22z" fill="#25435c"/>':
  n.role==='firefighter'?'<path d="M17 30Q23-8 50-8T83 30z" fill="#d6b753"/>':
  n.role==='paramedic'?'<path d="M23 21Q50-7 77 21v9H23z" fill="#e9f1ec"/>':'';
 const vest=n.role==='employee'?'<path d="M23 96L16 118h68L77 96l-15-8H38z" fill="#c9323c" stroke="#182025" stroke-width="3"/>':'';
 const extra=fear?'<path d="M77 56q5 8 0 14" stroke="#65aeca" stroke-width="3" fill="none"/>':
  angry?'<path d="M21 61l-6 8 M78 61l6 8" stroke="#c97669" stroke-width="2"/>':
  stressed?'<path d="M80 48q5 12-1 21" stroke="#7bb7c4" stroke-width="2" fill="none"/>':'';
 return '<div class="npcPortrait mood-'+escapeHTML(mood.toLowerCase())+'"><svg viewBox="0 0 100 125" role="img" aria-label="Portrait expressing '+escapeHTML(mood)+'">'+
  '<path d="M22 123l8-30 20-7 20 7 8 30" fill="#202b32" stroke="#0a1114" stroke-width="4"/>'+vest+
  '<ellipse cx="50" cy="48" rx="31" ry="37" fill="#f7f4eb" stroke="#293436" stroke-width="3"/>'+
  '<g fill="#18252a">'+eyes+'</g><path d="'+brow+'" stroke="#283032" stroke-width="3.5" fill="none"/>'+
  '<path d="'+mouth+'" stroke="#4b292c" stroke-width="3.2" fill="none"/>'+extra+
  '<g fill="'+color+'" stroke="'+color+'" stroke-width="2">'+hairShape+'</g>'+helmet+
  '</svg><div><strong>'+escapeHTML(n.name)+'</strong><span>'+escapeHTML(n.role)+' · '+escapeHTML(mood)+'</span></div></div>';
}
function powerUsable(p,n=null){
 return !!game&&!game.paused&&game.energy>=p.cost&&!(game.cooldowns[p.id]>game.elapsed)&&(!n||(n.alive&&!n.arrested));
}
function refreshHud(){
 if(!game)return;
 const g=game,alive=g.npcs.filter(n=>n.alive).length;
 $('selectedLabel').textContent=selected?(g.npcs.find(n=>n.id===selected.id)?.name||selectionLabel(g.world,selected)):'';
 $('selectedLabel').classList.toggle('hidden',!selected);
 $('gameClock').textContent=formatGameTime(g);
 $('pause').textContent=g.paused?'Resume':'Pause';
 $('worldStatus').textContent='Living '+alive+'/'+g.npcs.length+' · God Energy '+Math.floor(g.energy)+' · '+(g.paused?'Paused':g.speed+'×')+(pendingPower?' · Tap a target for '+POWER_LIST.find(p=>p.id===pendingPower)?.name:'');
 $('stopFollow').classList.toggle('hidden',!g.npcs.some(n=>n.id===selected?.id));
 $('settingsFeedback').textContent=feedback;
 $('worldEvents').innerHTML=g.log.slice(0,12).map(e=>'<p class="personFacts">'+escapeHTML(e.text)+'</p>').join('')||'<p>No events yet.</p>';
 const parent=$('gamePanel'),previousScroll=parent.scrollTop;
 const people=$('peopleContent');
 const n=g.npcs.find(o=>o.id===selected?.id);
 if(n){
  const job=n.duty==='cashier'?'Cashier':n.duty==='service'?'Customer service':n.duty==='floor'?'Floor associate':n.role==='customer'?'Customer':n.role;
  let html='<div class="personHeader"><h3>Person Overview</h3><button id="backPeople">← All People</button></div>';
  html+=portraitHTML(n);
  html+='<div class="personFacts"><p><strong>Emotion:</strong> '+escapeHTML(emotionState(n))+
   '<br>Anger '+Math.round(n.emotion.anger)+' · Fear '+Math.round(n.emotion.fear)+' · Stress '+Math.round(n.emotion.stress)+
   '</p><p><strong>Currently:</strong> '+escapeHTML(n.alive?n.activity:'Deceased')+
   '<br><strong>Role:</strong> '+escapeHTML(job)+
   '<br><strong>Health:</strong> '+Math.round(n.health)+' · Pain '+Math.round(n.pain)+
   '</p><p><strong>Traits:</strong> '+escapeHTML(Object.entries(n.traits).map(([k,v])=>k+' '+v).join(' · '))+
   '</p><p><strong>Inventory:</strong> '+escapeHTML((n.inventory||[]).map(id=>ITEMS.find(i=>i.id===id)?.name||id).join(', ')||'Empty')+
   '</p><p><strong>Recent memory:</strong> '+escapeHTML((n.memory||[]).slice(0,3).map(m=>m.text).join(' · ')||'None')+'</p></div>';
  html+='<h3>God Powers</h3><div class="personPowers">'+POWER_LIST.filter(p=>p.targets.includes('npc')).map(p=>
   '<button data-npc-power="'+p.id+'" '+(powerUsable(p,n)?'':'disabled')+'>'+escapeHTML(p.name)+' · '+p.cost+' Energy</button>').join('')+'</div>';
  html+='<button id="clearPerson" class="actionWide">Stop Following / Unselect</button>';
  if(feedback)html+='<p class="gameMessage">'+escapeHTML(feedback)+'</p>';
  people.innerHTML=html;
  people.querySelector('#backPeople').onclick=clearSelection;
  people.querySelector('#clearPerson').onclick=clearSelection;
  people.querySelectorAll('[data-npc-power]').forEach(b=>b.onclick=()=>{
   const out=applyPower(g,b.dataset.npcPower,n);feedback=out.message;refreshHud();
  });
 }else{
  people.innerHTML='<h3>People · '+g.npcs.length+' in this round</h3>'+
   g.npcs.map(p=>'<button class="personRow" data-person="'+escapeHTML(p.id)+'">'+
    '<strong>'+escapeHTML(p.name)+'</strong><small>'+
    escapeHTML(p.role)+' · '+escapeHTML(emotionState(p))+
    '<br><strong>Weakness:</strong> '+escapeHTML(npcWeakness(p))+
    '<br>'+escapeHTML(p.alive?p.activity:'Deceased')+'</small></button>').join('')+
   (feedback?'<p class="gameMessage">'+escapeHTML(feedback)+'</p>':'');
  people.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{
   const person=g.npcs.find(p=>p.id===b.dataset.person);if(person)selectTarget(person);
  });
 }
 const powers=$('powersContent');
 powers.innerHTML='<h3>God Energy: '+Math.floor(g.energy)+'</h3>'+
  POWER_LIST.map(p=>{
   const open=selectedPowerId===p.id;
   const help=POWER_HELP[p.id]||['Influence the world.','Tap a valid target.'];
   return '<button class="powerRow '+(open?'active':'')+'" data-select-power="'+p.id+'" aria-expanded="'+open+'"><span>'+
    escapeHTML(p.name)+'</span><strong>'+p.cost+' Energy</strong></button>'+
    (open?'<div class="powerDescription"><strong>'+escapeHTML(p.name)+'</strong>'+
     '<p>'+escapeHTML(help[0])+'</p><p>'+escapeHTML(help[1])+'</p>'+
     (g.cooldowns[p.id]>g.elapsed?'<p>Cooldown: '+Math.ceil(g.cooldowns[p.id]-g.elapsed)+'s</p>':'')+
     '<button id="armPower" class="actionWide" '+(powerUsable(p)?'':'disabled')+'>'+
     (pendingPower===p.id?'Cancel Power':'Use Power · Tap Target')+'</button></div>':'');
  }).join('')+(feedback?'<p class="gameMessage">'+escapeHTML(feedback)+'</p>':'');
 powers.querySelectorAll('[data-select-power]').forEach(b=>b.onclick=()=>{
  selectedPowerId=selectedPowerId===b.dataset.selectPower?null:b.dataset.selectPower;
  pendingPower=null;feedback='';refreshHud();
 });
 const activate=powers.querySelector('#armPower');
 if(activate)activate.onclick=()=>{
  pendingPower=pendingPower===selectedPowerId?null:selectedPowerId;
  feedback=pendingPower?'Power ready. Tap a valid target in the world.':'Power cancelled.';
  refreshHud();
 };
 parent.scrollTop=previousScroll;
 if(g.completed&&!resultShown){resultShown=true;showVictory()}
}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function showVictory(){const g=game;let overlay=document.createElement('div');overlay.className='screen';overlay.id='victoryOverlay';overlay.innerHTML='<div class="menuPanel"><h2>TOTAL ELIMINATION</h2><p>Every NPC on the map has died.</p><p>Deaths: '+g.stats.deaths+' · Chain reactions: '+g.stats.chains+'<br>God Powers: '+g.stats.powers+' · Time: '+Math.round(g.elapsed)+'s</p><button id="restartRound">Play Again</button><button id="freeplayRound">Continue Freeplay</button><button id="menuRound">Main Menu</button></div>';document.body.append(overlay);unlockMap('hardware-store');
 overlay.querySelector('#restartRound').onclick=()=>{overlay.remove();game=makeGame(createHardwareStore(),{staff:+$('setupStaff').value,customers:+$('setupCustomers').value,clockStartMinutes:+$('setupTime').value});scene=game.world;resultShown=false;selected=null;pendingPower=null;feedback='';activateTab('world');centerCamera();refreshHud()};
 overlay.querySelector('#freeplayRound').onclick=()=>{overlay.remove();g.freeplay=true};
 overlay.querySelector('#menuRound').onclick=()=>{overlay.remove();show('mainMenu');refreshContinue()};
}
function inspectAtScreen(sx,sy){
 if(!game)return;
 const world=game.world,hits=[];
 const add=(target,d,priority)=>hits.push({target,d,priority});
 // Select the actual rendered object footprint, including tall/long shelving,
 // instead of rounding the click to a single ground tile.
 function boxHit(o,height=35){
  return hitProjectedFixture(o,sx,sy,project,height);
 }
 for(const n of world?game.npcs:[]){
  const p=project(n.rx,n.ry,19),d=Math.hypot(sx-p.x,sy-p.y);
  if(d<Math.max(16,24*zoom))add(n,d*.3,0);
 }
 for(const d of world.doors){
  const hit=boxHit(d,d.type==='rollup'?53:48,10);
  if(hit!==null)add(d,hit,1);
 }
 for(const f of world.fixtures){
  const tall=['lockers','vending','drinkCooler','shelf','hardwareBins'].includes(f.type);
  const hit=boxHit(f,tall?49:35,5);
  if(hit!==null)add(f,hit,2);
 }
 for(const v of world.props){
  const hit=boxHit(v,v.type==='tree'?75:v.type==='shrub'?20:26,7);
  if(hit!==null)add(v,hit,3);
 }
 for(const d of world.drops||[]){
  const hit=boxHit(d,10,5);
  if(hit!==null)add(d,hit,4);
 }
 // If an NPC and a tall fixture overlap on screen, favor the nearby NPC.
 // This makes tapping a person reliably open their overview/follow mode.
 hits.sort((a,b)=>(a.priority===0?0:1)-(b.priority===0?0:1)||a.d-b.d||a.priority-b.priority);
 const tile=unproject(sx,sy);
 if(pendingPower){
  const power=POWER_LIST.find(p=>p.id===pendingPower);
  const picked=hits[0]?.target;
  const npc=game.npcs.find(n=>n.id===picked?.id);
  const fixture=game.world.fixtures.find(f=>f.id===picked?.id);
  // Environmental hazards must originate on a walkable tile even when
  // the player tapped the graphic of a neighboring fixture.
  const target=power?.id==='hazard'?nearestOpen(world,tile.x,tile.y):
   (npc||fixture||{type:'tile',x:tile.x,y:tile.y,id:'tile-'+tile.x+'-'+tile.y});
  const out=applyPower(game,pendingPower,target);
  feedback=out.message;
  if(out.ok)pendingPower=null;
  refreshHud();
  return;
 }
 // Open floor tiles win over the projected *upper part* of adjacent shelves.
 // Actual NPC taps are still first priority, so selection/follow feels natural.
 if(!hits.some(hit=>hit.priority===0)&&
    isGroundTileTap(world,tile.x,tile.y,sx,sy,project,zoom)){
  inspect(tile.x,tile.y);return;
 }
 if(hits.length){selectTarget(hits[0].target);return}
 inspect(tile.x,tile.y)
}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y,moved:false}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>7)drag.moved=true;if(game?.npcs.some(n=>n.id===selected?.id))return;offset.x=drag.ox-dx/zoom;offset.y=drag.oy-dy/zoom});
canvas.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.moved){let rect=canvas.getBoundingClientRect(),tile=unproject(e.clientX-rect.left,e.clientY-rect.top);inspectAtScreen(e.clientX-rect.left,e.clientY-rect.top)}drag=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(e.deltaY>0?.91:1.1),.32,2)},{passive:false});
function frame(now){
 const dt=Math.min(.08,(now-last)/1000);last=now;
 if(game&&!game.paused){
  acc+=dt*game.speed;let steps=0;
  while(acc>=1/30&&steps<16){updateGame(game,1/30);acc-=1/30;steps++}
 }
 // Animation and clock run on simulation time. Drawing keeps refreshing but
 // its positions and oscillations never advance while the round is paused.
 followSelected();
 render(game?.elapsed||0);
 if(now-lastHud>300){refreshHud();lastHud=now}
 if(game&&!game.completed&&now-lastSave>30000){saveGame(game);lastSave=now}
 requestAnimationFrame(frame)
}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{
 activateTab(button.dataset.tab);
 feedback='';
 refreshHud();
}));
centerCamera();requestAnimationFrame(frame);
