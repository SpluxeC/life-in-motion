import {createHardwareStore,doorAt,fixtureAt,nearestOpen,walkable,key} from './world.js?v=forklift-cab-wheel-align-20261023-2';
import {makeGame,updateGame,applyPower,POWER_LIST,ITEMS} from './simulation.js?v=forklift-cab-wheel-align-20261023-2';
import {hasSave,loadGame,saveGame,unlockMap} from './persistence.js?v=forklift-cab-wheel-align-20261023-2';
import {createArtwork} from './artwork.js?v=forklift-cab-wheel-align-20261023-2';
import {renderDepth,compareRenderDepth} from './render-depth.js?v=forklift-cab-wheel-align-20261023-2';
import {formatGameTime,emotionState,POWER_HELP,hairAppearance,npcWeakness} from './hud.js?v=forklift-cab-wheel-align-20261023-2';
import {hitProjectedFixture,isGroundTileTap,selectionLabel} from './selection.js?v=forklift-cab-wheel-align-20261023-2';
import {signOpacity} from './sign-visibility.js?v=forklift-cab-wheel-align-20261023-2';
import {npcLimbPose} from './npc-pose.js?v=forklift-cab-wheel-align-20261023-2';
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
 const {color,style}=hairAppearance(n),dir=n.facing==='left'?-1:1,head=-h*z*.82;
 ctx.save();ctx.scale(dir,1);
 const point=(x,y)=>({x:x*z,y:head+y*z});
 const oval=(x,y,rx,ry,fill)=>{
  ctx.beginPath();ctx.ellipse(x*z,head+y*z,rx*z,ry*z,0,0,Math.PI*2);
  ctx.fillStyle=fill;ctx.fill();
 };
 const shape=(pts,fill)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>{
   const p=point(x,y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);
  });
  ctx.closePath();ctx.fillStyle=fill;ctx.fill();
 };
 const stroke=(pts,ink,w=1)=>{
  ctx.beginPath();pts.forEach(([x,y],i)=>{
   const p=point(x,y);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);
  });ctx.strokeStyle=ink;ctx.lineWidth=w*z;ctx.stroke();
 };
 if(n.role==='firefighter'){
  oval(0,-5,8,5,'#be913b');
  shape([[-8,-5],[-6,-11],[-2,-14],[3,-14],[8,-9],[9,-3],[-8,-3]],'#e0b441');
  shape([[5,-5],[11,-3],[10,2],[6,4]],'#af832e');
  stroke([[-1,-13],[2,-9],[3,-4]],'#ffe08a',1.7);
  shape([[-3,-6],[3,-6],[3,-3],[-3,-3]],'#e6d28b');
  stroke([[-9,-2],[11,-2]],'#5c4f3d',2.4);
  stroke([[-4,0],[-2,5],[5,4]],'#404a48',1.1);
 }else if(n.role==='police'){
  shape([[-7,-5],[-6,-11],[-2,-13],[5,-12],[8,-8],[8,-4]],'#284665');
  oval(0,-5,7.5,2.7,'#314f70');
  shape([[-8,-5],[9,-5],[9,-2],[-8,-2]],'#162d43');
  shape([[3,-3],[12,-3],[13,-1],[6,1]],'#1a2731');
  oval(-.5,-5.3,1.4,1.9,'#d9e4d2');
  stroke([[-6,-9],[0,-11],[6,-9]],'#6483a0',.8);
 }else if(n.role==='paramedic'){
  shape([[-7,-4],[-6,-10],[-1,-12],[5,-10],[8,-6],[7,-3]],'#edf3eb');
  shape([[4,-4],[12,-3],[12,-1],[5,0]],'#344e65');
  stroke([[-6,-4],[7,-4]],'#8a9ca2',1.1);
  shape([[-1,-10],[1,-10],[1,-7],[4,-7],[4,-5],[1,-5],[1,-3],[-1,-3],[-1,-5],[-4,-5],[-4,-7],[-1,-7]],'#c93d49');
 }else{
  oval(0,-4.4,7.2,5.7,color);
  if(style==='buzz'){oval(0,-3.8,7.1,3.4,color)}
  else if(style==='sidePart'){
   // Combed fringe points toward the face (positive local X); rear is short.
   shape([[-7,-5],[-5,-9],[2,-11],[8,-7],[8,-1],[4,-2],[2,-5],[-3,-3]],color);
   stroke([[-2,-8],[4,-7],[7,-3]],'#dfcfb280',.9);
  }else if(style==='curly'){
   for(let i=0;i<7;i++)oval(-6+i*2.15,-7-(i%3)*1.5,3.1,3.2,color);
   oval(-7,1,2.9,3,color);oval(7,0,3,3.2,color);
  }else if(style==='wavy'){
   for(const [x,y] of [[-7,-3],[-9,1],[8,-2],[8,3]])oval(x,y,3.3,4,color);
  }else if(style==='bob'){
   shape([[-7,-7],[7,-7],[9,5],[6,7],[-7,7],[-9,4]],color);
  }else if(style==='ponytail'){
   // The tied hair must sit on the REAR (-X), opposite the face/brim.
   oval(-8,-2,3.6,4,color);
   shape([[-7,-1],[-11,0],[-13,9],[-9,11]],color);
   stroke([[-8,-1],[-12,3]],'#d6b788',1);
  }else if(style==='bun'){
   oval(0,-12,4.6,4,color);oval(0,-7,7,4,color);
  }else if(style==='long'){
   shape([[-8,-7],[-9,10],[-5,11],[-5,-1],[7,-2],[8,12],[11,11],[9,-7]],color);
  }else if(style==='messy'){
   shape([[-8,-4],[-8,-12],[-4,-8],[-1,-14],[2,-9],[7,-13],[9,-4],[5,-3]],color);
  }else{
   shape([[-7,-7],[-3,-11],[5,-10],[8,-4],[3,-3],[-2,-2]],color);
  }
  if(style!=='buzz'&&style!=='bun')oval(5,-2.5,2.5,2,color);
 }
 ctx.restore();
}
function stick(n,t){let p=project(n.rx,n.ry),z=zoom*(n.role==='customer'||n.role==='employee'?1:1.07),moving=n.path.length>0,step=moving?Math.sin(t*10+n.id.length):0,h=n.unconscious>0?5:35;ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#121a1c';ctx.lineWidth=2.6*z;ctx.lineCap='round';ctx.fillStyle='#121b2380';ctx.beginPath();ctx.ellipse(0,2*z,10*z,4*z,0,0,7);ctx.fill();if(!n.alive){ctx.rotate(Math.PI/2);ctx.translate(0,9*z)}if(n.unconscious>0){ctx.rotate(1.4);ctx.translate(0,9*z)}
 const joints=npcLimbPose(n,t),jointScale=h/35;
 const local=p=>({x:p.x*z*jointScale,y:p.y*z*jointScale});
 // Separate upper/lower limb segments join at visible elbows and knees.
 // Opposite leg phases, ground-contact planting and swing-arm counterbalance
 // make strides read as walking rather than full-length scissor limbs.
 ctx.strokeStyle='#121a1c';ctx.lineWidth=2.8*z;
 ctx.beginPath();ctx.moveTo(0,-h*z*.55);ctx.lineTo(0,-10*z);ctx.stroke();
 const limb=(a,b,c)=>{
  const aa=local(a),bb=local(b),cc=local(c);
  ctx.beginPath();ctx.moveTo(aa.x,aa.y);ctx.lineTo(bb.x,bb.y);
  ctx.lineTo(cc.x,cc.y);ctx.stroke();
  ctx.beginPath();ctx.arc(bb.x,bb.y,1.7*z,0,Math.PI*2);ctx.fillStyle='#263036';ctx.fill();
 };
 for(const leg of joints.legs)limb(leg.hip,leg.knee,leg.foot);
 for(const arm of joints.arms)limb(arm.shoulder,arm.elbow,arm.wrist);
 // Ankles are the step's attachment to the floor rather than swinging past it.
 for(const leg of joints.legs){const q=local(leg.foot);ctx.beginPath();ctx.arc(q.x,q.y,1.5*z,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#f8faf7';ctx.strokeStyle='#0c1416';ctx.lineWidth=2*z;ctx.beginPath();ctx.arc(0,-h*z*.82,7*z,0,Math.PI*2);ctx.fill();ctx.stroke();if(n.role==='employee'){
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
 {x:16,y:11,name:'CHECKOUT',accent:'#b75e4f'},
 {x:34,y:11,name:'SERVICE',accent:'#558c9a'},
 {x:14,y:34,name:'LUMBER',accent:'#b58a5b'},
 {x:28.5,y:36.4,name:'RECEIVING',accent:'#c08b55'},
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
  ...departmentSigns.map(o=>{
    const depth=o.name==='RECEIVING'?-1000:renderDepth('sign',o)+.1;
    return {kind:'sign',depth,fn:()=>{
      const opacity=signOpacity(o,game?.npcs||[],project,zoom,depth,n=>renderDepth('npc',n));
      ctx.save();ctx.globalAlpha=opacity;
      artwork.drawDepartmentSign(o.x,o.y,o.name,o.accent);
      ctx.restore();
    }};
  }),
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
  style==='ponytail'?'<path d="M18 35Q13-5 50-6q36 0 32 38l-10-15-47 0z"/><path d="M23 10Q1 20 8 56l11-9-1-24z"/>':
  style==='long'||style==='bob'?'<path d="M18 40Q7-6 50-7q43 1 33 45l2 43H70V31Q49 12 30 30v51H15z"/>':
  style==='curly'?'<path d="M15 41Q4 16 21 8Q18-13 40-7Q58-21 69-5Q89-7 88 13Q100 35 81 43L73 23Q50 11 27 25z"/>':
  style==='wavy'?'<path d="M16 43Q6 2 32-5Q62-20 82 11l2 31-10 17-6-30Q45 13 29 30l-6 29z"/>':
  style==='messy'?'<path d="M12 37l9-26 13-14 8 7 9-16 11 15 18-1 9 30-18-9Q47 6 26 29z"/>':
  '<path d="M19 38Q11-5 50-7q38 0 31 45l-9-15Q50 12 28 26z"/>';
 const helmet=n.role==='police'?
  '<path d="M21 30Q18 0 42-5Q64-12 79 11L82 30Z" fill="#2f4c6c" stroke="#142e42" stroke-width="3"/><path d="M23 24H81V35H20Z" fill="#1c354b"/><path d="M52 18L59 23L54 31H47L43 23Z" fill="#cbd8d6" stroke="#516e81"/><path d="M61 30Q85 29 91 36Q82 43 61 38Z" fill="#182832" stroke="#334b55" stroke-width="2"/><path d="M28 9Q48 1 68 10" fill="none" stroke="#708da5" stroke-width="2"/>':
  n.role==='firefighter'?
  '<path d="M18 33Q14-11 49-12Q84-10 84 32L77 47H24Z" fill="#d4aa3b" stroke="#7d5e27" stroke-width="3"/><path d="M44-10Q51-16 57-9L57 30H44Z" fill="#f3d26b"/><path d="M21 26H83L92 33L85 39H15L8 33Z" fill="#9f772d" stroke="#58482b" stroke-width="3"/><path d="M40 20H61V33H40Z" fill="#ede4b4" stroke="#b38c36"/><path d="M26 36L28 57L36 60" fill="none" stroke="#4b5047" stroke-width="3"/><path d="M80 36L73 53" stroke="#63502e" stroke-width="3"/>':
  n.role==='paramedic'?
  '<path d="M20 28Q17-7 52-7Q79-6 83 28H20Z" fill="#ecf0e9" stroke="#6b8386" stroke-width="3"/><path d="M19 27H81V36H20Z" fill="#cad7d3"/><path d="M56 29Q82 25 89 36Q79 43 56 38Z" fill="#314e60"/><path d="M45 7H55V16H64V24H55V33H45V24H36V16H45Z" fill="#c73e4a"/><path d="M28 13Q34 7 40 8" stroke="#fff" fill="none" stroke-width="2"/>':'';
 const vest=n.role==='employee'?'<path d="M23 96L16 118h68L77 96l-15-8H38z" fill="#c9323c" stroke="#182025" stroke-width="3"/>':'';
 const extra=fear?'<path d="M77 56q5 8 0 14" stroke="#65aeca" stroke-width="3" fill="none"/>':
  angry?'<path d="M21 61l-6 8 M78 61l6 8" stroke="#c97669" stroke-width="2"/>':
  stressed?'<path d="M80 48q5 12-1 21" stroke="#7bb7c4" stroke-width="2" fill="none"/>':'';
 return '<div class="npcPortrait mood-'+escapeHTML(mood.toLowerCase())+'"><svg viewBox="0 0 100 125" role="img" aria-label="Portrait expressing '+escapeHTML(mood)+'">'+
  '<path d="M22 123l8-30 20-7 20 7 8 30" fill="#202b32" stroke="#0a1114" stroke-width="4"/>'+vest+
  '<ellipse cx="50" cy="48" rx="31" ry="37" fill="#f7f4eb" stroke="#293436" stroke-width="3"/>'+
  '<g fill="#18252a">'+eyes+'</g><path d="'+brow+'" stroke="#283032" stroke-width="3.5" fill="none"/>'+
  '<path d="'+mouth+'" stroke="#4b292c" stroke-width="3.2" fill="none"/>'+extra+
  '<g transform="'+(n.facing==='left'?'translate(100 0) scale(-1 1)':'')+'"><g fill="'+color+'" stroke="'+color+'" stroke-width="2">'+hairShape+'</g>'+helmet+'</g>'+
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
  const tall=['lockers','vending','drinkCooler','shelf','hardwareBins','paintMixer','keyCutter','wireCutter','saw','forklift','handTruck'].includes(f.type);
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
