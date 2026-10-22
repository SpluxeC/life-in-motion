import assert from 'node:assert/strict';
import {createHardwareStore,walkable,pathTo,doorAt} from '../src/world.js';
import {makeGame,applyPower,updateGame,addHazard} from '../src/simulation.js';
import {saveGame,loadGame} from '../src/persistence.js';
import {createArtwork} from '../src/artwork.js';
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
const drawingMethods=new Set(['beginPath','moveTo','lineTo','closePath','fill','stroke','ellipse','fillRect','strokeRect','fillText','arc']);
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
console.log('Life in Motion v3 QA PASS: geometry, navigation, population, powers, hazards, reinforcement cap, saving, RNG, pause and victory');
