import assert from 'node:assert/strict';
import {createHardwareStore,walkable,pathTo,doorAt} from '../src/world.js';
import {makeGame,applyPower,updateGame,addHazard,POWER_LIST} from '../src/simulation.js';
import {saveGame,loadGame} from '../src/persistence.js';
import {createArtwork} from '../src/artwork.js';
import {renderDepth,compareRenderDepth} from '../src/render-depth.js';
import {hitProjectedFixture,isGroundTileTap,selectionLabel} from '../src/selection.js';
import {formatGameTime,emotionState,POWER_HELP,hairAppearance,npcWeakness,HAIR_COLORS,HAIR_STYLES} from '../src/hud.js';
import {readFileSync} from 'node:fs';
const store=new Map();
globalThis.localStorage={getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)};
const world=createHardwareStore();
assert(world.walls.has('40,27'),'Employee rear wall is continuous');
assert(!walkable(world,5,18),'Shelves block movement');
assert(walkable(world,28,38),'Receiving access clear');
assert(pathTo(world,{x:20,y:9},{x:41,y:13}).length>0,'Employee room reachable');
const g=makeGame(world,{staff:4,customers:8,seed:42});
assert.equal(g.npcs.length,12);
assert(g.npcs.every(n=>n.alive));
assert(applyPower(g,'whisper',g.npcs[0]).ok);
assert(!applyPower(g,'hazard',{type:'tile',x:5,y:18}).ok,'Cannot place hazard inside shelf');
assert(addHazard(g,28,37,'fire'),'Fire created');
for(let i=0;i<250;i++)updateGame(g,.1);
assert(g.npcs.length>=12,'Characters cannot despawn');
assert(g.npcs.length<=21,'Finite reinforcement cap');
const at=doorAt(world,38,12);assert(at&&at.type==='hinged');
assert(saveGame(g),'Full save succeeds');
const saved=loadGame();
assert(saved&&saved.npcs.length===g.npcs.length);
assert(saved.world.walls instanceof Map);
assert.equal(saved.random.state(),g.random.state(),'RNG state persists');
assert(pathTo(saved.world,{x:20,y:9},{x:41,y:13}).length>0);
const pauseTime=saved.elapsed;saved.paused=true;updateGame(saved,30);assert.equal(saved.elapsed,pauseTime);
saved.paused=false;
for(let npc of saved.npcs){npc.alive=false;npc.health=0} 
// Empty living population causes exactly one victory transition.
updateGame(saved,.1);assert.equal(saved.completed,true);assert.equal(saved.winner,true);
const oldLog=saved.log.length;updateGame(saved,.1);assert.equal(saved.log.length,oldLog);
// Built-in art must render every world asset type without external PNG files.
const graphicsCalls={count:0};
const drawingMethods=new Set(['beginPath','moveTo','lineTo','closePath','fill','stroke','ellipse','fillRect','strokeRect','fillText','arc','save','restore','translate','rotate','transform','clip']);
const drawingContext=new Proxy({},{
 get:(obj,k)=>drawingMethods.has(k)?()=>{graphicsCalls.count++}:obj[k],
 set:(obj,k,val)=>{obj[k]=val;return true}
});
const project=(x,y,h=0)=>({x:500+(x-y)*17,y:350-(x+y)*8-h*.7});
const artwork=createArtwork(drawingContext,project,()=>.7);
artwork.drawFloor(world,{w:1000,h:700});
for(const f of world.fixtures)artwork.drawFixture(f);
for(const d of world.doors)for(const opened of [0,.5,1]){d.open=opened;artwork.drawDoor(d)}
for(const w of world.walls.values())artwork.drawWall(w,world);
for(const p of world.props)artwork.drawVehicle(p,0.5);
for(const item of ['hammer','wrench','broom','flashlight','paint','bandage','water','phone','gloves'])artwork.drawDrop({item,x:20,y:21});
assert(graphicsCalls.count>1000,'Procedural artwork draws all assets');
const occupied=new Set();
for(const fixture of world.fixtures)for(let x=fixture.x;x<fixture.x+fixture.w;x++)for(let y=fixture.y;y<fixture.y+fixture.h;y++){
 const footprint=x+','+y;
 assert(!occupied.has(footprint),'Fixture collision footprints must not overlap: '+footprint);
 assert(!world.walls.has(footprint),'Fixture must not intersect structural walls: '+footprint);
 occupied.add(footprint);
}
assert(world.walls.has('18,10')&&world.walls.has('21,10'),'Front entrance has no passable gaps beside animated doors');
assert(world.walls.has('27,39')&&world.walls.has('30,39'),'Loading bay has no door bypass');
const passageWorld=createHardwareStore();
const passage=makeGame(passageWorld,{staff:1,customers:1,seed:333});
const traveler=passage.npcs[0];traveler.x=traveler.rx=19;traveler.y=traveler.ry=8;
traveler.path=pathTo(passageWorld,{x:19,y:8},{x:19,y:17});traveler.think=99999;
for(const npc of passage.npcs.slice(1)){npc.x=npc.rx=33;npc.y=npc.ry=30;npc.path=[];npc.think=99999}
const frontDoor=doorAt(passageWorld,19,10);let observedOpening=false;
for(let i=0;i<270;i++){updateGame(passage,.05);if(frontDoor.open>.65)observedOpening=true}
assert(observedOpening,'NPC approaches and door opens');
assert(traveler.y>=13,'NPC crosses the threshold after door opens');
assert(frontDoor.open<.12,'Door closes after the character clears the opening');
assert(!passageWorld.walls.has('19,10'),'Door threshold stays free of structural wall collision');
// Overhead signs and spill-cleaning equipment draw entirely from Canvas primitives.
artwork.drawDepartmentSign(17.5,16.5,'ELECTRICAL','#c9a946');
artwork.drawWetFloorSign(30,30);
artwork.drawCleaningSet(31,30,0);
artwork.drawCleaningSet(31,30,1.5);

