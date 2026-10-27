import test from 'node:test';
import assert from 'node:assert/strict';
import {JOBS,assignPrimaryJobs,assignCoverage,effectiveDuty} from '../src/employee-jobs.js';
import {makeGame} from '../src/simulation.js';
import {createHardwareStore} from '../src/world.js';

const employee=()=>({role:'employee',alive:true,arrested:false,unconscious:0});
test('8 employees receive one of each primary job',()=>{
 const employees=Array.from({length:8},employee);
 assignPrimaryJobs(employees);
 assert.deepEqual(employees.map(n=>n.primaryJob),JOBS);
 assert.equal(new Set(employees.map(n=>n.primaryJob)).size,8);
});
test('no role gets a second employee until all eight have one, and manager is unique',()=>{
 for(const count of [8,12,16]){
  const employees=Array.from({length:count},employee);
  assignPrimaryJobs(employees);
  assert.equal(employees.filter(n=>n.primaryJob==='Store Manager').length,1);
  assert.deepEqual([...new Set(employees.slice(0,8).map(n=>n.primaryJob))],JOBS);
  assert.equal(employees.filter(n=>n.primaryJob==='Cashier').length>=1,true);
  assert.equal(employees.filter(n=>n.primaryJob==='Service Associate').length>=1,true);
 }
});
test('temporary desk cover preserves the displayed primary job',()=>{
 const employees=Array.from({length:8},employee);
 assignPrimaryJobs(employees);
 employees[1].unconscious=30;
 assignCoverage(employees);
 const substitute=employees.find(n=>n.coveringJob==='Service Associate');
 assert.ok(substitute);
 assert.notEqual(substitute.primaryJob,'Service Associate');
 assert.equal(effectiveDuty(substitute),'service');
 assert.equal(employees[0].primaryJob,'Cashier');
 employees[1].unconscious=0;
 assignCoverage(employees);
 assert.equal(employees.every(n=>!n.coveringJob),true);
});
test('real starting worlds retain original employee/customer simulator roles',()=>{
 const g=makeGame(createHardwareStore(),{seed:3128,staff:8,customers:2});
 const employees=g.npcs.filter(n=>n.role==='employee');
 assert.deepEqual(employees.map(n=>n.primaryJob),JOBS);
 assert.equal(employees.find(n=>n.primaryJob==='Cashier').duty,'cashier');
 assert.equal(employees.find(n=>n.primaryJob==='Service Associate').duty,'service');
 assert.equal(g.npcs.filter(n=>n.role==='customer').length,2);
});

test('an old save with duplicate roles fills missing jobs before doubling up',()=>{
 const employees=Array.from({length:8},employee);
 employees[0].primaryJob='Cashier';
 employees[1].primaryJob='Cashier';
 assignPrimaryJobs(employees);
 assert.deepEqual([...new Set(employees.map(n=>n.primaryJob))].sort(),[...JOBS].sort());
 assert.equal(employees.filter(n=>n.primaryJob==='Store Manager').length,1);
});
test('the manager can cover a missing desk when no other substitute is active',()=>{
 const employees=Array.from({length:8},employee);
 assignPrimaryJobs(employees);
 for(const n of employees)if(!['Cashier','Store Manager'].includes(n.primaryJob))n.unconscious=30;
 assignCoverage(employees);
 assert.equal(employees[0].coveringJob,null);
 assert.equal(employees[7].coveringJob,'Service Associate');
 assert.equal(employees[7].primaryJob,'Store Manager');
});
