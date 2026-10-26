import test from 'node:test';
import assert from 'node:assert/strict';
import {npcExpression,npcReactionPose} from '../src/npc-expression.js';
import {npcLimbPose} from '../src/npc-pose.js';
const base={id:'npc-1',alive:true,health:100,pain:0,unconscious:0,emotion:{fear:0,anger:0,stress:0},path:[],action:'idle'};
test('emotion thresholds yield accurate visual reactions',()=>{
 assert.equal(npcExpression(base).kind,'calm');
 assert.equal(npcExpression({...base,emotion:{fear:80}}).kind,'terrified');
 assert.equal(npcExpression({...base,emotion:{anger:80}}).kind,'furious');
 assert.equal(npcExpression({...base,emotion:{stress:80}}).kind,'stressed');
});
test('injury and incapacitation override ordinary expressions',()=>{
 assert.equal(npcExpression({...base,pain:80}).kind,'hurt');
 assert.equal(npcExpression({...base,unconscious:3}).kind,'unconscious');
 assert.equal(npcExpression({...base,alive:false}).kind,'deceased');
});
test('conversation expressions require a real conversation action',()=>{
 assert.equal(npcExpression({...base,action:'talk'}).kind,'engaged');
 assert.equal(npcExpression({...base,task:{kind:'help'}}).kind,'engaged');
});
test('locomotion suppresses body reactions without hiding emotions',()=>{
 const r=npcReactionPose({...base,path:[{x:4,y:5}],emotion:{fear:90}});
 assert.equal(r.face.kind,'terrified');
 assert.equal(r.lean,0);
 assert.equal(r.guard,0);
});
test('presentation helpers do not mutate NPCs and support older saves',()=>{
 const snapshot=structuredClone(base);
 npcReactionPose(base);
 assert.deepEqual(base,snapshot);
 assert.equal(npcExpression({alive:true}).kind,'calm');
});

test('attack and hit reactions only play within event windows',()=>{
 const hit={...base,hitReactionUntil:12,hitReactionAt:11.5};
 const before=npcLimbPose(hit,11);
 const during=npcLimbPose(hit,11.75);
 const after=npcLimbPose(hit,12.2);
 assert.notDeepEqual(during.arms,before.arms);
 assert.deepEqual(before.arms,after.arms);
 const attack={...base,attackReactionUntil:15,attackReactionAt:14.6};
 assert.notDeepEqual(npcLimbPose(attack,14.8).arms,npcLimbPose(attack,15.1).arms);
});
test('no reaction animation on older records without timestamps',()=>{
 const n={...base};
 assert.deepEqual(npcLimbPose(n,100).arms,npcLimbPose(n,101).arms);
});
