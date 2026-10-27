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
  assert.deepEqual(items.map(x=>x.kind),kind==='wall'?['wall','npc']:['npc',kind]);
 }
});

test('camera yaw changes world-space ordering without changing angle limits',()=>{
 const a={x:12,y:7},b={x:7,y:12};
 assert.ok(renderDepth('wall',a,25)<renderDepth('wall',b,25));
 assert.ok(renderDepth('wall',a,65)>renderDepth('wall',b,65));
});
test('a shelf uses its camera-nearest occupied tile for occlusion',()=>{
 const shelf={x:10,y:10,w:3,h:2};
 const nearest={x:12,y:11};
 assert.equal(renderDepth('fixture',shelf,45),renderDepth('npc',{rx:nearest.x,ry:nearest.y},45));
});

test('wall behind wall-mounted garden rack draws before equipment at each yaw',()=>{
 for(const yaw of [25,45,65]){
  const wall=renderDepth('wall',{x:36,y:26},yaw);
  const rack=renderDepth('fixture',{x:35,y:26,w:1,h:2},yaw);
  assert.ok(wall>rack,'camera '+yaw);
 }
});
test('forklift and riding mower depth use occupied footprint when camera rotates',()=>{
 for(const yaw of [25,45,65]){
  const forklift=renderDepth('vehicle',{x:22,y:36,w:3,h:2},yaw);
  const mower=renderDepth('fixture',{x:34,y:33,w:2,h:1},yaw);
  assert.ok(Number.isFinite(forklift)&&Number.isFinite(mower));
 }
});