// A staff member sees a spill, travels to it, cleans it, and leaves a temporary sign.
const cleanWorld=createHardwareStore();
const cleanGame=makeGame(cleanWorld,{staff:1,customers:1,seed:1549});
const cleaner=cleanGame.npcs.find(n=>n.role==='employee');
const observer=cleanGame.npcs.find(n=>n.role==='customer');
cleaner.x=cleaner.rx=31;cleaner.y=cleaner.ry=30;cleaner.path=[];cleaner.think=.01;
observer.x=observer.rx=6;observer.y=observer.ry=14;observer.path=[];observer.think=1000;
assert(addHazard(cleanGame,30,30,'spill'));
let animated=false;
for(let i=0;i<100;i++){
 updateGame(cleanGame,.1);
 if(cleaner.cleaning){animated=true;break}
}
assert(animated,'Employee begins mopping with visible equipment');
assert(cleaner.cleaningTarget,'Cleaning target is tracked');
assert(saveGame(cleanGame),'Mid-cleaning saves without losing state');
const loadedCleanGame=loadGame();
const resumedCleaner=loadedCleanGame.npcs.find(n=>n.id===cleaner.id);
assert.equal(resumedCleaner.cleaningTarget,cleaner.cleaningTarget,'Save retains active cleaning task');
let placedSign=false;
for(let i=0;i<120;i++){
 updateGame(loadedCleanGame,.1);
 if(loadedCleanGame.world.props.some(p=>p.type==='wetFloorSign')){placedSign=true;break}
}
assert(placedSign,'A-frame caution sign placed at finished spill');
assert(!loadedCleanGame.world.hazards.some(h=>h.kind==='spill'&&h.life>0),'Spill is removed after cleaning');
for(let i=0;i<155;i++)updateGame(loadedCleanGame,.1);
assert(!loadedCleanGame.world.props.some(p=>p.type==='wetFloorSign'),'Warning sign expires after cleaning');
// Artwork refinement regression: shelf stock must be reflected in visual merchandise.
function drawingOpCount(fixture){
 let calls=0;
 const methods=new Set(['beginPath','moveTo','lineTo','closePath','fill','stroke','ellipse','fillRect','strokeRect','fillText','arc']);
 const ctx=new Proxy({},{
  get:(o,k)=>methods.has(k)?()=>{calls++}:o[k],
  set:(o,k,v)=>{o[k]=v;return true}
 });
 createArtwork(ctx,project,()=>.7).drawFixture(fixture);
 return calls;
}
const aisle=world.fixtures.find(f=>f.type==='shelf');
const emptyDrawing=drawingOpCount({...aisle,stock:0});
const partialDrawing=drawingOpCount({...aisle,stock:7});
const stockedDrawing=drawingOpCount({...aisle,stock:12});
assert(emptyDrawing<partialDrawing&&partialDrawing<stockedDrawing,
 'Shelves visibly lose merchandise as stock decreases');

// Car artwork must respect the parking-space footprint used by game collision.
const parkedCar=world.props.find(p=>p.type==='car');
const carCoordinates=[];
const carRenderer=createArtwork(drawingContext,(x,y,z=0)=>{
 carCoordinates.push({x,y,z});
 return project(x,y,z)
},()=>.7);
carRenderer.drawVehicle(parkedCar,0);
assert(carCoordinates.length>10,'Detailed vehicle geometry was drawn');
for(const p of carCoordinates){
 assert(p.x>=parkedCar.x-.501&&p.x<=parkedCar.x+parkedCar.w-.499,
  'Vehicle artwork exceeds parked collision footprint in X');
 assert(p.y>=parkedCar.y-.501&&p.y<=parkedCar.y+parkedCar.h-.499,
  'Vehicle artwork exceeds parked collision footprint in Y');
}

