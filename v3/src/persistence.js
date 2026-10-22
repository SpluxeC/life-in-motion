import {createHardwareStore} from './world.js';
import {rngFor} from './simulation.js';
const SAVE='life-in-motion-v3-round-v1',PROGRESS='life-in-motion-v3-progression-v1';
export const hasSave=()=>{try{return !!localStorage.getItem(SAVE)}catch{return false}};
export const getProgress=()=>{try{return JSON.parse(localStorage.getItem(PROGRESS)||'{"unlocked":["hardware-store"]}')}catch{return{unlocked:['hardware-store']}}};
export function saveGame(g){const world=g.world;const payload={schema:1,game:{...g,random:undefined,world:undefined,selected:null},rngState:g.random.state(),world:{id:world.id,doors:world.doors,fixtures:world.fixtures,props:world.props,damage:world.damage,drops:world.drops,hazards:world.hazards,walls:[...world.walls.entries()],blocking:[...world.blocking]},savedAt:Date.now()};
 try{localStorage.setItem(SAVE,JSON.stringify(payload));return true}catch{return false}}
export function loadGame(){try{let data=JSON.parse(localStorage.getItem(SAVE)||'null');if(!data||data.schema!==1||data.world?.id!=='hardware-store'||!Array.isArray(data.game?.npcs)||data.game.npcs.length>1000)return null;
 let world=createHardwareStore();Object.assign(world,data.world);world.walls=new Map(data.world.walls);world.blocking=new Set(data.world.blocking);
 const random=rngFor(data.game.seed);random.restore(data.rngState);
 let g={...data.game,world,random,selected:null};if(!Array.isArray(g.pending)||!Array.isArray(g.log)||!g.respondersRemaining)return null;return g;
 }catch{return null}}
export function unlockMap(mapId){let progress=getProgress();if(!progress.unlocked.includes(mapId))progress.unlocked.push(mapId);try{localStorage.setItem(PROGRESS,JSON.stringify(progress))}catch{}}
