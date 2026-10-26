import test from 'node:test';
import assert from 'node:assert/strict';
import {emergencyVehicleVisual,vehicleMotionState} from '../src/vehicle-animation.js';
test('emergency strobes are deterministic and pause with simulation time',()=>{
 const vehicle={emergency:true,color:'#668ba9',x:2,y:2,targetX:5,targetY:2};
 assert.deepEqual(emergencyVehicleVisual(vehicle,4),emergencyVehicleVisual(vehicle,4));
 assert.notEqual(emergencyVehicleVisual(vehicle,4).phase,emergencyVehicleVisual(vehicle,4.2).phase);
});
test('only emergency vehicles flash and legacy vehicles stay safe',()=>{
 assert.equal(emergencyVehicleVisual({type:'car'},4),null);
 assert.equal(emergencyVehicleVisual({emergency:true},4).role,'medical');
});
test('motion reading does not mutate saved vehicle fields',()=>{
 const car={x:2,y:3,targetX:3,targetY:3,emergency:true};
 const before=structuredClone(car);
 assert.equal(vehicleMotionState(car).moving,true);
 assert.equal(vehicleMotionState({x:2,y:3}).moving,false);
 assert.deepEqual(car,before);
});