// Every doorway connects the two tiles it is designed to separate.
for(const d of world.doors){
 const a=d.axis==='y'?{x:d.x-1,y:d.y}:{x:d.x,y:d.y-1};
 const b=d.axis==='y'?{x:d.x+1,y:d.y}:{x:d.x,y:d.y+1};
 assert(walkable(world,a.x,a.y)&&walkable(world,b.x,b.y),
  'Door has an obstructed approach: '+d.label);
 assert(pathTo(world,a,b).some(p=>p.x===d.x&&p.y===d.y),
  'Door does not join both sides of its intended passage: '+d.label);
}
// Isometric solid regression: visible sides must meet at the near corner,
// not the hidden far corner. Previously the back faces were drawn, leaving
// counters, pallets and cabinets looking like their lower half was missing.
const faceCalls=[];
let capturedPath=[];
const faceCtx={
 beginPath(){capturedPath=[]},
 moveTo(x,y){capturedPath.push([x,y])},
 lineTo(x,y){capturedPath.push([x,y])},
 closePath(){},
 fill(){faceCalls.push({color:this.fillStyle,points:capturedPath.map(p=>[...p])})},
 stroke(){},ellipse(){},arc(){},fillRect(){},strokeRect(){},fillText(){}
};
const faceProjection=(x,y,z=0)=>({x:(x-y)*24,y:-(x+y)*12-z});
const faceArt=createArtwork(faceCtx,faceProjection,()=>1);
const near=faceProjection(20.5,34.5),far=faceProjection(22.5,35.5);
const hasVertex=(polygon,p)=>polygon.points.some(v=>Math.abs(v[0]-p.x)<1e-7&&Math.abs(v[1]-p.y)<1e-7);
faceArt.drawFixture({type:'toolCabinet',x:21,y:35,w:2,h:1});
const cabinetSides=faceCalls.filter(p=>['#733c37','#974a3e'].includes(p.color));
assert.equal(cabinetSides.length,2,'Solid cabinet draws two visible side faces');
assert(cabinetSides.every(poly=>hasVertex(poly,near)),'Both visible sides join at the nearest ground corner');
assert(cabinetSides.every(poly=>!hasVertex(poly,far)),'Hidden far faces must never be drawn instead');
faceCalls.length=0;
faceArt.drawFixture({type:'pallet',x:11,y:35,w:2,h:1});
const boxLeft=faceCalls.filter(p=>p.color==='#7b6a58');
const boxRight=faceCalls.filter(p=>p.color==='#9b8065');
assert(boxLeft.length>=6&&boxLeft.length===boxRight.length,'Each merchandise carton has two side faces');
for(let i=0;i<boxLeft.length;i++){
 assert(boxLeft[i].points.filter(v=>boxRight[i].points.some(w=>Math.abs(v[0]-w[0])<1e-7&&Math.abs(v[1]-w[1])<1e-7)).length===2,
  'Both carton faces must share their front vertical edge');
}
// No more legacy machine/store/door branding; hanging department panels
// and their text share a true isometric angle, including long titles.
const signCalls={texts:[],polygons:[],rotation:null,translation:null,affine:null,clips:0};
let signPath=[];
const labelCtx={
 beginPath(){signPath=[]},moveTo(x,y){signPath.push([x,y])},
 lineTo(x,y){signPath.push([x,y])},closePath(){},
 fill(){signCalls.polygons.push({color:this.fillStyle,vertices:signPath.map(p=>[...p])})},
 stroke(){},ellipse(){},arc(){},save(){},restore(){},clip(){signCalls.clips++},
 transform(a,b,c,d,e,f){signCalls.affine=[a,b,c,d,e,f]},
 translate(x,y){signCalls.translation=[x,y]},rotate(angle){signCalls.rotation=angle},
 fillRect(){},strokeRect(){},
 fillText(text,x,y,maxWidth){signCalls.texts.push({text,x,y,maxWidth,angle:signCalls.rotation,position:signCalls.translation})}
};
const labelArt=createArtwork(labelCtx,project,()=>.65);
const forbidden=['NORTHLINE','COLOR MIX','FIRST AID','DRINKS','SNACKS','WC'];
for(const fixture of world.fixtures.filter(f=>['shelf','checkout','serviceDesk','toolCabinet','hardwareBins','endcap','paintMixer','vending','drinkCooler','safetyStation'].includes(f.type))){
 signCalls.texts.length=0;
 labelArt.drawFixture(fixture);
 assert(!signCalls.texts.some(t=>forbidden.includes(t.text)),
  'Outdated branding should not appear on '+fixture.type);
}
signCalls.texts.length=0;
for(const wall of world.walls.values())labelArt.drawWall(wall,world);
for(const door of world.doors)labelArt.drawDoor(door);
assert(!signCalls.texts.some(t=>forbidden.includes(t.text)),
 'Outdated building and restroom signs should be removed');
