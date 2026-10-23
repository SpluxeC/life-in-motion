// Life in Motion v3: authoritative, grid-based hardware store geometry.
export const WIDTH=76,HEIGHT=50;
export const key=(x,y)=>x+','+y;
export function createHardwareStore(){
 const walls=new Map(),doors=[],fixtures=[],props=[],ground=[],blocked=new Set();
 const wall=(x,y,section='exterior',axis='x')=>walls.set(key(x,y),{x,y,section,axis});
 const door=(x,y,type='hinged',label='Door',axis='x')=>doors.push({id:'door-'+x+'-'+y,x,y,type,label,axis,open:0,target:0,auto:type==='sliding',locked:false,forceUntil:0});
 const fixture=(type,x,y,w=1,h=1,extra={})=>fixtures.push({id:type+'-'+x+'-'+y,type,x,y,w,h,...extra});
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  let area=x>=65&&y<43?'road':y<10&&x<65?'parking':x===37&&y>=10&&y<=39?'sidewalk':x>=25&&x<=34&&y>=40&&y<=43?'loading':x>=38&&x<=46&&y>=10&&y<28?'employee':x>=38&&x<=48&&y>=28&&y<=39?'garden':y>=10&&y<=39&&x>=2&&x<=36?'store':x>=49&&x<=63&&y>=10&&y<44?'landscape':'grass';
  ground.push({x,y,area});
 }
 for(let x=2;x<=36;x++){wall(x,10);wall(x,39)}
 for(let y=10;y<=39;y++){wall(2,y,'exterior','y');wall(36,y,'exterior','y')}
 // Actual openings are the exact tiles occupied by animated doors.
 for(let x of [19,20])walls.delete(key(x,10));
 for(let x of [28,29])walls.delete(key(x,39));
 for(let y of [17,30])walls.delete(key(36,y));
 door(19,10,'sliding','Main entrance');door(20,10,'sliding','Main entrance');
 door(28,39,'rollup','Receiving door');door(29,39,'rollup','Receiving door');
 door(36,17,'hinged','Employee access','y');door(36,30,'hinged','Garden exit','y');
 // Staff wing has a complete exterior and rear wall, with functional room doors.
 for(let x=38;x<=46;x++){wall(x,10,'staff');wall(x,27,'staff')}
 for(let y=10;y<=27;y++){wall(38,y,'staff','y');wall(46,y,'staff','y')}
 for(let x=39;x<=45;x++)for(let y of [16,21])wall(x,y,'staff');
 // Hallway between the shop and staff wing is enclosed at both ends.
 wall(37,10,'staff');wall(37,27,'staff');
 for(let y of [12,19,24])walls.delete(key(38,y));
 for(let x of [42])for(let y of [16,21])walls.delete(key(x,y));
 door(38,12,'hinged','Staff office door','y');door(38,19,'hinged','Break room door','y');door(38,24,'hinged','Restroom door','y');
 door(42,16,'hinged','Inner staff door');door(42,21,'hinged','Inner staff door');
 // Timber fencing closes the outer garden edge; the store-side gate stays usable.
 // The building's rear wall already forms most of the garden's northern boundary.
 for(let y=28;y<=39;y++)for(let x of [38,48]){
  if(x===38&&y===30)continue;
  wall(x,y,'gardenFence','y');
 }
 for(let x=39;x<=47;x++)wall(x,39,'gardenFence','x');
 for(let x=47;x<=47;x++)wall(x,28,'gardenFence','x');
 door(38,30,'gate','Garden wooden gate','y');
 for(let x of [5,11,17,23,29])for(let band=0;band<2;band++){
  const start=band===0?18:27;
  fixture('shelf',x,start,1,5,{department:['PAINT','TOOLS','ELECTRICAL','PLUMBING','HARDWARE'][(x-5)/6],stock:7,capacity:12});
 }
 for(let x of [8,14,25])fixture('checkout',x,13,2,1);
 fixture('serviceDesk',31,13,2,1);
 fixture('paintMixer',5,15,1,1);fixture('keyCutter',15,15,1,1);
 fixture('saw',6,35,1,1);fixture('pallet',11,35,2,1);fixture('workbench',17,35,2,1);
 // Keep 25..32, 35..39 clear for unobstructed receiving circulation.
 fixture('lockers',43,13,2,1,{facing:'west'});fixture('office',40,13,1,1,{facing:'west'});
 fixture('vending',45,18,1,1,{facing:'west'});fixture('table',41,19,2,1,{facing:'south'});fixture('sink',44,24,1,1,{facing:'west'});fixture('restroom',41,24,1,1,{facing:'west'});
 fixture('plants',41,33,2,2);fixture('plants',45,35,1,2);fixture('gardenDesk',42,29,2,1);
 // Additional stocked departments and service details. Each solid asset reserves its true footprint.
 fixture('endcap',9,23,1,1,{department:'TOOLS',stock:6});fixture('endcap',21,23,1,1,{department:'ELECTRICAL',stock:6});
 fixture('endcap',32,25,1,1,{department:'HARDWARE',stock:6});
 fixture('bucketStack',9,33,1,1,{department:'PAINT',stock:6});
 fixture('lumberRack',14,35,2,1,{department:'LUMBER',stock:8});
 fixture('toolCabinet',21,35,2,1,{department:'TOOLS',stock:8});
 fixture('bagPallet',32,35,2,1,{department:'GARDEN',stock:9});
 fixture('drinkCooler',43,19,1,1,{department:'REFRESHMENTS',stock:8});
 fixture('safetyStation',34,17,1,1);fixture('utilityCart',4,16,1,1,{stock:4});
 fixture('hardwareBins',34,26,1,2,{department:'FASTENERS',stock:8});
 // Working receiving area: keep x=27..30 and y=35..43 free for hand trucks and NPCs.
 fixture('receivingDesk',23,37,2,1,{facing:'south'});
 fixture('boxStack',20,37,2,1);fixture('palletStack',17,37,2,1);
 fixture('handTruck',24,35,1,1);fixture('flatCart',33,37,2,1);
 fixture('palletStack',24,42,2,1);fixture('boxStack',32,42,2,1);
 fixture('handTruck',34,41,1,1);
 // Employee rooms: fixtures face the approachable side, not the wall behind them.
 fixture('filingCabinet',44,12,1,1,{facing:'west'});
 fixture('noticeBoard',45,14,1,1,{facing:'west'});
 fixture('coffeeStation',44,20,1,1,{facing:'west'});
 fixture('coatRack',39,18,1,1,{facing:'east'});
 fixture('storageShelves',45,25,1,1,{facing:'west'});
 fixture('supplyCabinet',39,25,1,1,{facing:'east'});
 // Garden beds are set back from the fence, leaving wide routes from the gate.
 fixture('flowerBed',40,36,2,1);fixture('flowerBed',44,32,2,1);
 fixture('flowerBed',46,34,1,1);fixture('seedDisplay',46,30,1,1,{facing:'west'});
 fixture('pottingBench',44,30,2,1,{facing:'south'});
 fixture('gardenBench',39,34,1,2,{facing:'east'});
 fixture('birdbath',43,37,1,1);fixture('wateringStation',46,37,1,1);
 fixture('planter',40,29,1,1);fixture('planter',47,32,1,1);
 for(let x of [7,15,23,31,40,48,56]){props.push({type:'car',id:'car-'+x,x,y:4,w:2,h:3,color:['#8faab5','#b8a28b','#697f89','#b5b6ae','#879994','#ae9691','#668b8c'][[7,15,23,31,40,48,56].indexOf(x)],heading:0});for(let xx=x;xx<x+2;xx++)for(let yy=4;yy<7;yy++)blocked.add(key(xx,yy))}
 // Road access stays unobstructed between the main lot and the east service road.
 for(let x of [4,12,20,28,36,44,52,60])props.push({id:'shrub-'+x,type:'shrub',x,y:1});
 for(let y of [12,20,28,37,45])props.push({id:'tree-'+y,type:'tree',x:60,y});
 for(let x of [51,57])for(let y of [13,25,38])props.push({id:'shrub-'+x+'-'+y,type:'shrub',x,y});
 return {id:'hardware-store',title:'Hardware Store',layoutVersion:2,width:WIDTH,height:HEIGHT,ground,walls,doors,fixtures,props,damage:[],drops:[],hazards:[],blocking:blocked};
}
export const inside=(x,y)=>x>=0&&y>=0&&x<WIDTH&&y<HEIGHT;
export function fixtureAt(world,x,y){return world.fixtures.find(o=>x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h)}
export function doorAt(world,x,y){return world.doors.find(d=>d.x===x&&d.y===y)}
export function walkable(world,x,y,allowDoor=true){
 x=Math.round(x);y=Math.round(y);
 if(!inside(x,y)||world.walls.has(key(x,y))||world.blocking.has(key(x,y))||fixtureAt(world,x,y))return false;
 let d=doorAt(world,x,y);return !d||allowDoor||d.open>.7;
}
export function nearestOpen(world,x,y){x=Math.max(0,Math.min(WIDTH-1,Math.round(x)));y=Math.max(0,Math.min(HEIGHT-1,Math.round(y)));if(walkable(world,x,y))return{x,y};for(let r=1;r<WIDTH+HEIGHT;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){if(Math.abs(dx)+Math.abs(dy)!==r)continue;if(walkable(world,x+dx,y+dy))return{x:x+dx,y:y+dy}}return{x:20,y:9}}
export function pathTo(world,from,to){
 const start=nearestOpen(world,from.x,from.y),goal=nearestOpen(world,to.x,to.y),open=[{...start,g:0,f:0}],prev=new Map(),cost=new Map([[key(start.x,start.y),0]]),closed=new Set(),target=key(goal.x,goal.y);
 while(open.length){open.sort((a,b)=>a.f-b.f);let cur=open.shift(),ck=key(cur.x,cur.y);if(closed.has(ck))continue;if(ck===target){let path=[];let k=ck;while(k!==key(start.x,start.y)){let [x,y]=k.split(',').map(Number);path.push({x,y});k=prev.get(k);if(!k)break}return path.reverse()}closed.add(ck);
 for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=cur.x+dx,y=cur.y+dy,k=key(x,y);if(!walkable(world,x,y)||closed.has(k))continue;let hazard=world.hazards.some(h=>h.x===x&&h.y===y&&h.kind==='fire'&&h.life>0)?12:0,g=cur.g+1+hazard;if(g>=(cost.get(k)??Infinity))continue;cost.set(k,g);prev.set(k,ck);open.push({x,y,g,f:g+Math.abs(x-goal.x)+Math.abs(y-goal.y)})}
 }
 return [];
}
