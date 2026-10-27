// Selective camera-aware fade for solid objects covering the selected NPC.
// Uses screen projection to avoid fading every object near an NPC.
export function obstructionOpacity(kind,object,target,project,depthOf){
 if(!target||!['fixture','wall','vehicle','door'].includes(kind)||object.destroyed)return 1;
 const tx=target.rx??target.x,ty=target.ry??target.y;
 if(!Number.isFinite(tx)||!Number.isFinite(ty))return 1;
 const td=depthOf('npc',target),od=depthOf(kind,object);
 // Farther objects cannot occlude an NPC. Only nearer objects qualify.
 if(od>td+0.15)return 1;
 const head=project(tx,ty,31),feet=project(tx,ty,0);
 const w=Math.max(1,Number(object.w)||1),h=Math.max(1,Number(object.h)||1);
 const points=[[object.x,object.y],[object.x+w,object.y],[object.x,object.y+h],[object.x+w,object.y+h]].map(([x,y])=>project(x,y,0));
 const center=project(object.x+w/2,object.y+h/2,0);
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 const left=Math.min(...xs)-12,right=Math.max(...xs)+12;
 // Approximate tall fixture screen silhouette; a generous top bound avoids
 // requiring per-object sprites/masks while keeping unrelated objects opaque.
 const bottom=Math.max(...ys)+12,top=Math.min(...ys,center.y-65);
 const intersect=feet.x>=left&&feet.x<=right&&Math.max(head.y,top)<=Math.min(feet.y,bottom);
 return intersect?.42:1;
}