for(const title of ['PAINT','ELECTRICAL','PLUMBING','CHECKOUT','SERVICE','GARDEN','RECEIVING']){
 signCalls.texts.length=0;signCalls.polygons.length=0;
 signCalls.rotation=null;signCalls.translation=null;
 labelArt.drawDepartmentSign(17.5,16.5,title,'#c9a946');
 const face=signCalls.polygons.find(r=>r.color==='#e8e7d9');
 assert(face&&face.vertices.length===4,'An isometric sign face exists for '+title);
 const [a,b,c,d]=face.vertices;
 const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
 assert(Math.abs(angle)>.2,'Sign face must be tilted with world perspective');
 const text=signCalls.texts.find(t=>t.text===title);
 assert(text,'Department title appears: '+title);
 assert(Math.abs(text.angle-angle)<1e-7,'Department lettering rotates with its panel');
 assert(signCalls.affine&&Math.abs(signCalls.affine[2]-Math.sin(angle))<1e-7&&
   Math.abs(signCalls.affine[3]-Math.cos(angle))<1e-7,
  'Lettering uses panel vertical basis as well as its rotated top edge');
 assert(signCalls.clips>0,'Lettering is clipped to the sign face');
 assert.equal(text.x,0,'Title horizontally centered in the angled local frame');
 assert.equal(text.y,0,'Title vertically centered in the angled local frame');
 const width=Math.hypot(b[0]-a[0],b[1]-a[1]);
 assert(text.maxWidth>0&&text.maxWidth<width,'Lettering is clamped within sign width');
 const centerX=(a[0]+b[0]+c[0]+d[0])/4,centerY=(a[1]+b[1]+c[1]+d[1])/4;
 assert(Math.hypot(text.position[0]-centerX,text.position[1]-centerY)<7,
  'Tilted title is actually positioned in its panel');
}
// NPC schedules: employees staff actual counters, help customers and cover all
// reachable map zones; shoppers browse, visit garden, check out and return to cars.
const scheduleWorld=createHardwareStore();
const scheduleGame=makeGame(scheduleWorld,{staff:4,customers:6,seed:43});
const employees=scheduleGame.npcs.filter(n=>n.role==='employee');
const shoppers=scheduleGame.npcs.filter(n=>n.role==='customer');
assert.deepEqual(employees.map(n=>n.duty),['cashier','service','floor','floor']);
assert(shoppers.every(n=>n.duty==='shopper'));
assert(shoppers.every(n=>n.y===8),'Shoppers enter from the parking lot');
const zones=Object.fromEntries(scheduleGame.npcs.map(n=>[n.id,new Set()]));
const jobs=Object.fromEntries(scheduleGame.npcs.map(n=>[n.id,new Set()]));
const poses=Object.fromEntries(scheduleGame.npcs.map(n=>[n.id,new Set()]));
let cashierTime=0,serviceTime=0;
for(let i=0;i<2400;i++){
 updateGame(scheduleGame,.1);
 if(i%5===0){
  for(const n of scheduleGame.npcs){
   const tile=scheduleWorld.ground.find(t=>t.x===Math.round(n.rx)&&t.y===Math.round(n.ry));
   if(tile)zones[n.id].add(tile.area);
   if(n.task)jobs[n.id].add(n.task.kind);
   if(n.action)poses[n.id].add(n.action);
  }
  if(employees[0].task?.kind==='cashier'&&!employees[0].path.length)cashierTime+=.5;
  if(employees[1].task?.kind==='service'&&!employees[1].path.length)serviceTime+=.5;
 }
}
assert(cashierTime>20,'Cashier spends real work time stationed at register');
assert(serviceTime>20,'Service associate spends real work time at customer service');
assert(poses[employees[0].id].has('scan'),'Cashier performs scan animation');
assert(poses[employees[1].id].has('type'),'Service associate performs desk animation');
assert(employees.slice(2).some(n=>zones[n.id].has('garden')),'Floor associates visit garden');
assert(employees.slice(2).some(n=>zones[n.id].has('employee')),'Floor associates visit employee rooms');
assert(employees.slice(2).some(n=>zones[n.id].has('parking')),'Floor associates inspect parking lot');
assert(employees.slice(2).some(n=>jobs[n.id].has('help')),'Floor associates initiate customer assistance');
assert(shoppers.some(n=>jobs[n.id].has('checkout')),'Customers use checkout');
assert(shoppers.some(n=>zones[n.id].has('garden')),'Customers visit the garden');
assert(shoppers.some(n=>jobs[n.id].has('parking')),'Customers return to their cars');
assert(scheduleGame.log.some(entry=>/Can I help|Looking for anything|Need a hand/.test(entry.text)),
 'Associate asks customers if help is needed');
