// Life in Motion v3: authoritative, grid-based hardware store geometry.
export const WIDTH=76,HEIGHT=50;
export const key=(x,y)=>x+','+y;
export function createHardwareStore(){
 const walls=new Map(),doors=[],fixtures=[],props=[],ground=[],blocked=new Set();
 // A rectangular corner uses *both* wall directions at one occupied tile.
 // Never overwrite an X-facing segment with Y-facing segment (or vice versa).
 const wall=(x,y,section='exterior',axis='x')=>{
  const k=key(x,y),existing=walls.get(k);
  if(existing){
   if(!existing.axes.includes(axis))existing.axes.push(axis);
   existing.axis=existing.axes.length===2?'corner':existing.axes[0];
   return existing;
  }
  const piece={x,y,section,axis,axes:[axis]};
  walls.set(k,piece);
  return piece;
 };
 const door=(x,y,type='hinged',label='Door',axis='x',span=1,slideTo='start',pairId=null)=>doors.push({id:'door-'+x+'-'+y,x,y,w:axis==='x'?span:1,h:axis==='y'?span:1,type,label,axis,open:0,target:0,auto:type==='sliding',locked:false,forceUntil:0,...(type==='sliding'?{slideTo}:{}),...(pairId?{pairId}:{})});
 const fixture=(type,x,y,w=1,h=1,extra={})=>fixtures.push({id:type+'-'+x+'-'+y,type,x,y,w,h,...extra});
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  let area=x>=65?'road':y>=8&&y<10&&x>=2&&x<=36?'sidewalk':y<10&&x<65?'parking':x===37&&y>=10&&y<=27?'store':x===37&&y>=28&&y<=39?'sidewalk':x>=25&&x<=34&&y>=40&&y<=43?'loading':x>=38&&x<=46&&y>=10&&y<28?'employee':x>=38&&x<=48&&y>=28&&y<=39?'garden':y>=10&&y<=39&&x>=2&&x<=36?'store':x>=49&&x<=63&&y>=10&&y<44?'landscape':'grass';
  ground.push({x,y,area});
 }
 for(let x=2;x<=36;x++){wall(x,10);wall(x,39)}
 for(let y=10;y<=39;y++){wall(2,y,'exterior','y');wall(36,y,'exterior','y')}
 // Glazed fronts are part of their wall tile, not separate collision pieces.
 // Include new windows on the parking-lot-facing (y=10) side.
 for(const x of [4,5,7,8,9,11,12,15,16,22,23,26,27,32,33]){
  const panel=walls.get(key(x,10));
  if(panel&&panel.section==='exterior')panel.window='storefront';
 }
 // Actual openings are the exact tiles occupied by animated doors.
 for(let x of [19,20])walls.delete(key(x,10));
 for(let x of [28,29])walls.delete(key(x,39));
 for(let y of [17,30,31])walls.delete(key(36,y));
 door(19,10,'sliding','Main entrance','x',1,'start','main-double');door(20,10,'sliding','Main entrance','x',1,'end','main-double');
 door(28,39,'rollup','Receiving double-wide roll-up door','x',2);
 // Two opposing glass leaves form the garden-to-store double sliding entrance.
 door(36,17,'hinged','Employee access','y');
 door(36,30,'sliding','Garden center double entrance','y',1,'start','garden-double');
 door(36,31,'sliding','Garden center double entrance','y',1,'end','garden-double');
 // Staff wing has a complete exterior and rear wall, with functional room doors.
 for(let x=38;x<=46;x++){wall(x,10,'staff');wall(x,27,'staff')}
 for(let y=10;y<=27;y++){wall(38,y,'staff','y');wall(46,y,'staff','y')}
 for(let x=39;x<=45;x++)for(let y of [16,21])wall(x,y,'staff');
 // Hallway between the shop and staff wing is enclosed at both ends.
 wall(37,10,'staff');wall(37,27,'staff');
 // Join the store's south-west corridor corner to the hallway end cap.
 // The x-facing leg was missing behind the garden-tools wall display.
 wall(36,27,'staff','x');
 for(let y of [12,19,24])walls.delete(key(38,y));
 // Both interior staff-room partitions are solid; rooms enter only from the hallway.
 door(38,12,'hinged','Staff office door','y');door(38,19,'hinged','Break room door','y');door(38,24,'hinged','Restroom door','y');
 // Building-side garden edge remains open against the existing shop/staff
 // walls; avoid a redundant fence along the building's lower side.
 // Keep the freestanding wooden fence on the outer and southern edges.
 for(let y=28;y<=39;y++)wall(48,y,'gardenFence','y');
 // The old outer gate is gone; wooden pickets now seal the entire south edge.
 for(let x=39;x<=47;x++)wall(x,39,'gardenFence','x');
 wall(47,28,'gardenFence','x');
 for(let x of [5,11,17,23,29])for(let band=0;band<2;band++){
  const start=band===0?18:27;
  fixture('shelf',x,start,1,5,{department:['PAINT','TOOLS','ELECTRICAL','PLUMBING','HARDWARE'][(x-5)/6],stock:11,capacity:12});
 }
 for(let x of [8,14,25])fixture('checkout',x,13,2,1,{staffSide:'north',customerSide:'south',monitorFaces:'north'});
 fixture('serviceDesk',31,13,3,1,{staffSide:'north',customerSide:'south',monitorFaces:'north'});
 // The paint station and key-duplication bench occupy realistic 2-tile work counters.
 fixture('paintMixer',8,24,2,1,{department:'PAINT',facing:'south'});
 fixture('keyCutter',32,24,2,1,{department:'HARDWARE',facing:'south'});
 fixture('wireCutter',20,24,2,1,{department:'ELECTRICAL',facing:'south'});
 fixture('saw',6,35,2,1,{department:'LUMBER',facing:'south'});fixture('pallet',11,35,2,1);
 // Keep 25..32, 35..39 clear for unobstructed receiving circulation.
 fixture('lockers',44,20,2,1,{facing:'north'});fixture('office',40,12,1,1,{facing:'west'});fixture('officeChair',41,12,1,1,{facing:'west'});fixture('officePrinter',45,12,1,1,{facing:'south'});
 fixture('vending',45,18,1,1,{facing:'west'});fixture('breakTable',41,18,2,1,{facing:'south'});fixture('breakChair',41,19,1,1,{facing:'north'});fixture('breakChair',42,19,1,1,{facing:'north'});fixture('microwave',40,17,1,1,{facing:'east'});fixture('sink',40,23,1,1,{facing:'west'});fixture('restroom',41,25,1,1,{facing:'south'});fixture('restroomStall',43,25,1,1,{facing:'south'});fixture('handDryer',45,23,1,1,{facing:'west'});fixture('restroomBin',44,26,1,1);
 fixture('plants',41,33,2,2);fixture('plants',45,35,1,2);fixture('gardenDesk',42,29,2,1);
 // Additional stocked departments and service details. Each solid asset reserves its true footprint.
 // Relocate the narrow Tools endcap from the aisle center to the Hardware department's right edge.
 fixture('departmentWallShelf',35,21,1,1,{department:'TOOLS',stock:6,facing:'west'});fixture('endcap',26,24,1,1,{department:'PLUMBING',stock:6});
 fixture('departmentWallShelf',35,22,1,1,{department:'HARDWARE',stock:6,facing:'west'});
 fixture('bucketStack',5,16,1,1,{department:'PAINT',stock:6});
 fixture('lumberRack',14,35,2,1,{department:'LUMBER',stock:8});
 // Centered retail-grade red tool shelf, between the Tools aisle runs.
 fixture('toolCabinet',14,24,2,1,{department:'TOOLS',stock:8,facing:'south'});
 // Adjacent wall displays stay entirely inside the shop, just before
 // the garden doors (x=36,y=30..31). Both expose their west-facing tool panels.
 fixture('gardenToolsRack',35,26,1,2,{department:'GARDEN',stock:9,facing:'west',toolSet:'hoesLoppers'});
 fixture('gardenToolsRack',35,28,1,2,{department:'GARDEN',stock:9,facing:'west',toolSet:'shovelsRakes'});
 // A two-tile riding mower sits beyond the doorway on the interior side;
 // its hood points west, toward the store aisles, not out into the garden.
 fixture('ridingMower',34,33,2,1,{department:'GARDEN',facing:'west'});
 fixture('drinkCooler',44,17,1,1,{department:'REFRESHMENTS',stock:8});
 // Safety station stays wall-side, SOUTH of the employee door, well clear of the Service sign.
 fixture('safetyStation',35,19,1,1,{facing:'west'});fixture('utilityCart',4,16,1,1,{stock:4});
 fixture('hardwareBins',35,23,1,2,{department:'FASTENERS',stock:8,facing:'west'});
 // Receiving supervisor's enclosed office: rear wall uses the existing
 // store exterior, with glazed north/east walls and one store-side door.
 for(let xx=20;xx<=26;xx++)wall(xx,35,'receivingOffice','x');
 for(let yy=35;yy<=38;yy++){
  wall(20,yy,'receivingOffice','y');
  wall(26,yy,'receivingOffice','y');
 }
 walls.delete(key(22,35));
 door(22,35,'hinged','Receiving office door','x');
 for(const [wx,wy] of [[24,35],[25,35],[26,37]])walls.get(key(wx,wy)).window='office';
 // Desk and chair face one another within the walkable office interior.
 fixture('receivingDesk',23,37,2,1,{facing:'south'});
 fixture('officeChair',24,38,1,1,{facing:'north'});
 // The receiving floor and double roll-up door stay unobstructed.

 // Bulk warehouse packaging belongs in Receiving, leaving Lumber for timber.
 fixture('boxStack',29,42,2,1);fixture('palletStack',26,42,2,1);
 fixture('forklift',33,37,2,1,{facing:'west'});
 fixture('palletStack',24,42,2,1);fixture('boxStack',32,42,2,1);
 // Strapped short, medium and long dimensional lumber packs against Lumber's back wall.
 fixture('lumberBundle',5,37,2,1,{bundleSize:'short',department:'LUMBER'});
 fixture('lumberBundle',10,37,3,1,{bundleSize:'medium',department:'LUMBER'});
 fixture('lumberBundle',15,37,4,1,{bundleSize:'long',department:'LUMBER'});
 // Hand trucks temporarily removed from Receiving.
 // Employee rooms: fixtures face the approachable side, not the wall behind them.
 fixture('filingCabinet',44,14,1,1,{facing:'west'});
 fixture('noticeBoard',45,14,1,1,{facing:'west'});
 fixture('coffeeStation',39,20,1,1,{facing:'west'});
 fixture('coatRack',39,18,1,1,{facing:'east'});
 fixture('storageShelves',45,25,1,1,{facing:'west'});
 fixture('supplyCabinet',39,25,1,1,{facing:'west'});
 // Garden beds remain set back from the continuous southern fence.
 fixture('flowerBed',40,36,2,1);fixture('flowerBed',44,32,2,1);
 fixture('flowerBed',46,34,1,1);fixture('seedDisplay',46,30,1,1,{facing:'west'});
 fixture('pottingBench',44,30,2,1,{facing:'south'});
 fixture('gardenBench',39,34,1,2,{facing:'east'});
 fixture('birdbath',43,37,1,1);fixture('wateringStation',46,37,1,1);
 fixture('planter',40,29,1,1);fixture('planter',47,32,1,1);
 for(let x of [7,15,23,31,40,48,56]){props.push({type:'car',id:'car-'+x,x,y:4,w:2,h:3,color:['#8faab5','#b8a28b','#697f89','#b5b6ae','#879994','#ae9691','#668b8c'][[7,15,23,31,40,48,56].indexOf(x)],heading:0});for(let xx=x;xx<x+2;xx++)for(let yy=4;yy<7;yy++)blocked.add(key(xx,yy))}
 // Road access stays unobstructed between the main lot and the east service road.
 // Keep the parking lot and driving lanes free of decorative shrubs.
 // Landscaped beds only: each tree or shrub is placed on a landscape tile.
 // Stagger plants for a more natural border without occupying paths or parking.
 for(const [x,y] of [[51,14],[60,17],[55,23],[61,29],[52,35],[59,41]])
  props.push({id:'landscape-tree-'+x+'-'+y,type:'tree',x,y});
 for(const [x,y] of [[49,12],[54,13],[57,17],[62,20],[50,22],[58,25],
   [53,28],[62,32],[49,34],[56,37],[62,39],[51,42],[58,14],[55,33]])
  props.push({id:'landscape-shrub-'+x+'-'+y,type:'shrub',x,y});
 return {id:'hardware-store',title:'Hardware Store',layoutVersion:33,width:WIDTH,height:HEIGHT,ground,walls,doors,fixtures,props,damage:[],drops:[],hazards:[],sabotages:[],electricalZones:[],blocking:blocked};
}
export const inside=(x,y)=>x>=0&&y>=0&&x<WIDTH&&y<HEIGHT;
export function fixtureAt(world,x,y){return world.fixtures.find(o=>x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h)}
export function doorAt(world,x,y){return world.doors.find(d=>x>=d.x&&x<d.x+(d.w||1)&&y>=d.y&&y<d.y+(d.h||1))}
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

