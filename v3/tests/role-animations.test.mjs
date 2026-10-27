import test from 'node:test';
import assert from 'node:assert/strict';
import {npcLimbPose} from '../src/npc-pose.js';

const npc=action=>({id:'npc-2',action,actionPhase:.25,walkDistance:0,path:[],alive:true,unconscious:0,emotion:{},health:100,pain:0});
test('each employee task keeps both animated wrists available for held objects',()=>{
 for(const action of ['scan','type','stock','offerHelp','measure','lift','review','inspect']){
  const pose=npcLimbPose(npc(action),1);
  assert.equal(pose.arms.length,2);
  assert.ok(pose.arms.every(a=>Number.isFinite(a.wrist.x)&&Number.isFinite(a.wrist.y)),action);
 }
});
test('receiving and lumber hand poses differ from idle pose',()=>{
 const a=npcLimbPose(npc('lift'),1),b=npcLimbPose(npc('measure'),1),c=npcLimbPose(npc('idle'),1);
 assert.notDeepEqual(a.arms.map(q=>q.wrist),c.arms.map(q=>q.wrist));
 assert.notDeepEqual(b.arms.map(q=>q.wrist),c.arms.map(q=>q.wrist));
});
