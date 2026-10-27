import {assignPrimaryJobs,assignCoverage,effectiveDuty} from './employee-jobs.js?v=staff-jobs-20261027-2';
import {createHardwareStore,nearestOpen,walkable} from './world.js?v=receiving-expansion-20261027-1';
import {rngFor} from './simulation.js?v=animation-sign-blood-hand-20261027-1';
const SAVE='life-in-motion-v3-round-v1',PROGRESS='life-in-motion-v3-progression-v1';
export const hasSave=()=>{try{return !!localStorage.getItem(SAVE)}catch{return false}};
export const getProgress=()=>{try{return JSON.parse(localStorage.getItem(PROGRESS)||'{"unlocked":["hardware-store"]}')}catch{return{unlocked:['hardware-store']}}};
export function saveGame(g){const world=g.world;const payload={schema:1,game:{...g,random:undefined,world:undefined,selected:null},rngState:g.random.state(),world:{id:world.id,layoutVersion:world.layoutVersion,doors:world.doors,fixtures:world.fixtures,props:world.props,damage:world.damage,drops:world.drops,hazards:world.hazards,sabotages:world.sabotages||[],electricalZones:world.electricalZones||[],walls:[...world.walls.entries()],blocking:[...world.blocking]},savedAt:Date.now()};
 try{localStorage.setItem(SAVE,JSON.stringify(payload));return true}catch{return false}}
export function loadGame(){try{let data=JSON.parse(localStorage.getItem(SAVE)||'null');if(!data||data.schema!==1||data.world?.id!=='hardware-store'||!Array.isArray(data.game?.npcs)||data.game.npcs.length>1000)return null;
 let world=createHardwareStore();
 const legacyLayout=data.world.layoutVersion!==world.layoutVersion || !Array.isArray(data.world.ground) || !data.world.ground.some(t=>t.x===19&&t.y===8&&t.area==='sidewalk') || !data.world.ground.some(t=>t.x===69&&t.y===49&&t.area==='road');
 if(!legacyLayout){
  Object.assign(world,data.world);
  world.walls=new Map(data.world.walls);
  world.blocking=new Set(data.world.blocking);
  world.sabotages=data.world.sabotages||[];
  world.electricalZones=data.world.electricalZones||[];
 }else{
  // Keep the upgraded architectural layout in older saved games, while
  // preserving existing people, stock levels, incidents and response vehicles.
  const oldFixtures=new Map((data.world.fixtures||[]).map(o=>[o.id,o]));
  world.fixtures=world.fixtures.map(o=>{
   // The renamed Garden Tools rack moved to the other side of the door.
   // Preserve stock from either older Garden Shelf position on upgrades.
   const saved=oldFixtures.get(o.id)||(o.id==='toolCabinet-14-24'?oldFixtures.get('toolCabinet-21-35'):
    o.id==='gardenToolsRack-35-28'?
    oldFixtures.get('bagPallet-35-32')||oldFixtures.get('bagPallet-32-35'):null);
   // Only the ORIGINAL shovel/rake rack inherits old shelf stock. The new
   // hoe/lopper rack and lawn mower receive their own fresh default values.
   return saved?{...o,stock:saved.stock??o.stock,damaged:saved.damaged??o.damaged}:o;
  });
  const oldDoors=new Map((data.world.doors||[]).map(o=>[o.id,o]));
  world.doors=world.doors.map(d=>{
   const previous=oldDoors.get(d.id);
   // Legacy receiving bays were two independent shutters. Preserve the
   // most-open panel state when merging them into one double-width opening.
   const second=d.type==='rollup'&&d.w===2?oldDoors.get('door-29-39'):null;
   return {...d,
    open:Math.max(previous?.open??d.open,second?.open??0),
    forceUntil:Math.max(previous?.forceUntil??0,second?.forceUntil??0)
   };
  });
  const originalProps=new Map((data.world.props||[]).map(o=>[o.id,o]));
  const basePropIds=new Set(world.props.map(o=>o.id));
  world.props=world.props.map(o=>{
   const previous=originalProps.get(o.id);
   return previous?{...o,x:previous.x,y:previous.y,targetX:previous.targetX,targetY:previous.targetY}:o;
  }).concat((data.world.props||[]).filter(o=>!basePropIds.has(o.id)&&(!['tree','shrub'].includes(o.type)||world.ground.some(tile=>tile.x===o.x&&tile.y===o.y&&tile.area==='landscape'))));
  world.damage=data.world.damage||[];
  world.drops=data.world.drops||[];
  world.hazards=data.world.hazards||[];
  world.electricalZones=data.world.electricalZones||[];
  world.sabotages=data.world.sabotages||[];
 }
 const random=rngFor(data.game.seed);random.restore(data.rngState);
 let g={...data.game,world,random,selected:null};
 const employees=g.npcs.filter(n=>n.role==='employee');
 assignPrimaryJobs(employees);
 assignCoverage(employees);
 for(const n of employees)n.duty=effectiveDuty(n);
 if(!Array.isArray(g.pending)||!Array.isArray(g.log)||!g.respondersRemaining)return null;
 if(legacyLayout){
  // Older pre-redesign paths may cross the newly enclosed hallway/fence.
  // Replan jobs instead of allowing NPCs to clip through new architecture.
  for(const n of g.npcs){
   const here=nearestOpen(world,n.rx??n.x,n.ry??n.y);
   if(!walkable(world,n.rx??n.x,n.ry??n.y)){
    n.x=n.rx=here.x;n.y=n.ry=here.y;
   }
   n.path=[];n.target=null;n.task=null;n.think=.1;
   n.cleaningTarget=null;n.cleaning=false;
  }
  for(const hazard of world.hazards){hazard.cleanerId=null;hazard.beingCleaned=false}
 }
 return g;
 }catch(error){console.warn('Life in Motion save migration failed:',error);return null}}
export function unlockMap(mapId){let progress=getProgress();if(!progress.unlocked.includes(mapId))progress.unlocked.push(mapId);try{localStorage.setItem(PROGRESS,JSON.stringify(progress))}catch{}}