assert(walkable(scheduleWorld,37,18),'Staff corridor remains walkable');
assert(pathTo(scheduleWorld,{x:10,y:8},{x:40,y:18}).length>0,'Route from parking to staff areas');
assert(pathTo(scheduleWorld,{x:20,y:13},{x:43,y:33}).length>0,'Route from store to garden');
assert(saveGame(scheduleGame),'Routine schedules save');
const loadedSchedules=loadGame();
assert.equal(loadedSchedules.npcs[0].duty,'cashier','Assigned cashier role survives save');
assert.equal(loadedSchedules.npcs[1].duty,'service','Assigned service role survives save');
assert(loadedSchedules.npcs.every(n=>Array.isArray(n.path)),'Saved routine paths survive');
for(let i=0;i<15;i++)updateGame(loadedSchedules,.1);
// A separate floor associate replenishes real low-stock shelf inventory.
const restockWorld=createHardwareStore();
const nearlyEmpty=restockWorld.fixtures.find(f=>f.type==='shelf');
nearlyEmpty.stock=0;
const restockGame=makeGame(restockWorld,{staff:4,customers:1,seed:21});
const stocker=restockGame.npcs.filter(n=>n.duty==='floor')[1];
stocker.x=stocker.rx=nearlyEmpty.x+2;stocker.y=stocker.ry=nearlyEmpty.y+2;
stocker.think=.01;
let doingRestock=false;
for(let i=0;i<240;i++){
 updateGame(restockGame,.1);
 if(stocker.task?.kind==='restock')doingRestock=true;
}
assert(doingRestock,'Floor associate receives a stock replenishment assignment');
assert(nearlyEmpty.stock>=5,'Completing a restock adds actual merchandise to the shelf');
// Staff corridor has true end walls; the fence is collision-aware with one gate.
const extended=createHardwareStore();
assert(extended.walls.has('37,10')&&extended.walls.has('37,27'),
 'Both ends of the employee hallway have solid walls');
for(const k of ['48,34','44,39','47,28']){
 assert.equal(extended.walls.get(k)?.section,'gardenFence',
  'Wooden fence seals the garden perimeter at '+k);
}
assert(![...extended.walls.values()].some(w=>w.section==='gardenFence'&&w.x===38),
 'No redundant wooden fencing along the building-side garden boundary');
const gardenGate=doorAt(extended,43,39);
assert(gardenGate&&gardenGate.type==='gate','The relocated garden outer gate remains functional');
assert(!extended.walls.has('43,39'),'Outer garden gate is an unobstructed opening');
const gardenRoute=pathTo(extended,{x:35,y:30},{x:43,y:33});
assert(gardenRoute.some(p=>p.x===38&&p.y===30),
 'NPC navigation crosses the newly open garden edge without clipping through the building');
assert(walkable(extended,28,38)&&walkable(extended,28,40),
 'Receiving door and central loading lane remain open');
assert(pathTo(extended,{x:28,y:42},{x:28,y:37}).some(p=>p.y===39),
 'Loading-lane NPCs traverse the receiving roll-up door');
for(const fixture of extended.fixtures){
 for(let x=fixture.x;x<fixture.x+fixture.w;x++)for(let y=fixture.y;y<fixture.y+fixture.h;y++){
  assert(!extended.walls.has(x+','+y),'New fixture intersects a wall: '+fixture.id);
  assert(!extended.fixtures.some(other=>other!==fixture&&
   x>=other.x&&x<other.x+other.w&&y>=other.y&&y<other.y+other.h),
   'Decorations cannot overlap another fixture: '+fixture.id);
 }
}
for(const type of ['receivingDesk','palletStack','boxStack','handTruck','flatCart',
 'filingCabinet','noticeBoard','coffeeStation','coatRack','storageShelves',
 'supplyCabinet','flowerBed','seedDisplay','pottingBench','gardenBench',
 'birdbath','wateringStation','planter']){
 assert(extended.fixtures.some(f=>f.type===type),'Newly drawn asset present: '+type);
}
// Exercise both the fence and animated garden gate with a real NPC crossing.
const gateGame=makeGame(extended,{staff:4,customers:2,seed:23});
const gateWalker=gateGame.npcs[2];
gateWalker.x=gateWalker.rx=43;gateWalker.y=gateWalker.ry=41;
gateWalker.path=pathTo(extended,{x:43,y:40},{x:43,y:37});
gateWalker.think=99999;gateWalker.task=null;
for(const other of gateGame.npcs.filter(n=>n!==gateWalker)){
 other.x=other.rx=11;other.y=other.ry=20;other.think=99999;other.path=[];
}
let gateOpened=false;
for(let i=0;i<120;i++){updateGame(gateGame,.05);if(gardenGate.open>.65)gateOpened=true}
assert(gateOpened&&gateWalker.y<=38,'NPC opens relocated garden gate and crosses the fence');
const originalFences=[...extended.walls.values()].filter(w=>w.section==='gardenFence');
for(const o of originalFences)artwork.drawWall(o,extended);
for(const fraction of [0,.5,1]){gardenGate.open=fraction;artwork.drawDoor(gardenGate)}
for(const o of extended.fixtures)artwork.drawFixture(o);
// Loading previous saved-game data onto the new layout must not discard progress.
const legacyGame=makeGame(createHardwareStore(),{staff:4,customers:3,seed:112});
const preserved=legacyGame.world.fixtures.find(f=>f.type==='shelf');
preserved.stock=3;assert(saveGame(legacyGame));
const legacyKey=[...store.keys()].find(k=>k.startsWith('life-in-motion-v3-round-'));
assert(legacyKey,'Saved world can be read back for the layout migration test');
const legacySnapshot=JSON.parse(store.get(legacyKey));
delete legacySnapshot.world.layoutVersion;
legacySnapshot.world.fixtures=legacySnapshot.world.fixtures.filter(f=>f.type!=='flowerBed');
legacySnapshot.world.walls=legacySnapshot.world.walls.filter(([k])=>k!=='37,10'&&k!=='37,27');
store.set(legacyKey,JSON.stringify(legacySnapshot));
const migrated=loadGame();
assert(migrated&&migrated.world.layoutVersion===4,'Older saves receive the revised level');
assert(migrated.world.walls.has('37,10')&&migrated.world.walls.has('37,27'),
 'Save migration restores hallway end walls');
