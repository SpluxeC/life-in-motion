import test from 'node:test';
import assert from 'node:assert/strict';
import {tickDamageRecovery,debrisBlocksMovement} from '../src/damage-recovery.js';
import {createHardwareStore} from '../src/world.js';
const npc=(id,role,x,y)=>({id,role,x,y,rx:x,ry:y,alive:true,unconscious:0,path:[],activity:'idle'});
test('fallen signs persist without responders and block movement',()=>{
 const g={world:{damage:[{id:'d',kind:'fallenSign',signId:'department-sign-PAINT',x:4,y:5,until:4}]},npcs:[]};
 tickDamageRecovery(g,1);
 assert.equal(g.world.damage.length,1);assert.equal(g.world.damage[0].until,null);
 assert.equal(debrisBlocksMovement(g.world,4,5),true);
});
test('trapped victim is rescued then debris cleared by worker',()=>{
 const victim=npc('v','customer',4,5);victim.trappedBy='d';
 const medic=npc('m','paramedic',5,5),employee=npc('e','employee',5,4);
 const g={world:{damage:[{id:'d',kind:'fallenSign',x:4,y:5,phase:'fallen'}],fixtures:[],props:[]},npcs:[victim,medic,employee]};
 tickDamageRecovery(g,5);
 assert.equal(victim.trappedBy,null);
 assert.equal(g.world.damage[0].phase,'clearing');
 tickDamageRecovery(g,9);
 assert.equal(g.world.damage.length,0);
 assert.equal(debrisBlocksMovement(g.world,4,5),false);
});
test('without nearby workers unresolved debris remains',()=>{
 const world=createHardwareStore();world.damage=[{id:'d',kind:'fallenBox',x:4,y:5,phase:'clearing'}];
 const g={world,npcs:[npc('e','employee',65,40)]};
 tickDamageRecovery(g,100);assert.equal(g.world.damage.length,1);
});
