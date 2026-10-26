// Run from the repository root: node --experimental-default-type=module --test v3/tests/animation-layers.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {animationLayers,blendSecondary} from '../src/animation-layers.js';
import {npcLimbPose} from '../src/npc-pose.js';
import {animationDetail,adaptiveFrameRate,animationRenderOptions} from '../src/animation-quality.js';
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

test('activity overlays preserve connected elbows and finite joints',()=>{
 for(const action of ['talk','offerHelp','scan','type','stock','inspect','idle']){
  const pose=npcLimbPose({...npc,action,actionPhase:3.2});
  for(const arm of pose.arms){
   for(const part of ['shoulder','elbow','wrist']){
    assert.ok(Number.isFinite(arm[part].x));
    assert.ok(Number.isFinite(arm[part].y));
   }
   const midpoint=(arm.shoulder.y+arm.wrist.y)/2+.65;
   assert.ok(Math.abs(arm.elbow.y-midpoint)<1e-9);
  }
 }
});
test('secondary gestures stop while walking or incapacitated',()=>{
 const walking=npcLimbPose({...npc,path:[{x:5,y:5}],walkDistance:2});
 assert.equal(walking.active,true);
 const down=npcLimbPose({...npc,unconscious:4,action:'talk'});
 assert.equal(down.active,false);
 assert.equal(animationLayers({...npc,alive:false}).idleBreath,0);
});

test('zoom and performance reduce secondary animation, never essential actions',()=>{
 const high=animationDetail({zoom:1.1,fps:60});
 const low=animationDetail({zoom:.3,fps:15});
 assert.equal(high.level,'high');
 assert.equal(low.level,'low');
 assert.equal(low.essential,true);
 const moving={...npc,path:[{x:2,y:3}],walkDistance:1.5};
 assert.equal(npcLimbPose(moving,0,animationRenderOptions(low)).active,true);
 assert.equal(npcLimbPose(moving,0,animationRenderOptions(high)).active,true);
});
test('low quality suppresses only secondary idle motion',()=>{
 const idle={...npc,action:'idle',actionPhase:3};
 const high=npcLimbPose(idle,0,animationRenderOptions(animationDetail({zoom:1.3,fps:60})));
 const low=npcLimbPose(idle,0,animationRenderOptions(animationDetail({zoom:.3,fps:15})));
 assert.notEqual(high.body,low.body);
 assert.equal(low.body,0);
});
test('frame-rate averaging and invalid measurements remain bounded',()=>{
 assert.equal(adaptiveFrameRate(60,1/60),60);
 assert.ok(adaptiveFrameRate(60,1/20)<60);
 assert.ok(Number.isFinite(adaptiveFrameRate(60,NaN)));
});
