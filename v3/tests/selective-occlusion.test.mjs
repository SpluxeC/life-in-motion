import test from 'node:test';
import assert from 'node:assert/strict';
import {obstructionOpacity} from '../src/selective-occlusion.js';
import {renderDepth} from '../src/render-depth.js';
const project=(x,y,z=0)=>({x:x*10-y*10,y:-(x+y)*5-z});
const depth=(kind,obj)=>renderDepth(kind,obj,45);
test('unselected, unrelated, or non-solid objects never fade',()=>{
 const shelf={x:10,y:10,w:2,h:2},npc={rx:11,ry:11};
 assert.equal(obstructionOpacity('fixture',shelf,null,project,depth),1);
 assert.equal(obstructionOpacity('item',shelf,npc,project,depth),1);
 assert.equal(obstructionOpacity('fixture',{x:100,y:100},npc,project,depth),1);
});
test('near solid shelf overlapping focused NPC may fade',()=>{
 const npc={rx:11,ry:11},shelf={x:11,y:11,w:2,h:2};
 assert.equal(obstructionOpacity('fixture',shelf,npc,project,depth),.42);
});
test('farther objects remain opaque',()=>{
 const npc={rx:11,ry:11},shelf={x:15,y:15,w:2,h:2};
 assert.equal(obstructionOpacity('fixture',shelf,npc,project,depth),1);
});
