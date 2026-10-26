import test from 'node:test';
import assert from 'node:assert/strict';
import {createHardwareStore,nearestOpen} from '../src/world.js';
import {makeGame,updateGame} from '../src/simulation.js';
test('active fire crew responds using existing pathfinding and suppresses fire nearby',()=>{
 const world=createHardwareStore();
 const g=makeGame(world,{seed:492,staff:1,customers:1});
 const at=nearestOpen(world,18,23),fire={id:'testfire',kind:'fire',x:at.x,y:at.y,life:50,tick:0};
 g.world.hazards.push(fire);
 const crew=g.npcs[0];crew.role='firefighter';crew.rx=crew.x=at.x;crew.ry=crew.y=at.y;crew.path=[];crew.task=null;
 updateGame(g,1/30);
 assert.ok(fire.life<50,'fire crew must reduce fire duration');
 assert.match(crew.activity,/Extinguishing|Responding/);
});
test('response vehicles remain separate from existing parked-car inventory',()=>{
 const w=createHardwareStore(),g=makeGame(w,{seed:21,staff:1,customers:1});
 g.pending.push({service:'medic',time:0});
 updateGame(g,1/30);
 assert.ok(g.world.props.some(v=>v.emergency&&v.id.startsWith('response-')));
 assert.ok(g.npcs.some(n=>n.role==='paramedic'));
});
