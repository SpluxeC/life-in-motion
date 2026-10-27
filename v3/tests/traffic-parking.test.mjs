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
 assert.equal(cars.length,9);
 assert.ok(cars.every(v=>v.x>=5&&v.x<=53&&v.y===4));
 assert.ok(cars.every(v=>v.vehicleModel!=='taxi'));
});

test('customer traffic reserves a free stall and begins approaching via entry lane',()=>{
 const w=createHardwareStore();
 w._trafficClock=0;
 addPassingTraffic(w,30);
 const v=w.props.find(p=>p.trafficState==='arriving');
 assert.ok(v);
 assert.ok([13,25,37,49].includes(v.parkingSpot));
 assert.deepEqual(v.route[0],{x:72,y:2});
});
test('cars stop for pedestrians in their projected path',()=>{
 const car={type:'car',x:30,y:2,targetX:40,targetY:2,route:[{x:40,y:2}]};
 advanceTraffic([car],.5,[{alive:true,x:31,y:2}]);
 assert.equal(car.x,30);
});
