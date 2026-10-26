// Run from the repository root: node --experimental-default-type=module --test v3/tests/animation-layers.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {animationLayers,blendSecondary} from '../src/animation-layers.js';
import {npcLimbPose} from '../src/npc-pose.js';
const npc={id:'employee-1',alive:true,unconscious:0,path:[],walkDistance:0,action:'talk',actionPhase:1.25,facing:'left',energy:80};
test('deterministic poses: paused simulation values produce identical frames',()=>{
 assert.deepEqual(npcLimbPose(npc,1),npcLimbPose(npc,500));
 assert.deepEqual(animationLayers(npc),animationLayers(npc));
});
test('walking has priority over gestures',()=>{
 const moving={...npc,path:[{x:3,y:2}],walkDistance:2};
 assert.equal(animationLayers(moving).activityWeight,0);
 assert.equal(animationLayers(moving).gesture,0);
 assert.equal(npcLimbPose(moving).active,true);
});
test('unconscious and dead characters never receive active movement layers',()=>{
 for(const changed of [{unconscious:2},{alive:false}]){
  const n={...npc,path:[{x:1,y:1}],...changed};
  assert.equal(animationLayers(n).walk,false);
  assert.equal(animationLayers(n).gesture,0);
 }
});
test('layer evaluation never mutates gameplay objects',()=>{
 const saved=structuredClone(npc);
 npcLimbPose(npc);
 assert.deepEqual(npc,saved);
});
test('safe blending clamps weights and invalid offsets',()=>{
 assert.equal(blendSecondary(10,5,2),15);
 assert.equal(blendSecondary(10,5,-1),10);
 assert.equal(blendSecondary(10,NaN,1),10);
});
test('fallback works on older saves without animation fields',()=>{
 const n={id:'old',alive:true,unconscious:0,path:[],facing:'left'};
 const pose=npcLimbPose(n);
 assert.equal(pose.arms.length,2);
 assert.equal(pose.legs.length,2);
 assert.ok(Number.isFinite(pose.body));
});