assert(migrated.world.fixtures.some(f=>f.type==='flowerBed')&&
 migrated.world.fixtures.some(f=>f.type==='receivingDesk'),
 'Save migration restores new garden and loading props');
assert.equal(migrated.world.fixtures.find(f=>f.id===preserved.id).stock,3,
 'Save migration preserves shelf inventory');
// Occlusion regression: fixtures occupy large footprints while character
// torsos rise above the floor; foreground staff should render after counters.
const order=(object,actor)=>[
 {kind:'fixture',depth:renderDepth('fixture',object)},
 {kind:'npc',depth:renderDepth('npc',actor)}
].sort(compareRenderDepth).map(e=>e.kind);
const counter=extended.fixtures.find(f=>f.type==='checkout');
assert.deepEqual(order(counter,{rx:counter.x+1,ry:counter.y+2}),['fixture','npc'],
 'A cashier standing by a register is not hidden behind its artwork');
const shelf=extended.fixtures.find(f=>f.type==='shelf');
assert.deepEqual(order(shelf,{rx:shelf.x+1,ry:shelf.y+1}),['fixture','npc'],
 'An NPC in the near aisle is rendered above shelf art');
assert.deepEqual(order(shelf,{rx:shelf.x+2,ry:shelf.y+shelf.h+3}),['npc','fixture'],
 'An NPC beyond the far side of a shelf stays behind it');
const receiving=extended.fixtures.find(f=>f.type==='palletStack');
assert.deepEqual(order(receiving,{rx:receiving.x+2,ry:receiving.y}),['fixture','npc'],
 'A worker in front of a receiving pallet stays visible');
// Building-corner regression: perpendicular wall segments cannot overwrite
// each other at the store and staff-wing exterior corners.
const cornerWorld=createHardwareStore();
const corners=[
 [2,10,'exterior'],[36,10,'exterior'],[2,39,'exterior'],[36,39,'exterior'],
 [38,10,'staff'],[46,10,'staff'],[38,27,'staff'],[46,27,'staff']
];
for(const [x,y,section] of corners){
 const corner=cornerWorld.walls.get(x+','+y);
 assert(corner,'No missing wall at '+x+','+y);
 assert.equal(corner.section,section,'Correct exterior corner wall material');
 assert.equal(corner.axis,'corner','Corner holds both directions');
 assert.deepEqual(new Set(corner.axes),new Set(['x','y']),
  'Both perpendicular wall panels share the corner tile');
}
const glazed=cornerWorld.ground.filter(t=>t.y===10&&cornerWorld.walls.get(t.x+',10')?.window==='storefront').map(t=>t.x);
assert.deepEqual(glazed,[4,5,7,8,9,11,12,15,16,22,23,26,27,32,33],
 'Expanded glazing exists on the parking-lot-facing north wall');
assert(!cornerWorld.walls.has('19,10')&&!cornerWorld.walls.has('20,10'),
 'Storefront windows never cover the main entrance');
assert.equal(doorAt(cornerWorld,19,10)?.type,'sliding');
assert.equal(doorAt(cornerWorld,20,10)?.type,'sliding');
assert(pathTo(cornerWorld,{x:20,y:9},{x:31,y:15}).length>0,'Entrance navigation remains open');
assert(pathTo(cornerWorld,{x:20,y:9},{x:41,y:18}).length>0,'Employee wing remains accessible');
assert(pathTo(cornerWorld,{x:28,y:42},{x:28,y:37}).length>0,'Receiving access remains open');
// Canvas-level contract: a corner draws TWO correctly joined wall faces,
// while every window is painted precisely once on its own facade tile.
const geometryFills=[];
let tempPath=[];
const facadeCtx={
 beginPath(){tempPath=[]},moveTo(x,y){tempPath.push([x,y])},
 lineTo(x,y){tempPath.push([x,y])},closePath(){},
 fill(){geometryFills.push({color:this.fillStyle,vertices:tempPath.map(p=>[...p])})},
 stroke(){},ellipse(){},arc(){},fillRect(){},strokeRect(){},fillText(){}
};
const facadeArt=createArtwork(facadeCtx,project,()=>.7);
for(const [x,y] of corners){
 geometryFills.length=0;
 facadeArt.drawWall(cornerWorld.walls.get(x+','+y),cornerWorld);
 assert.equal(geometryFills.filter(p=>p.color==='#a6b7b0'||p.color==='#c0c6ba').length,2,
  'Corner must draw exactly one perpendicular face in each direction');
}
for(const x of glazed){
 geometryFills.length=0;
 facadeArt.drawWall(cornerWorld.walls.get(x+',10'),cornerWorld);
 assert.equal(geometryFills.filter(p=>p.color==='#507b8799').length,1,
  'Exactly one isometric storefront window painted at '+x);
}
geometryFills.length=0;
facadeArt.drawWall(cornerWorld.walls.get('6,10'),cornerWorld);
assert.equal(geometryFills.filter(p=>p.color==='#507b8799').length,0,
 'Plain wall sections remain solid between windows');
