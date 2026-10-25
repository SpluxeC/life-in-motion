// Lightweight simulation-time-only God Power and NPC VFX.
// The renderer only reads state; it never changes NPC behavior or power mechanics.
const PALETTE={suspicion:'#e6b46e',anger:'#ff735a',whisper:'#a49cfc',command:'#76d4ff',sabotage:'#f2ae52',hazard:'#e6b76d'};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function createPowerEffects(ctx,project,getZoom){
 const particles=[];
 const signature=(id)=>Array.from(String(id||'')).reduce((s,c)=>s+c.charCodeAt(0),0);
 function trigger(id,target,elapsed,detail){
  if(!target||!Number.isFinite(elapsed))return;
  particles.push({id,entityId:target.id,x:target.rx??target.x,y:target.ry??target.y,start:elapsed,duration:id==='command'?1.45:1.05,seed:signature(target.id),detail:detail||null});
  if(particles.length>30)particles.splice(0,particles.length-30);
 }
 function circle(x,y,r,color,alpha=1,width=2){
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.stroke();
 }
 function draw(elapsed,world){
  const z=getZoom();
  for(let i=particles.length-1;i>=0;i--){
   const f=particles[i],age=elapsed-f.start;
   if(age>=f.duration){particles.splice(i,1);continue}
   if(age<0)continue;
   const fraction=clamp(age/f.duration,0,1),fade=(1-fraction)**1.5;
   // Track an NPC's motion while its ability cast plays.
   const npc=world?.npcs?.find(n=>n.id===f.entityId);
   const pos=project(npc?.rx??f.x,npc?.ry??f.y,4),color=PALETTE[f.id]||'#f5dca6';
   ctx.save();
   ctx.globalCompositeOperation='screen';
   circle(pos.x,pos.y,Math.max(1,(6+31*fraction)*z),color,fade*.9,2.3*z);
   if(f.id==='whisper'||f.id==='suspicion'){
    for(let j=0;j<4;j++){
     const angle=(Math.PI*2*j/4)+fraction*(f.id==='whisper'?-2:2);
     const radius=(14+18*fraction)*z,px=pos.x+Math.cos(angle)*radius,py=pos.y-24*z+Math.sin(angle)*radius*.55;
     circle(px,py,Math.max(.5,(3.4-2*fraction)*z),color,fade*.8,1.8*z);
    }
   }else if(f.id==='anger'){
    for(let j=0;j<3;j++){
     const angle=(Math.PI*2*j/3)+f.seed*.01,px=pos.x+Math.cos(angle)*13*z,py=pos.y-25*z+Math.sin(angle)*5*z-12*fraction*z;
     ctx.fillStyle=color;ctx.globalAlpha=fade*.75;ctx.fillRect(px,py,(2+fraction*2)*z,7*z);
    }
   }else if(f.id==='command'){
    const y=pos.y-48*z-12*fraction*z;
    ctx.fillStyle=color;ctx.globalAlpha=fade;
    ctx.beginPath();ctx.moveTo(pos.x,y);ctx.lineTo(pos.x+7*z,y+8*z);ctx.lineTo(pos.x,y+15*z);ctx.lineTo(pos.x-7*z,y+8*z);ctx.closePath();ctx.fill();
   }else if(f.id==='sabotage'||f.id==='hazard'){
    for(let j=0;j<5;j++){
     const a=Math.PI*2*j/5+f.seed*.03,r=(9+27*fraction)*z;
     ctx.strokeStyle=color;ctx.lineWidth=1.5*z;ctx.globalAlpha=fade*.8;
     ctx.beginPath();ctx.moveTo(pos.x+Math.cos(a)*r,pos.y+Math.sin(a)*r*.5);
     ctx.lineTo(pos.x+Math.cos(a)*(r+8*z),pos.y+Math.sin(a)*(r+8*z)*.5);ctx.stroke();
    }
   }
   ctx.restore();
  }
 }
 function drawNpcMood(n,elapsed){
  if(!n.alive||n.unconscious>0||n.medicalUntil>elapsed)return;
  const z=getZoom(),e=n.emotion||{},anger=e.anger||0,fear=e.fear||0,stress=e.stress||0;
  const isAngry=anger>=58,isAfraid=fear>=62,isStressed=stress>=65;
  if(!isAngry&&!isAfraid&&!isStressed)return;
  const pos=project(n.rx,n.ry,41),phase=Math.sin(elapsed*3+(n.id?.length||0));
  const color=isAngry?'#fa9274':isAfraid?'#a2d9f5':'#dbc0f7';
  ctx.save();ctx.globalAlpha=(.38+.14*phase);
  ctx.fillStyle=color;ctx.font='bold '+Math.max(8,12*z)+'px system-ui,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(isAngry?'!':isAfraid?'?':'~',pos.x,pos.y-7*z-Math.max(0,phase)*3*z);
  ctx.restore();
 }
 return {trigger,draw,drawNpcMood,get activeCount(){return particles.length},clear(){particles.length=0}};
}
