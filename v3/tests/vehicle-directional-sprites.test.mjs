import test from 'node:test';
import assert from 'node:assert/strict';
import {vehicleFacing,vehicleSpriteKind} from '../src/vehicle-directional-sprites.js';

test('moving vehicle orientation responds to movement direction',()=>{
 const v={x:10,y:10,targetX:13,targetY:10,heading:0};
 const east=vehicleFacing(v,45);
 v.targetX=7;
 assert.notEqual(vehicleFacing(v,45),east);
});
test('four cardinal directions produce four sprite views',()=>{
 const v={x:10,y:10,heading:0};
 const directions=[[3,0],[-3,0],[0,3],[0,-3]].map(([dx,dy])=>vehicleFacing({...v,targetX:10+dx,targetY:10+dy},45));
 assert.equal(new Set(directions).size,4);
});
test('parked vehicle remembers saved heading',()=>{
 const v={x:10,y:10,targetX:10,targetY:10,heading:1.57};
 assert.equal(vehicleFacing(v,45),vehicleFacing({...v,targetX:10,targetY:14},45));
});
test('emergency types retain distinctive sprites',()=>{
 assert.equal(vehicleSpriteKind({emergency:true,color:'#b9594d'}),'fire');
 assert.equal(vehicleSpriteKind({emergency:true,color:'#668ba9'}),'police');
 assert.equal(vehicleSpriteKind({emergency:true,color:'#fff'}),'ambulance');
});