// In-game time is 12-hour, uses the selected start, and freezes when paused.
const timed=makeGame(createHardwareStore(),{staff:4,customers:2,seed:91,clockStartMinutes:480});
assert.equal(formatGameTime(timed),'8:00 AM');
timed.elapsed=240;assert.equal(formatGameTime(timed),'12:00 PM');
timed.elapsed=960;assert.equal(formatGameTime(timed),'12:00 AM');
timed.elapsed=1125;assert.equal(formatGameTime(timed),'2:45 AM');
timed.paused=true;
const haltedTime=formatGameTime(timed),haltedElapsed=timed.elapsed;
for(let i=0;i<20;i++)updateGame(timed,.1);
assert.equal(timed.elapsed,haltedElapsed,'Pausing freezes simulation time');
assert.equal(formatGameTime(timed),haltedTime,'Pausing freezes the clock');
timed.paused=false;updateGame(timed,1);
assert.notEqual(formatGameTime(timed),haltedTime,'Resuming advances the game clock');
const frightened=timed.npcs[0];
frightened.emotion.fear=75;assert.equal(emotionState(frightened),'Terrified');
frightened.alive=false;assert.equal(emotionState(frightened),'Deceased');
assert.equal(Object.keys(POWER_HELP).length,POWER_LIST.length,'Every power has instructions');
for(const p of POWER_LIST)assert(POWER_HELP[p.id]?.every(text=>text.length>15),'Power help missing: '+p.id);
assert(saveGame(timed));
assert.equal(formatGameTime(loadGame()),formatGameTime(timed),'Clock persists through save/load');
// Static DOM and rendering integration coverage without browser dependencies.
const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const client=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(!page.includes('data-tab="events"'),'Events tab removed');
assert(!page.includes('v3 · Hardware Store</small>'),'Header has no version/map subtitle');
assert(!page.includes('<h2>Hardware Store</h2>'),'Panels have no repeated Hardware Store heading');
for(const id of ['peopleContent','powersContent','worldEvents','gameClock','saveV3','home','stopFollow']){
 assert(page.includes('id="'+id+'"'),'Missing HUD element '+id);
}
assert(page.includes('data-tab="settings"')&&page.includes('data-tab="people"'));
assert(page.includes('V3 · TOTAL ELIMINATION')&&page.indexOf('V3 · TOTAL ELIMINATION')<page.indexOf('id="game"'),
 'Total Elimination board must be in top header');
assert(client.includes('render(game?.elapsed||0)'),'Animations use simulation time, not wall time');
assert(client.includes('offset=iso(n.rx,n.ry)'),'Camera follows selected NPC');
assert(client.includes("activateTab('people')"),'Tapping an NPC opens overview');
assert(client.includes('selectTarget(person)'),'People list can select an NPC');
assert(client.includes('clearSelection()'),'People can unselect an NPC');
assert(client.includes('POWER_HELP[p.id]'),'Power guidance appears for every power');
// NPC appearance is persistent, natural-looking and consistent across views.
const appearanceGame=makeGame(createHardwareStore(),{seed:447,staff:4,customers:10});
assert(HAIR_COLORS.length>=10&&HAIR_STYLES.length>=9,'Varied natural hair colors and styles');
for(const n of appearanceGame.npcs){
 const a=hairAppearance(n);
 assert(HAIR_COLORS.includes(a.color)&&HAIR_STYLES.includes(a.style),'NPC hair uses approved look');
 assert(typeof npcWeakness(n)==='string'&&npcWeakness(n).length>3,'Person has readable weakness');
}
assert(saveGame(appearanceGame),'Save appearance');
const recovered=loadGame();
assert.equal(recovered.npcs[0].hairColor,appearanceGame.npcs[0].hairColor,'Hair color persists');
assert.equal(recovered.npcs[0].hairStyle,appearanceGame.npcs[0].hairStyle,'Hair style persists');
const currentClient=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(currentClient.includes("'<br><strong>Weakness:</strong> '"),'People list shows weakness before task');
assert(currentClient.indexOf("'<br><strong>Weakness:</strong> '")<currentClient.indexOf("escapeHTML(p.alive?p.activity:'Deceased')"),'Weakness displayed above activity');
assert(currentClient.includes("POWER_LIST.map(p=>{")&&currentClient.includes("open?'<div class=\"powerDescription\""),'Power explanations appear inline under selected power');
assert(currentClient.includes("const activate=powers.querySelector('#armPower')"),'Expand/collapse power guidance keeps usable action');
assert(currentClient.includes("hairAppearance(n)")&&currentClient.includes("emotionState(n)"),'NPC portrait reads same hair and emotion state');
// Spawned people should display varied, reproducible starting emotions.
for(const seed of [447,91,2026]){
 const moodGame=makeGame(createHardwareStore(),{seed,staff:8,customers:12});
 const moods=moodGame.npcs.map(emotionState);
 assert(new Set(moods).size>=3,'NPCs start with multiple random moods for seed '+seed);
 assert(moods.some(m=>m!=='Calm'),'NPCs do not all begin calm');
 assert(moodGame.npcs.every(n=>Object.values(n.emotion).every(v=>v>=0&&v<=100)),
  'All starting emotion values stay within their valid limits');
 if(seed===447){
  assert(saveGame(moodGame),'Random initial NPC emotions are saveable');
  const moodReload=loadGame();
  assert.deepEqual(moodReload.npcs.map(n=>n.emotion),moodGame.npcs.map(n=>n.emotion),
   'Starting moods persist after save and load');
 }
}
for(const power of ['anger','suspicion','trust']){
 const description=POWER_HELP[power][0];
 assert(description.includes('targets'),'God Power description refers to targets: '+power);
 assert(!/undefined|character/i.test(description),'God Power description has no broken apostrophe: '+power);
}
const updatedPortraitCode=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(!updatedPortraitCode.includes("escapeHTML(style)+' hair"),
 'Hair style name is not printed underneath selected NPC portrait');
