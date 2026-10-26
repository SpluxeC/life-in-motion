import test from 'node:test';
import assert from 'node:assert/strict';
import {environmentCue,environmentCues} from '../src/environment-effects.js';
test('only live supported hazards produce cues',()=>{
 assert.equal(environmentCue({kind:'fire',life:0},2),null);
 assert.equal(environmentCue({kind:'unknown',life:5},2),null);
 for(const kind of ['fire','spill','electric'])assert.equal(environmentCue({kind,x:2,y:3,life:5},2).kind,kind);
});
test('paused simulation time freezes hazard animation and never mutates game state',()=>{
 const world={hazards:[{kind:'fire',x:2,y:3,life:4},{kind:'spill',x:4,y:6,life:3}]};
 const original=structuredClone(world);
 assert.deepEqual(environmentCues(world,14),environmentCues(world,14));
 assert.deepEqual(world,original);
});
test('expired hazards cannot leave decorative effects',()=>{
 assert.equal(environmentCues({hazards:[{kind:'electric',life:-1}]},2).length,0);
 assert.equal(environmentCues({},2).length,0);
});
