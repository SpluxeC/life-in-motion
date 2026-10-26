import test from 'node:test';
import assert from 'node:assert/strict';
import {createPowerEffects,POWER_EFFECT_PALETTE} from '../src/power-effects.js';
const fakeCtx={beginPath(){},arc(){},stroke(){},save(){},restore(){},fill(){},fillRect(){},moveTo(){},lineTo(){},closePath(){}};
test('six approved power types have distinct effect signatures',()=>{
 const names=['suspicion','anger','whisper','command','sabotage','hazard'];
 assert.deepEqual(Object.keys(POWER_EFFECT_PALETTE),names);
 assert.equal(new Set(Object.values(POWER_EFFECT_PALETTE)).size,6);
});
test('invalid activations never schedule a visual effect',()=>{
 const fx=createPowerEffects(fakeCtx,()=>({x:0,y:0}),()=>1);
 assert.equal(fx.trigger('nonexistent',{id:'n1'},0),false);
 assert.equal(fx.trigger('anger',null,0),false);
 assert.equal(fx.trigger('anger',{id:'n1'},NaN),false);
 assert.equal(fx.activeCount,0);
});
test('visuals are isolated from gameplay and clear on world transitions',()=>{
 const fx=createPowerEffects(fakeCtx,()=>({x:0,y:0}),()=>1);
 const npc={id:'n1',rx:2,ry:5};
 const unchanged=structuredClone(npc);
 assert.equal(fx.trigger('whisper',npc,12),true);
 assert.equal(fx.activeCount,1);
 assert.deepEqual(npc,unchanged);
 fx.setReducedMotion(true);
 fx.draw(12,{npcs:[npc]});
 fx.clear();
 assert.equal(fx.activeCount,0);
});
