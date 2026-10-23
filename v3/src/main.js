import {createHardwareStore,doorAt,fixtureAt,nearestOpen,walkable,key} from './world.js?v=exterior-windows-20261022-1';
import {makeGame,updateGame,applyPower,POWER_LIST,ITEMS} from './simulation.js?v=exterior-windows-20261022-1';
import {hasSave,loadGame,saveGame,unlockMap} from './persistence.js?v=exterior-windows-20261022-1';
import {createArtwork} from './artwork.js?v=exterior-windows-20261022-1';
import {renderDepth,compareRenderDepth} from './render-depth.js?v=exterior-windows-20261022-1';
import {formatGameTime,emotionState,POWER_HELP} from './hud.js?v=hud-20261022-1';
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
function drawHair(n,z,h){const hash=Number(String(n.id).replace(/[^0-9]/g,''))||0,style=n.role==='firefighter'?5:n.role==='police'?4:hash%6;const head=-h*z*.82;ctx.fillStyle='#11171b';ctx.strokeStyle='#101517';ctx.lineWidth=2*z;if(style===4||style===5){ctx.fillStyle=style===5?'#d4ba64':'#25394c';ctx.fillRect(-8*z,head-9*z,16*z,5*z);ctx.fillRect(-12*z,head-4*z,17*z,3*z)}else if(style===0){ctx.beginPath();ctx.arc(0,head-2*z,7*z,Math.PI,Math.PI*2);ctx.fill()}else if(style===1){ctx.beginPath();ctx.arc(0,head-3*z,7.5*z,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(6*z,head,4*z,9*z)}else if(style===2){ctx.fillRect(-7*z,head-9*z,14*z,4*z);ctx.fillRect(5*z,head-6*z,4*z,11*z)}else if(style===3){ctx.beginPath();ctx.arc(0,head-5*z,7*z,Math.PI,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(7*z,head-10*z,5*z,0,7);ctx.fill()}else{ctx.beginPath();ctx.arc(0,head-6*z,6*z,Math.PI,Math.PI*2);ctx.fill()}}
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
function inspect(x,y){if(!game)return;let w=game.world;let n=[...game.npcs].filter(n=>Math.hypot(n.rx-x,n.ry-y)<2).sort((a,b)=>Math.hypot(a.rx-x,a.ry-y)-Math.hypot(b.rx-x,b.ry-y))[0];
 let d=doorAt(w,x,y),f=fixtureAt(w,x,y),prop=w.props.filter(o=>Math.abs(o.x-x)<=Math.max(1,o.w||1)&&Math.abs(o.y-y)<=Math.max(1,o.h||1)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];let target=n||d||f||prop||{id:'tile-'+x+'-'+y,x,y,type:'tile'};selected=target;refreshHud()}
function portraitHTML(n){let angry=n.emotion.anger>=55,afraid=n.emotion.fear>=55,injured=n.health<35,mood=!n.alive?'Deceased':n.unconscious>0?'Unconscious':angry?'Angry':afraid?'Afraid':injured?'In pain':n.emotion.anger>25?'Irritated':'Calm';let brow=angry?'M24 39l11 5 M65 44l11-5':afraid?'M23 40l12-4 M65 36l12 4':'M24 38h12 M64 38h12';let mouth=angry?'M37 69q13-8 26 0':afraid?'M41 64q9-14 18 0':mood==='Calm'?'M39 61q11 10 22 0':'M39 66h22';let headwear=n.role==='police'?'<path d="M23 22h54v9H23z" fill="#203d65" stroke="#111"/><path d="M30 16h40v10H30z" fill="#203d65" stroke="#111"/>':n.role==='firefighter'?'<path d="M23 27q3-28 27-28t27 28z" fill="#e1bd53" stroke="#111"/><path d="M16 25h68v8H16z" fill="#c99b38" stroke="#111"/>':n.role==='paramedic'?'<path d="M22 22q28-29 56 0v10H22z" fill="#f7f9f6" stroke="#111"/><path d="M45 8h10v19H45z M39 14h22v7H39z" fill="#b5343b"/>':n.role==='employee'?'<path d="M27 22q22-22 46 0l-4 7H31z" fill="#262d33"/>':'<path d="M27 21q20-21 46 0l-3 6H30z" fill="#1d2429"/>';let vest=n.role==='employee'?'<path d="M23 96L16 118h68L77 96l-15-8H38z" fill="#d7353b" stroke="#111" stroke-width="3"/>':'';return '<div class="npcPortrait"><svg viewBox="0 0 100 125" role="img" aria-label="Portrait expressing '+mood+'"><path d="M22 123l8-30 20-7 20 7 8 30" fill="#15191d" stroke="#090d0f" stroke-width="4"/>'+vest+'<ellipse cx="50" cy="48" rx="31" ry="37" fill="#fff" stroke="#111" stroke-width="3"/><path d="'+brow+'" stroke="#111" stroke-width="3" fill="none"/><circle cx="32" cy="50" r="3" fill="#111"/><circle cx="68" cy="50" r="3" fill="#111"/><path d="'+mouth+'" stroke="#111" stroke-width="3" fill="none"/>'+headwear+'</svg><div><strong>'+escapeHTML(n.name)+'</strong><span>'+escapeHTML(n.role)+' · '+mood+'</span></div></div>'}
function refreshHud(){if(!game)return;const g=game,alive=g.npcs.filter(n=>n.alive).length;
 $('worldStatus').textContent='Living '+alive+'/'+g.npcs.length+' · God Energy '+Math.floor(g.energy)+' · '+(g.paused?'Paused':g.speed+'×')+' · '+Math.floor(g.elapsed)+'s';
 const panel=$('inspect');let html='<div class="tag">GOD ENERGY '+Math.floor(g.energy)+' · ALIVE '+alive+'</div>';
 if(selected){let n=g.npcs.find(o=>o.id===selected.id),f=g.world.fixtures.find(o=>o.id===selected.id),d=g.world.doors.find(o=>o.id===selected.id),prop=g.world.props.find(o=>o.id===selected.id);
 html+='<h3>'+escapeHTML(n?.name||f?.type||d?.label||prop?.type||'World tile')+'</h3>';
 if(n){html+=portraitHTML(n);html+='<p>'+escapeHTML(n.role)+' · '+(n.alive?(n.arrested?'Detained':n.unconscious>0?'Unconscious':escapeHTML(n.activity)):'Deceased')+'<br>Health '+Math.round(n.health)+' · Pain '+Math.round(n.pain)+' · Anger '+Math.round(n.emotion.anger)+' · Fear '+Math.round(n.emotion.fear)+'</p><p>Traits: '+Object.entries(n.traits).map(([k,v])=>k+' '+v).join(' · ')+'</p><p>Inventory: '+(n.inventory.map(id=>ITEMS.find(i=>i.id===id)?.name||id).join(', ')||'Empty')+'</p><p>Memory: '+escapeHTML(n.memory.slice(0,3).map(m=>m.text).join(' · ')||'None')+'</p>'}
 if(n&&n.duty){
  const job=n.duty==='cashier'?'Cashier':n.duty==='service'?'Customer service':n.duty==='floor'?'Floor associate':'Shopper';
  const routine=n.task?.kind||'Waiting for next task';
  const seconds=n.task?.phase==='working'?Math.max(0,Math.ceil((n.task.until||0)-g.elapsed)):null;
  html+='<p><strong>Assigned role:</strong> '+escapeHTML(job)+'<br><strong>Current task:</strong> '+escapeHTML(n.activity||routine)+
    (seconds!==null?' · '+seconds+'s remaining':'')+
    (n.role==='employee'&&n.breakAt?'<br><strong>Next break:</strong> '+Math.max(0,Math.ceil(n.breakAt-g.elapsed))+'s':'')+'</p>';
 }
 if(d)html+='<p>Animated '+d.type+' door · '+Math.round(d.open*100)+'% open</p>';
 if(f)html+='<p>'+escapeHTML(f.department||'Interactable fixture')+' · '+(f.damaged?'Damaged':'Functional')+'</p>';if(prop)html+='<p>'+escapeHTML(prop.type==='car'?'Vehicle — parked or responding':'Landscaping')+' · Ground position '+Math.round(prop.x)+', '+Math.round(prop.y)+'</p>';
 let type=n?'npc':f?'fixture':'tile';html+='<h3>God Powers</h3>';
 for(let power of POWER_LIST.filter(p=>p.targets.includes(type))){let disabled=g.energy<power.cost||!n?.alive&&!!n||g.paused||g.cooldowns[power.id]>g.elapsed;html+='<button style="display:block;width:100%;margin:5px 0" data-power="'+power.id+'" '+(disabled?'disabled':'')+'>'+escapeHTML(power.name)+' · '+power.cost+' energy</button>'}
 }
 html+='<h3>World Events</h3>'+g.log.slice(0,7).map(e=>'<p style="font-size:12px">'+escapeHTML(e.text)+'</p>').join('');
 panel.innerHTML=html;panel.querySelectorAll('[data-power]').forEach(b=>b.onclick=()=>{let out=applyPower(g,b.dataset.power,selected);$('worldStatus').textContent=out.message;refreshHud()});
 if(g.completed&&!resultShown){resultShown=true;showVictory()}
}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function showVictory(){const g=game;let overlay=document.createElement('div');overlay.className='screen';overlay.id='victoryOverlay';overlay.innerHTML='<div class="menuPanel"><h2>TOTAL ELIMINATION</h2><p>Every NPC on the map has died.</p><p>Deaths: '+g.stats.deaths+' · Chain reactions: '+g.stats.chains+'<br>God Powers: '+g.stats.powers+' · Time: '+Math.round(g.elapsed)+'s</p><button id="restartRound">Play Again</button><button id="freeplayRound">Continue Freeplay</button><button id="menuRound">Main Menu</button></div>';document.body.append(overlay);unlockMap('hardware-store');
 overlay.querySelector('#restartRound').onclick=()=>{overlay.remove();game=makeGame(createHardwareStore(),{staff:+$('setupStaff').value,customers:+$('setupCustomers').value});scene=game.world;resultShown=false;selected=null;centerCamera();refreshHud()};
 overlay.querySelector('#freeplayRound').onclick=()=>{overlay.remove();g.freeplay=true};
 overlay.querySelector('#menuRound').onclick=()=>{overlay.remove();show('mainMenu');refreshContinue()};
}
function inspectAtScreen(sx,sy){
 if(!game)return;
 const world=game.world,hits=[];
 const add=(target,d,priority)=>hits.push({target,d,priority});
 // Select the actual rendered object footprint, including tall/long shelving,
 // instead of rounding the click to a single ground tile.
 function boxHit(o,height=35,padding=5){
  const x=o.x,y=o.y,w=o.w||1,h=o.h||1;
  const pts=[
   project(x-.5,y-.5,0),project(x+w-.5,y-.5,0),
   project(x+w-.5,y+h-.5,0),project(x-.5,y+h-.5,0),
   project(x-.5,y-.5,height),project(x+w-.5,y-.5,height),
   project(x+w-.5,y+h-.5,height),project(x-.5,y+h-.5,height)
  ];
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),pad=padding*zoom;
  const inBox=sx>=Math.min(...xs)-pad&&sx<=Math.max(...xs)+pad&&sy>=Math.min(...ys)-pad&&sy<=Math.max(...ys)+pad;
  if(!inBox)return null;
  const middle=project(x+(w-1)*.5,y+(h-1)*.5,height*.5);
  return Math.hypot(sx-middle.x,sy-middle.y)/Math.max(1,(w+h)*zoom);
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
 hits.sort((a,b)=>a.d-b.d||a.priority-b.priority);
 if(hits.length){selected=hits[0].target;refreshHud();return}
 const tile=unproject(sx,sy);inspect(tile.x,tile.y)
}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y,moved:false}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>7)drag.moved=true;offset.x=drag.ox-dx/zoom;offset.y=drag.oy-dy/zoom});
canvas.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.moved){let rect=canvas.getBoundingClientRect(),tile=unproject(e.clientX-rect.left,e.clientY-rect.top);inspectAtScreen(e.clientX-rect.left,e.clientY-rect.top)}drag=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*(e.deltaY>0?.91:1.1),.32,2)},{passive:false});
function frame(now){let dt=Math.min(.08,(now-last)/1000);last=now;if(game&&!game.paused){acc+=dt*game.speed;let steps=0;while(acc>=1/30&&steps<16){updateGame(game,1/30);acc-=1/30;steps++}}render(now/1000);if(now-lastHud>300){refreshHud();lastHud=now}if(game&&!game.completed&&now-lastSave>30000){saveGame(game);lastSave=now}requestAnimationFrame(frame)}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));if(!game)return;const tab=b.dataset.tab;if(tab==='people'){let n=game.npcs.find(o=>o.alive);if(n)selected=n;refreshHud()}else if(tab==='powers'){const p=game.world.fixtures.find(o=>o.type==='shelf');if(p)selected=p;refreshHud()}else if(tab==='world'){selected=null;refreshHud()}else if(tab==='events'){selected=null;refreshHud();$('inspect').scrollIntoView({block:'nearest',behavior:'smooth'})}else if(tab==='settings'){document.querySelector('#saveV3').focus();$('worldStatus').textContent='Use Save, speed controls, or Main Menu in the top bar.'}}));
centerCamera();requestAnimationFrame(frame);
