import test from 'node:test';
import assert from 'node:assert/strict';
import {createHardwareStore,walkable,pathTo} from '../src/world.js';
test('rear receiving area is larger with perimeter storage and clear central lane',()=>{
 const w=createHardwareStore();
 assert.equal(w.layoutVersion,34);
 assert.equal(w.ground.find(t=>t.x===20&&t.y===48).area,'loading');
 assert.equal(w.ground.find(t=>t.x===36&&t.y===45).area,'loading');
 assert.ok(w.fixtures.filter(f=>f.y>=44&&f.y<=48&&f.x>=19&&f.x<=37).length>=7);
 for(let y=40;y<=48;y++)assert.ok(walkable(w,29,y),'central aisle '+y);
 assert.ok(pathTo(w,{x:29,y:40},{x:29,y:48}).length>0);
 const fixtures=w.fixtures.filter(f=>f.x>=19&&f.x<=37&&f.y>=40);
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j];
  assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y, a.id+' overlaps '+b.id);
 }
});
