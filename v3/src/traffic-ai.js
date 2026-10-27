// Two-way right-hand traffic on the east road, controlled parking access,
// pedestrian priority and stall reservations. Coordinates are world tiles.
export const STALL_X=Array.from({length:13},(_,i)=>5+i*4);
const DISTANCE=2.65;
const car=v=>v.type==='car'||v.emergency;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const point=(x,y)=>({x,y});
const parked=v=>!v.route?.length&&v.targetX===undefined&&!v.traffic;
function stallOwner(world,x,except){
 return world.props.find(o=>o!==except&&car(o)&&
  (o.parkingSpot===x || (!o.traffic&&!o.emergency&&Math.abs(o.x-x)<1.4&&o.y>=3.5&&o.y<=7)));
}
export function findParkingSpot(world){
 return STALL_X.find(x=>!stallOwner(world,x));
}
function trip(v,route,state){
 v.route=route;v.trafficState=state;v.targetX=route.at(-1).x;v.targetY=route.at(-1).y;
}
export function updateParkingTraffic(world,elapsed){
 if(!Number.isFinite(world._trafficClock))world._trafficClock=elapsed+8;
 // Finish parking and schedule departures; no teleportation between phases.
 for(const v of world.props){
  if(!v.traffic||v.trafficState!=='parked'||elapsed<(v.departAt||Infinity))continue;
  const x=v.parkingSpot;
  trip(v,[point(x,2),point(63,2),point(63,1),point(67,1),point(67,-5)],'departing');
 }
 if(elapsed<world._trafficClock)return;
 world._trafficClock=elapsed+22;
 const spot=findParkingSpot(world);
 // Only send a customer car if a complete parking space is available.
 if(spot!==undefined){
  const x=72,y=-3;
  if(!world.props.some(o=>car(o)&&Math.hypot(o.x-x,o.y-y)<DISTANCE+2)){
   const v={id:'visitor-car-'+Math.floor(elapsed),type:'car',traffic:true,
    x,y,w:2,h:3,heading:Math.PI/2,parkingSpot:spot,
    vehicleModel:['sedan','suv','sedan-sports','van','hatchback-sports'][Math.floor(elapsed/22)%5]};
   trip(v,[point(72,2),point(63,2),point(spot,2),point(spot,4)],'arriving');
   world.props.push(v);
  }
 }
 // Road traffic is independent of customer parking availability.
 const north=Math.floor(elapsed/22)%2===0,x=north?67:72,y=north?52:-4;
 if(!world.props.some(o=>car(o)&&Math.hypot(o.x-x,o.y-y)<DISTANCE+2)){
  const v={id:'passing-car-'+Math.floor(elapsed),type:'car',traffic:true,
   x,y,w:2,h:3,heading:north?-Math.PI/2:Math.PI/2,
   vehicleModel:['sedan','suv-luxury','truck','delivery'][Math.floor(elapsed/22)%4]};
  trip(v,[point(x,north?-5:54)],'passing');
  world.props.push(v);
 }
}
export function advanceTraffic(props,dt,pedestrians=[],elapsed=0){
 const vehicles=props.filter(car);
 // Small fixed steps prevent tunneling through other cars at high game speeds.
 for(let remaining=Math.min(dt,2);remaining>0;remaining-=.12){
  const stepTime=Math.min(.12,remaining);
  for(const v of vehicles){
   if(v.trafficState==='parked')continue;
   if(!v.route?.length&&v.targetX!==undefined&&v.targetY!==undefined){
    const x=v.targetX,y=v.targetY;
    if(Math.hypot(x-v.x,y-v.y)>.08){
     if(v.x>=65&&Math.abs(y-v.y)>1){
      const lane=v.y>y?67:72;
      v.route=[point(lane,v.y),point(lane,y),point(x,y)];
     }else if(v.y<9&&Math.abs(x-v.x)>1)v.route=[point(v.x,2),point(x,2),point(x,y)];
     else v.route=[point(x,y)];
    }
   }
   while(v.route?.length&&distance(v,v.route[0])<.05)v.route.shift();
   if(!v.route?.length){
    if(v.trafficState==='arriving'){v.x=v.parkingSpot;v.y=4;v.heading=Math.PI/2;v.trafficState='parked';v.departAt=elapsed+35+(v.parkingSpot%4)*12;delete v.targetX;delete v.targetY;}
    continue;
   }
   const target=v.route[0],dx=target.x-v.x,dy=target.y-v.y,d=Math.hypot(dx,dy);
   if(d<.0001)continue;
   const speed=v.emergency?2.6:1.85,travel=Math.min(d,speed*stepTime);
   const nx=v.x+dx/d*travel,ny=v.y+dy/d*travel;
   // Predict next position, including a buffer around people and parked cars.
   if(vehicles.some(o=>o!==v&&Math.hypot(nx-o.x,ny-o.y)<DISTANCE))continue;
   if(pedestrians.some(n=>n.alive!==false&&Math.hypot(nx-(n.rx??n.x),ny-(n.ry??n.y))<1.65))continue;
   v.x=nx;v.y=ny;v.heading=Math.atan2(dy,dx);
  }
 }
}
export function removeDepartedTraffic(world){
 world.props=world.props.filter(v=>!v.traffic||!(v.trafficState==='departing'||v.trafficState==='passing')||
  (v.y>=-4.9&&v.y<=53.9));
}
// Compatibility with early traffic integration.
export const addPassingTraffic=updateParkingTraffic;
