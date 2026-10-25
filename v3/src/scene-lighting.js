// Life in Motion: world-aligned ambient light, projected shadows and local electrical states.
// Lighting uses the existing camera projection. No timers or wall-clock randomness.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const ELECTRICAL_RADIUS=4.6;
export const CEILING_LIGHTS=[
 ...[14,21,28,35].flatMap(y=>[7,15,23,31].map(x=>({x,y,area:'store'}))),
 ...[13,19,25].flatMap(y=>[40,44].map(x=>({x,y,area:'employee'}))),
 ...[31,36].flatMap(y=>[40,45].map(x=>({x,y,area:'garden'})))
];
const ROOMS=[
 {x1:2,y1:10,x2:37.5,y2:39.5,shade:.39},
 {x1:37.5,y1:10,x2:47.5,y2:27.5,shade:.38},
 {x1:37.5,y1:27.5,x2:48.5,y2:40.5,shade:.26}
];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fixturesNear=(g,zone)=>g.world.fixtures.filter(f=>
 Math.hypot(f.x+(f.w||1)*.5-.5-zone.x,f.y+(f.h||1)*.5-.5-zone.y)<ELECTRICAL_RADIUS);
// Every falling wire owns a local outage. Recovery is sampled ONCE when the
// wire is secured or expires, never extended by repeated render frames.
export function updateElectricalZones(g){
 const world=g.world;
 world.electricalZones??=[];
 const active=(world.hazards||[]).filter(h=>h.kind==='electric'&&h.life>0);
 const ids=new Set(active.map(h=>h.id));
 for(const h of active){
  let zone=world.electricalZones.find(z=>z.id===h.id);
  if(!zone){zone={id:h.id,x:h.x,y:h.y,active:true,recoverAt:0};world.electricalZones.push(zone)}
  else{zone.active=true;zone.x=h.x;zone.y=h.y;zone.recoverAt=0}
  for(const f of fixturesNear(g,zone)){
   f.powerOutUntil=Math.max(f.powerOutUntil||0,g.elapsed+.2);
  }
 }
 for(const z of world.electricalZones){
  if(z.active&&!ids.has(z.id)){
   z.active=false;z.recoverAt=g.elapsed+5+g.random()*10;
   for(const f of fixturesNear(g,z))f.powerOutUntil=Math.max(f.powerOutUntil||0,z.recoverAt);
  }
 }
 world.electricalZones=world.electricalZones.filter(z=>z.active||z.recoverAt>g.elapsed);
}
export function lightIntensityAt(world,x,y,t=0){
 let power=1;
 const zones=world?.electricalZones||[];
 // Backward compatibility with older saves that contained wires but no zone data.
 const fallback=(world?.hazards||[]).filter(h=>h.kind==='electric'&&h.life>0&&!zones.some(z=>z.id===h.id))
  .map(h=>({id:h.id,x:h.x,y:h.y,active:true,recoverAt:0}));
 for(const z of [...zones,...fallback]){
  const d=Math.hypot(x-z.x,y-z.y);
  if(d>=ELECTRICAL_RADIUS)continue;
  const influence=clamp((ELECTRICAL_RADIUS-d)/1.5);
  let local=1;
  if(z.active){
   // Irregular soft pulses; no full-screen strobe or frame-by-frame random draws.
   const wobble=Math.sin(t*11.6+z.x*1.3)+.45*Math.sin(t*18.2+z.y*2.2)+.21*Math.sin(t*6.1+z.x+z.y);
   local=wobble<-.55?.12:wobble>.85?.68:.34+.16*Math.sin(t*6.1+z.y);
  }else if(z.recoverAt>t){
   local=.19;
   if(z.recoverAt-t<1)local=.19+.81*(1-(z.recoverAt-t));
  }
  power=Math.min(power,1-(1-clamp(local))*influence);
 }
 return clamp(power);
}
export function createSceneLighting(ctx,project,getZoom){
 let layer=null,layerCtx=null,layerWidth=0,layerHeight=0;
 function buffer(w,h){
  const width=Math.max(1,Math.ceil(w)),height=Math.max(1,Math.ceil(h));
  if(!layer&&typeof document!=='undefined'){
   layer=document.createElement('canvas');layerCtx=layer.getContext('2d',{alpha:true});
  }
  if(!layerCtx)return false;
  if(width!==layerWidth||height!==layerHeight){
   layer.width=width;layer.height=height;layerWidth=width;layerHeight=height;
  }
  return true;
 }
 const p=(x,y,z=0)=>project(x,y,z);
 function hull(points){
  const sorted=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
  const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[],hi=[];
  for(const v of sorted){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],v)<=0)lo.pop();lo.push(v)}
  for(const v of sorted.slice().reverse()){while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],v)<=0)hi.pop();hi.push(v)}
  lo.pop();hi.pop();return lo.concat(hi);
 }
 function polygon(c,points,fill){
  if(points.length<3)return;c.beginPath();
  points.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));
  c.closePath();c.fillStyle=fill;c.fill();
 }
 function lampPower(world,lamp,t){
  return lightIntensityAt(world,lamp.x,lamp.y,t);
 }
 function lightsInView(viewport){
  const margin=200*getZoom()+35;
  return CEILING_LIGHTS.filter(l=>{const q=p(l.x,l.y);
   return q.x>-margin&&q.x<viewport.w+margin&&q.y>-margin-80&&q.y<viewport.h+margin});
 }
 function drawFloorLightPools(world,viewport,t){
  const z=getZoom();
  for(const lamp of lightsInView(viewport)){
   const light=lampPower(world,lamp,t);
   if(light<.12)continue;
   const q=p(lamp.x,lamp.y);
   ctx.save();ctx.translate(q.x,q.y);ctx.scale(170*z,77*z);
   const grad=ctx.createRadialGradient(0,0,0,0,0,1);
   const warm=lamp.area==='garden'?'236,216,155':'245,226,182';
   grad.addColorStop(0,'rgba('+warm+','+(light*.14).toFixed(3)+')');
   grad.addColorStop(.5,'rgba('+warm+','+(light*.055).toFixed(3)+')');
   grad.addColorStop(1,'rgba('+warm+',0)');
   ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
  }
 }
 function shadowVector(world,x,y,height,t){
  const indoor=x>=2&&x<48&&y>=10&&y<41;
  let lamp=null,best=Infinity;
  if(indoor)for(const l of CEILING_LIGHTS){
   const d=(l.x-x)**2+(l.y-y)**2;
   if(d<best){best=d;lamp=l}
  }
  const light=lamp?lightIntensityAt(world,lamp.x,lamp.y,t):1;
  const dx=lamp?x-lamp.x:-1.1,dy=lamp?y-lamp.y:.85;
  const length=Math.max(.001,Math.hypot(dx,dy));
  const spread=height*(lamp? .035:.041);
  return {dx:dx/length*spread,dy:dy/length*spread,
   strength:indoor?.14*light:.19};
 }
 function castObjectShadow(world,viewport,o,t,height){
  const center={x:o.x+((o.w||1)-1)*.5,y:o.y+((o.h||1)-1)*.5};
  const v=shadowVector(world,center.x,center.y,height,t);
  if(v.strength<.025)return;
  const z=getZoom(),base=p(center.x,center.y);
  if(base.x<-70||base.x>viewport.w+70||base.y<-125||base.y>viewport.h+90)return;
  const w=o.w||1,h=o.h||1;
  const corners=[
   p(o.x-.48,o.y-.48),p(o.x+w-.52,o.y-.48),
   p(o.x+w-.52,o.y+h-.52),p(o.x-.48,o.y+h-.52)
  ];
  const shift=corners.map(c=>{
   const delta=p(center.x+v.dx,center.y+v.dy);
   return {x:c.x+delta.x-base.x,y:c.y+delta.y-base.y};
  });
  const end=p(center.x+v.dx,center.y+v.dy);
  const gradient=ctx.createLinearGradient(base.x,base.y,end.x,end.y);
  gradient.addColorStop(0,'rgba(8,18,25,'+v.strength.toFixed(3)+')');
  gradient.addColorStop(1,'rgba(8,18,25,0.008)');
  polygon(ctx,hull(corners.concat(shift)),gradient);
 }
 function drawCastShadows(world,npcs,viewport,t){
  for(const o of world.fixtures||[]){
   let height=26;
   if(/shelf|rack|cabinet|locker|cooler|vending/i.test(o.type))height=51;
   if(/pallet|box|stack|cart/i.test(o.type))height=21;
   if(/mower|forklift|saw|mixer|cutter/i.test(o.type))height=38;
   castObjectShadow(world,viewport,o,t,height);
  }
  for(const o of world.props||[]){
   if(o.type==='wetFloorSign'||o.type==='shrub')continue;
   castObjectShadow(world,viewport,{x:o.x,y:o.y,w:o.w||1,h:o.h||1},t,
    o.type==='tree'?66:o.type==='car'?27:22);
  }
  // Directional NPC silhouettes extend beyond their existing contact shadows
  // and follow interpolated movement without requiring additional actors.
  const z=getZoom();
  for(const n of npcs||[]){
   if(!n.alive||n.medicalUntil>t)continue;
   const base=p(n.rx??n.x,n.ry??n.y);
   if(base.x<-45||base.x>viewport.w+45||base.y<-55||base.y>viewport.h+50)continue;
   const v=shadowVector(world,n.rx??n.x,n.ry??n.y,30,t);
   if(v.strength<.025)continue;
   const end=p((n.rx??n.x)+v.dx,(n.ry??n.y)+v.dy);
   const grad=ctx.createLinearGradient(base.x,base.y,end.x,end.y);
   grad.addColorStop(0,'rgba(8,18,25,'+(v.strength*.88).toFixed(3)+')');
   grad.addColorStop(1,'rgba(8,18,25,0)');
   ctx.save();ctx.translate((base.x+end.x)/2,(base.y+end.y)/2);
   ctx.rotate(Math.atan2(end.y-base.y,end.x-base.x));
   ctx.fillStyle=grad;ctx.beginPath();
   ctx.ellipse(0,0,Math.max(8,Math.hypot(end.x-base.x,end.y-base.y)/2+7*z),4.5*z,0,0,Math.PI*2);
   ctx.fill();ctx.restore();
  }
 }
 function drawSceneLighting(world,viewport,t){
  if(!buffer(viewport.w,viewport.h))return;
  const l=layerCtx;l.clearRect(0,0,layerWidth,layerHeight);
  for(const r of ROOMS){
   const vertices=[p(r.x1,r.y1),p(r.x2,r.y1),p(r.x2,r.y2),p(r.x1,r.y2),
    p(r.x1,r.y1,62),p(r.x2,r.y1,62),p(r.x2,r.y2,62),p(r.x1,r.y2,62)];
   polygon(l,hull(vertices),'rgba(7,17,28,'+r.shade+')');
  }
  l.globalCompositeOperation='destination-out';
  const z=getZoom();
  for(const lamp of lightsInView(viewport)){
   const power=lampPower(world,lamp,t);
   if(power<.01)continue;
   const q=p(lamp.x,lamp.y);
   l.save();l.translate(q.x,q.y);l.scale(183*z,100*z);
   const grad=l.createRadialGradient(0,0,0,0,0,1);
   grad.addColorStop(0,'rgba(0,0,0,'+(power*.98).toFixed(3)+')');
   grad.addColorStop(.44,'rgba(0,0,0,'+(power*.84).toFixed(3)+')');
   grad.addColorStop(1,'rgba(0,0,0,0)');
   l.fillStyle=grad;l.fillRect(-1,-1,2,2);l.restore();
  }
  l.globalCompositeOperation='source-over';
  ctx.save();ctx.drawImage(layer,0,0,viewport.w,viewport.h);ctx.restore();
 }
 return {drawFloorLightPools,drawCastShadows,drawSceneLighting};
}
