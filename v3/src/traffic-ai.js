// Lightweight lane-following traffic and vehicle separation for the 2D map.
// Road x=65..75: northbound x=67, southbound x=72.
// Parking aisle y=1..3, bays y=4..6. Do not drive across occupied bays.
const gap=2.7;
export function advanceTraffic(props,dt){
 const cars=props.filter(v=>v.type==='car'||v.emergency);
 for(const v of cars){
  if(v.targetX===undefined||v.targetY===undefined)continue;
  // Drive along explicit lane waypoints instead of diagonally crossing bays.
  if(!v.route||!v.route.length){
   const dx=v.targetX-v.x,dy=v.targetY-v.y;
   if(Math.hypot(dx,dy)>.08){
    if(v.x>=64&&Math.abs(dy)>1) v.route=[{x:v.x<=69?67:72,y:v.y},{x:v.x<=69?67:72,y:v.targetY},{x:v.targetX,y:v.targetY}];
    else if(v.y<9&&Math.abs(dx)>1) v.route=[{x:v.x,y:2},{x:v.targetX,y:2},{x:v.targetX,y:v.targetY}];
    else v.route=[{x:v.targetX,y:v.targetY}];
   }else continue;
  }
  while(v.route.length&&Math.hypot(v.route[0].x-v.x,v.route[0].y-v.y)<.07)v.route.shift();
  if(!v.route.length)continue;
  const next=v.route[0],dx=next.x-v.x,dy=next.y-v.y,dist=Math.hypot(dx,dy);
  if(dist<.001)continue;
  const step=Math.min(dist,dt*(v.emergency?2.7:1.9));
  const nx=v.x+dx/dist*step,ny=v.y+dy/dist*step;
  if(cars.some(o=>o!==v&&Math.hypot(nx-o.x,ny-o.y)<gap))continue;
  v.x=nx;v.y=ny;v.heading=Math.atan2(dy,dx);
 }
}
export function addPassingTraffic(world,elapsed){
 // Two independent lanes; cars spawn only when the respective lane is clear.
 if(!world._trafficClock)world._trafficClock=0;
 if(elapsed<world._trafficClock)return;
 world._trafficClock=elapsed+24;
 const north=((Math.floor(elapsed/24)%2)===0),x=north?67:72,y=north?49:0;
 if(world.props.some(o=>(o.type==='car'||o.emergency)&&Math.hypot(o.x-x,o.y-y)<5))return;
 const id='traffic-'+Math.floor(elapsed);
 world.props.push({id,type:'car',x,y,w:2,h:3,traffic:true,vehicleModel:['sedan','suv','van','hatchback-sports'][Math.floor(elapsed/24)%4],heading:north?-Math.PI/2:Math.PI/2,targetX:x,targetY:north?-4:54});
}
export function removeDepartedTraffic(world){
 world.props=world.props.filter(v=>!v.traffic||(v.y>=-3&&v.y<=53));
}
