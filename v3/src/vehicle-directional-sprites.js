// Four-direction, camera-aware 2D car sprites. No WebGL dependencies.
// Facing is determined from actual world travel; parked vehicles retain their heading.
const cache=new Map();
export function vehicleFacing(v,cameraAngle=45){
 const dx=(v.targetX??v.x)-v.x,dy=(v.targetY??v.y)-v.y;
 const motion=Math.hypot(dx,dy)>.08;
 const h=motion?Math.atan2(dy,dx):(Number.isFinite(v.heading)?v.heading:Math.PI/2);
 // Project world movement through the same isometric horizontal orientation as
 // the game camera. Pick one of four view-relative quadrants.
 const yaw=cameraAngle*Math.PI/180;
 const sx=Math.cos(yaw)*Math.cos(h)-Math.sin(yaw)*Math.sin(h);
 const sy=-Math.sin(yaw)*Math.cos(h)-Math.cos(yaw)*Math.sin(h);
 return sx>=0?(sy<0?'right':'up'):(sy<0?'down':'left');
}
export function vehicleSpriteKind(v){
 if(v.emergency){
  if(v.color==='#b9594d')return 'fire';
  if(v.color==='#668ba9')return 'police';
  return 'ambulance';
 }
 return v.vehicleModel||['sedan','sedan-sports','hatchback-sports','suv','suv-luxury','pickup','van','delivery','delivery-flat','truck'][Math.abs(Math.floor(v.x||0))%10];
}
// Rasterize a small four-direction sprite only once for every color/model/facing.
function buildSprite(kind,color,facing){
 const c=document.createElement('canvas');c.width=144;c.height=102;
 const x=c.getContext('2d');x.lineJoin='round';x.lineCap='round';
 const left=facing==='left',side=left||facing==='right';
 const body=kind==='fire'?'#b94f43':kind==='ambulance'?'#e1e4e1':kind==='police'?'#52728e':color||'#8da1a5';
 const large=['van','fire','ambulance'].includes(kind);
 const wheel=(px,py)=>{x.fillStyle='#243039';x.beginPath();x.ellipse(px,py,10,7,0,0,Math.PI*2);x.fill();x.fillStyle='#93a3a5';x.beginPath();x.ellipse(px,py,4,3,0,0,Math.PI*2);x.fill()};
 const polygon=(pts,fill,stroke='#40535b')=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fillStyle=fill;x.fill();x.strokeStyle=stroke;x.lineWidth=2;x.stroke()};
 if(side){
  if(left){x.translate(144,0);x.scale(-1,1)}
  wheel(34,80);wheel(109,80);
  polygon([[10,54],[38,45],[111,47],[134,58],[133,77],[11,77]],body);
  polygon([[41,46],[51,large?22:30],[98,large?22:30],[115,48]],body);
  polygon([[53,large?28:35],[69,large?27:34],[69,46],[48,46]],'#517b8d');
  polygon([[75,large?27:34],[96,large?28:35],[108,46],[75,46]],'#527c90');
  x.fillStyle='#e7e8c9';x.fillRect(125,62,8,6);x.fillStyle='#a54342';x.fillRect(12,62,7,6);
 }else{
  const rear=facing==='up';
  wheel(28,77);wheel(116,77);
  polygon([[29,50],[52,36],[94,36],[115,50],[123,77],[22,77]],body);
  polygon([[46,42],[53,large?19:28],[92,large?19:28],[101,42]],body);
  polygon([[52,large?24:32],[93,large?24:32],[99,49],[45,49]],'#567e8e');
  polygon([[26,52],[119,52],[126,71],[18,71]],body);
  x.fillStyle=rear?'#a94744':'#e6eacb';x.fillRect(27,61,16,6);x.fillRect(102,61,16,6);
 }
 if(['fire','police','ambulance'].includes(kind)){
  x.fillStyle='#e65751';x.fillRect(60,17,12,5);x.fillStyle='#5b9add';x.fillRect(73,17,12,5);
 }
 return c;
}
// When Kenney PNGs are installed, replace the temporary procedural sprite.
const kenneyImages=new Map();
function kenneyVehicleImage(kind,facing){
 const asset=({sedan:'sedan',suv:'suv',pickup:'truck',van:'van',
  fire:'firetruck',police:'police',ambulance:'ambulance'})[kind]||kind;
 const key=asset+'-'+facing;
 if(!kenneyImages.has(key)){
  const image=new Image();
  const entry={image,loaded:false,failed:false};
  image.onload=()=>{entry.loaded=true};
  image.onerror=()=>{entry.failed=true};
  image.src='./assets/kenney-vehicles/'+key+'.png';
  kenneyImages.set(key,entry);
 }
 const entry=kenneyImages.get(key);
 return entry.loaded?entry.image:null;
}
export function drawDirectionalVehicle(ctx,project,zoom,v,cameraAngle=45){
 if(!v||v.type==='tree'||v.type==='shrub'||v.type==='wetFloorSign')return false;
 const facing=vehicleFacing(v,cameraAngle),kind=vehicleSpriteKind(v);
 const key=kind+'|'+(v.color||'')+'|'+facing;
 let sprite=cache.get(key);if(!sprite){sprite=buildSprite(kind,v.color,facing);cache.set(key,sprite)}
 const w=v.w||2,h=v.h||3;
 const base=project(v.x+(w-1)/2,v.y+(h-1)/2,0);
 const scale=1.4*zoom*Math.max(.8,Math.min(1.3,(w+h)/5));
 const sw=144*scale,sh=102*scale;
 const imported=kenneyVehicleImage(kind,facing);
 ctx.drawImage(imported||sprite,base.x-sw/2,base.y-sh*.79,sw,sh);
 return true;
}
