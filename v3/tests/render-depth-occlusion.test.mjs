import test from 'node:test';
import assert from 'node:assert/strict';
import {renderDepth,compareRenderDepth} from '../src/render-depth.js';
test('NPC feet determine draw depth regardless of sprite height',()=>{
 assert.equal(renderDepth('npc',{rx:10,ry:11,x:3,y:4}),21);
 assert.equal(renderDepth('npc',{rx:10,ry:11,h:90}),21);
});
test('closer actors draw after farther solid objects',()=>{
 const objects=[
 {kind:'fixture',depth:renderDepth('fixture',{x:12,y:12})},
 {kind:'npc',depth:renderDepth('npc',{rx:11,ry:11})}
 ].sort(compareRenderDepth);
 assert.deepEqual(objects.map(x=>x.kind),['fixture','npc']);
});
test('solid shelves, cars and walls occlude actors at same floor depth',()=>{
 for(const kind of ['fixture','wall','vehicle']){
  const items=[{kind,depth:20},{kind:'npc',depth:20}].sort(compareRenderDepth);
  assert.deepEqual(items.map(x=>x.kind),['npc',kind]);
 }
});
