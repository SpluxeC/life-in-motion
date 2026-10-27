import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceTraffic,addPassingTraffic} from '../src/traffic-ai.js';
import {createHardwareStore} from '../src/world.js';

test('traffic uses separated opposing road lanes',()=>{
 const w=createHardwareStore();w.props=[];
 addPassingTraffic(w,24);
 assert.equal(w.props[0].x,72);
 addPassingTraffic(w,48);
 assert.equal(w.props[1].x,67);
});
test('vehicle motion respects spacing to car ahead',()=>{
 const lead={type:'car',x:8,y:2,targetX:14,targetY:2,route:[{x:14,y:2}]};
 const following={type:'car',x:5.5,y:2,targetX:14,targetY:2,route:[{x:14,y:2}]};
 advanceTraffic([lead,following],.5);
 assert.ok(Math.hypot(lead.x-following.x,lead.y-following.y)>=2.7);
});
test('all parked cars stay inside divided stalls',()=>{
 const w=createHardwareStore(),cars=w.props.filter(p=>p.id?.startsWith('car-'));
 assert.equal(cars.length,13);
 assert.ok(cars.every((v,i)=>v.x===5+i*4&&v.y===4));
 assert.ok(cars.every(v=>v.vehicleModel!=='taxi'));
});