// Room names are independent of floor artwork so the staff hallway can
// share the main store floor material without losing its identity.
export function floorRoomName(world,x,y){
 if(x===37&&y>=11&&y<=26)return 'Employee Hallway';
 if(x>=39&&x<=45&&y>=11&&y<=15)return 'Manager Office';
 if(x>=39&&x<=45&&y>=17&&y<=20)return 'Break Room';
 if(x>=39&&x<=45&&y>=22&&y<=26)return 'Restroom';
 if(x>=21&&x<=25&&y>=36&&y<=38)return 'Receiving Office';
 if(x>=38&&x<=46&&y>=28&&y<=39)return 'Garden Center';
 if(x>=25&&x<=35&&y>=34&&y<=43)return 'Receiving';
 if(x>=3&&x<=35&&y>=33&&y<=38)return 'Lumber';
 if(x>=3&&x<=35&&y>=11&&y<=16)return 'Sales Floor';
 if(x>=3&&x<=10&&y>=17&&y<=32)return 'Paint';
 if(x>=11&&x<=16&&y>=17&&y<=32)return 'Tools';
 if(x>=17&&x<=22&&y>=17&&y<=32)return 'Electrical';
 if(x>=23&&x<=28&&y>=17&&y<=32)return 'Plumbing';
 if(x>=29&&x<=36&&y>=17&&y<=32)return 'Hardware';
 const ground=world?.ground?.find(t=>t.x===x&&t.y===y);
 return ({store:'Sales Floor',employee:'Employee Area',garden:'Garden Center',loading:'Receiving',parking:'Parking Lot',sidewalk:'Sidewalk',road:'Road',landscape:'Landscaping',grass:'Grass'})[ground?.area]||'Ground';
}