assert(updatedPortraitCode.includes("hairAppearance(n)"),
 'Portrait still renders the character\'s assigned hairstyle');

// World selection should respect real ground-tile diamonds rather than
// inflated bounding boxes around tall store fixtures.
const selectionWorld=createHardwareStore();
const selectProject=(x,y,z=0)=>({x:(x-y)*24,y:-(x+y)*12-z});
const selectionAisle=selectionWorld.ground.find(t=>t.area==='store'&&t.x===9&&t.y===20);
assert(selectionAisle,'A store aisle tile exists');
const selectionCenter=selectProject(selectionAisle.x,selectionAisle.y);
assert(isGroundTileTap(selectionWorld,selectionAisle.x,selectionAisle.y,selectionCenter.x,selectionCenter.y,selectProject,1),
 'Aisle floor tile is recognized before nearby shelf art');
assert.equal(selectionLabel(selectionWorld,{id:'tile-9-20',x:9,y:20,type:'tile'}),
 'Store Aisle Tile (9, 20)','Selected aisle tile has useful header text');
const selectedShelf=selectionWorld.fixtures.find(f=>f.type==='shelf');
const shelfTestTop=selectProject(selectedShelf.x,selectedShelf.y,41);
assert(!isGroundTileTap(selectionWorld,selectedShelf.x,selectedShelf.y,shelfTestTop.x,shelfTestTop.y,selectProject,1),
 'An occupied shelf tile is not mistaken for a walkable aisle tile');
const selectedShelfCenter=selectProject(selectedShelf.x,selectedShelf.y,20);
assert(hitProjectedFixture(selectedShelf,selectedShelfCenter.x,selectedShelfCenter.y,selectProject,49)!==null,
 'Fixture silhouette remains tappable');
const distantPoint=selectProject(selectedShelf.x-10,selectedShelf.y-9);
assert.equal(hitProjectedFixture(selectedShelf,distantPoint.x,distantPoint.y,selectProject,49),null,
 'Distant walkable floors do not trigger fixture picking');
const selectionPage=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const selectionClient=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(selectionPage.includes('id="selectedLabel"')&&
 selectionPage.indexOf('id="selectedLabel"')<selectionPage.indexOf('id="gameClock"'),
 'Selection label sits immediately before in-game time');
assert(selectionClient.includes('isGroundTileTap(world,tile.x,tile.y'),
 'Map picking prioritizes walkable tiles over projecting shelf bboxes');
assert(!selectionClient.includes('if(selected)selected=null;'),
 'Tile and fixture selections persist after HUD refresh');
assert(selectionClient.includes("name:'RECEIVING'"),
 'Matching overhead Receiving sign is included');
const seamStrokeColors=[];
const seamAuditCtx={beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},
 stroke(){seamStrokeColors.push(this.strokeStyle)},
 ellipse(){},arc(){},fillRect(){},strokeRect(){},fillText(){}};
const seamArtwork=createArtwork(seamAuditCtx,selectProject,()=>1);
seamArtwork.drawWall(selectionWorld.walls.get('6,10'),selectionWorld);
assert(!seamStrokeColors.includes('#536563')&&!seamStrokeColors.includes('#82968f'),
 'Exterior wall panels have no vertical separator strokes');
console.log('Life in Motion v3 QA PASS: geometry, navigation, population, powers, hazards, reinforcement cap, saving, RNG, pause and victory');
