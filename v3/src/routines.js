// Life in Motion v3 — deterministic, inspectable daily routines on the real world grid.
// A routine reserves no collision tiles, follows existing pathfinding and survives saves.
import {nearestOpen,pathTo,walkable} from './world.js?v=center-red-tool-rack-map18-20261024';
import {departmentItem} from './merchandise.js?v=driver-side-forklift-wheels-20261023-1';
import {checkoutStaffPosition,checkoutCustomerPosition} from './checkout-layout.js?v=driver-side-forklift-wheels-20261023-1';

export const ROUTINE_STOPS=[
 {x:7,y:24,label:'paint and tools aisle'},
 {x:13,y:25,label:'tools aisle'},
 {x:19,y:24,label:'electrical aisle'},
 {x:25,y:25,label:'plumbing aisle'},
 {x:33,y:30,label:'hardware aisle'},
 {x:42,y:33,label:'garden center'},
 {x:28,y:37,label:'receiving area'},
 {x:41,y:18,label:'employee break room'},
 {x:27,y:8,label:'parking lot'}
];
const near=(n,p,r=1)=>Math.hypot(n.rx-p.x,n.ry-p.y)<=r;
const isShopper=n=>n.alive&&n.role==='customer'&&!n.arrested&&n.unconscious<=0;
const isAvailable=n=>n.alive&&!n.arrested&&n.unconscious<=0;
const accessible=(g,p)=>nearestOpen(g.world,p.x,p.y);
function target(g,n,desired){
 const destination=accessible(g,desired),from={x:n.rx,y:n.ry};
 if(near(n,destination,.7))return {destination,path:[]};
 const path=pathTo(g.world,from,destination);
 if(!path.length)return null;
 return {destination,path};
}
function schedule(g,n,kind,desired,duration=6,details={}){
 const trip=target(g,n,desired);if(!trip)return false;
 n.path=trip.path;n.target=trip.destination;
 n.task={kind,position:trip.destination,phase:trip.path.length?'walking':'working',
  until:trip.path.length?0:g.elapsed+duration,duration,...details};
 n.activity=details.label||kind;n.action=trip.path.length?'walk':'idle';n.actionPhase=0;
 return true;
}
function fixture(g,type,index=0){
 const all=g.world.fixtures.filter(f=>f.type===type);
 return all[index%Math.max(1,all.length)];
}
function station(g,n){
 const f=n.duty==='service'?fixture(g,'serviceDesk'):fixture(g,'checkout',n.stationIndex||0);
 if(!f)return {x:20,y:15};
 // Cashiers and service workers work from the north (-Y) computer
 // side. Customers approach the opposite south (+Y) face.
 return checkoutStaffPosition(f);
}
function parking(n){const bays=[10,18,26,34,42,50,58];return {x:bays[(n.parkingIndex||0)%bays.length],y:8}}
function customerShopTarget(g,n){
 const shelves=g.world.fixtures.filter(f=>f.type==='shelf');
 const index=(n.shoppingIndex||0)%shelves.length;
 const s=shelves[index];
 return {x:s.x+2,y:s.y+2,department:s.department,shelfId:s.id};
}
function canHelp(g,n){
 // One roving floor employee follows the entire map loop; other associates
 // can interrupt their route for customer conversations and restocking.
 if(n.duty!=='floor'||n.stationIndex===0||g.elapsed<(n.nextHelpAt||0))return null;
 return g.npcs.filter(c=>isShopper(c)&&!c.helpedBy&&c.task?.kind==='browse'&&
  Math.hypot(c.rx-n.rx,c.ry-n.ry)<17).sort((a,b)=>
   Math.hypot(a.rx-n.rx,a.ry-n.ry)-Math.hypot(b.rx-n.rx,b.ry-n.ry))[0];
}
function assignHelp(g,n,c){
 const here={x:Math.round(c.rx),y:Math.round(c.ry)};
 const free=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:here.x+dx,y:here.y+dy}))
  .filter(p=>walkable(g.world,p.x,p.y));
 for(const p of free){
  if(schedule(g,n,'help',p,4,{customerId:c.id,label:'Asking '+c.name+' if they need help'})){
   c.helpedBy=n.id;c.path=[];c.task={kind:'helped',phase:'working',position:{x:c.rx,y:c.ry},duration:Math.max(18,Math.hypot(c.rx-n.rx,c.ry-n.ry)*2.6),until:g.elapsed+Math.max(18,Math.hypot(c.rx-n.rx,c.ry-n.ry)*2.6)};
   c.activity='Getting assistance';c.action='talk';n.nextHelpAt=g.elapsed+28;return true;
  }
 }
 return false;
}
export function initializeRoutine(n,employeeIndex=0){
 n.action='idle';n.actionPhase=0;n.task=null;n.workIndex=0;n.shoppingIndex=0;
 n.breakAt=65+(employeeIndex%3)*19;n.nextHelpAt=0;
 if(n.role==='employee'){
  n.duty=employeeIndex===0?'cashier':employeeIndex===1?'service':'floor';
  n.stationIndex=employeeIndex>2?(employeeIndex-2)%3:0;
  n.workIndex=employeeIndex*2;
 }else if(n.role==='customer'){
  n.duty='shopper';n.parkingIndex=Math.floor(employeeIndex%7);n.tripStage='arriving';
 }
}
function staffDuty(g,n){
 if(!n.duty||n.duty==='shopper')initializeRoutine(n,g.npcs.filter(o=>o.role==='employee').indexOf(n));
 if(g.elapsed>=(n.breakAt||Infinity)){
  n.breakAt=g.elapsed+100;n.workIndex++;
  if(schedule(g,n,'break',{x:40,y:18},12,{label:'Taking an employee break'}))return true;
 }
 if(n.duty==='cashier'||n.duty==='service'){
  const place=station(g,n),what=n.duty==='cashier'?'Working checkout register':'Staffing customer service';
  return schedule(g,n,n.duty,place,22+g.random()*12,{label:what});
 }
 const c=canHelp(g,n);if(c&&assignHelp(g,n,c))return true;
 // A floor associate also restocks merchandise depleted by shoppers.
 const low=(n.stationIndex===0?[]:g.world.fixtures).filter(f=>f.type==='shelf'&&f.stock!==undefined&&f.stock<=4&&
  (!f.restockingBy||!g.npcs.some(o=>o.id===f.restockingBy&&o.task?.kind==='restock'&&isAvailable(o))))
  .sort((a,b)=>Math.hypot(a.x-n.rx,a.y-n.ry)-Math.hypot(b.x-n.rx,b.y-n.ry))[0];
 if(low&&schedule(g,n,'restock',{x:low.x+2,y:low.y+2},7,{shelfId:low.id,label:'Restocking '+low.department?.toLowerCase()+' shelves'})){
  low.restockingBy=n.id;return true;
 }
 const spot=ROUTINE_STOPS[(n.workIndex||0)%ROUTINE_STOPS.length];n.workIndex=(n.workIndex||0)+1;
 return schedule(g,n,'patrol',spot,4+g.random()*6,{label:spot.label==='parking lot'?'Checking parking lot':spot.label==='employee break room'?'Checking employee area':'Walking '+spot.label});
}
function shopperDuty(g,n){
 if(!n.duty)initializeRoutine(n,g.npcs.indexOf(n));
 if(n.tripStage==='arriving'){
  n.tripStage='browse';return schedule(g,n,'enter',{x:20,y:12},2,{label:'Entering the store'});
 }
 if(n.tripStage==='browse'){
  const index=n.shoppingIndex||0;
  // Visit the outdoor garden during every second shopping circuit.
  if(index>0&&index%3===2){
   n.tripStage='checkout';return schedule(g,n,'garden',{x:43,y:33},8,{label:'Shopping in the garden center'});
  }
  const stop=customerShopTarget(g,n);n.shoppingIndex=index+1;
  n.tripStage=index%3===1?'checkout':'browse';
  return schedule(g,n,'browse',stop,7+g.random()*5,{shelfId:stop.shelfId,label:'Browsing '+stop.department?.toLowerCase()+' products'});
 }
 if(n.tripStage==='checkout'){
  n.tripStage='leaving';const counter=fixture(g,'checkout',(n.parkingIndex||0)%3);
  return schedule(g,n,'checkout',checkoutCustomerPosition(counter),7,{label:'Waiting on customer side of checkout'});
 }
 if(n.tripStage==='leaving'){
  n.tripStage='returning';return schedule(g,n,'leave',parking(n),8,{label:'Returning to parked car'});
 }
 if(n.tripStage==='returning'){
  n.tripStage='arriving';return schedule(g,n,'parking',parking(n),6,{label:'In the parking lot'});
 }
 n.tripStage='browse';return false;
}
export function chooseRoutine(g,n){
 if(!isAvailable(n)||!['employee','customer'].includes(n.role)||n.panic>0)return false;
 if(n.task){
  if(n.task.kind==='helped'&&!g.npcs.some(x=>x.id===n.helpedBy&&isAvailable(x))){
   n.helpedBy=null;n.task=null;
  }else{
   // Floor workers notice nearby browsers even while patrolling.
   if(n.duty==='floor'&&n.task.kind==='patrol'){
    const c=canHelp(g,n);if(c&&assignHelp(g,n,c))return true;
   }
   return true;
  }
 }
 return n.role==='employee'?staffDuty(g,n):shopperDuty(g,n);
}
export function updateRoutine(g,n,dt){
 if(!isAvailable(n)||!n.task)return;
 const task=n.task;
 const animate={
  cashier:'scan',service:'type',patrol:'inspect',help:'offerHelp',helped:'talk',
  break:'drink',restock:'stock',enter:'look',browse:'inspect',garden:'inspect',checkout:'wait',
  leave:'walk',parking:'look'
 };
 if(task.phase==='walking'){
  n.action='walk';
  if(n.path.length)return;
  if(!near(n,task.position,.85)){n.task=null;n.think=.15;return;}
  task.phase='working';task.until=g.elapsed+task.duration;n.actionPhase=0;
 }
 n.action=animate[task.kind]||'idle';n.actionPhase=(n.actionPhase||0)+dt;
 // Staff ask customers for help near their workstation without abandoning it.
 if(['cashier','service'].includes(task.kind)){
  const c=g.npcs.find(c=>isShopper(c)&&Math.hypot(c.rx-n.rx,c.ry-n.ry)<3.4);
  if(c){n.action=task.kind==='cashier'?'scan':'offerHelp';n.activity=task.kind==='cashier'?'Checking out a customer':'Helping at customer service'}
 }
 if(task.kind==='help'){
  const c=g.npcs.find(c=>c.id===task.customerId);
  if(c&&near(n,c,2.4)){
   n.action='offerHelp';n.activity='Asking '+c.name+' if they need help';
   if(c.task?.kind==='helped'&&!task.conversationLogged)c.task.until=g.elapsed+4;
   if(!task.conversationLogged){task.conversationLogged=true;const words=['Can I help you find something?','Looking for anything in particular?','Need a hand finding the right aisle?'];g.log.unshift({time:Math.floor(g.elapsed),text:n.name+': '+words[Math.floor(g.random()*words.length)]});g.log.length=Math.min(g.log.length,100)}
  }
 }
 if(task.until>g.elapsed)return;
 if(task.kind==='browse'){
  const shelf=g.world.fixtures.find(f=>f.id===task.shelfId);
  if(shelf&&shelf.stock>0&&n.inventory.length<4){
   // Shoppers pick up one of the *same* real products drawn on these shelves.
   // Vary purchases within each department without adding RNG side effects.
   const product=departmentItem(shelf.department,(n.shoppingIndex||0)+shelf.stock);
   n.inventory.push(product);shelf.stock--;
   n.activity='Picked up '+(shelf.department||'hardware').toLowerCase()+' products';
  }
 }
 if(task.kind==='checkout'){
  n.purchases=(n.purchases||0)+1;
  if(g.random()<.32){g.log.unshift({time:Math.floor(g.elapsed),text:n.name+' checked out at a register.'});g.log.length=Math.min(g.log.length,100)}
 }
 if(task.kind==='restock'){
  const shelf=g.world.fixtures.find(f=>f.id===task.shelfId);
  if(shelf){shelf.stock=Math.min(shelf.capacity||12,(shelf.stock||0)+5);shelf.restockingBy=null}
 }
 if(task.kind==='helped')n.helpedBy=null;
 if(task.kind==='help'){
  const c=g.npcs.find(c=>c.id===task.customerId);
  if(c&&c.helpedBy===n.id){c.helpedBy=null;if(c.task?.kind==='helped'){c.task=null;c.tripStage='browse';c.think=.15}}
 }
 n.task=null;n.action='idle';n.actionPhase=0;n.think=Math.min(n.think||1,.15);
}
