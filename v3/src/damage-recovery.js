// Persistent Phase 4 debris, rescue and reconstruction. Runs only in simulation ticks.
const near=(a,b,r)=>Math.hypot((a.rx??a.x)-b.x,(a.ry??a.y)-b.y)<=r;
export function tickDamageRecovery(g,dt){
 const debris=g.world.damage||[];
 for(const d of debris){
  if(!['fallenSign','fallenBox'].includes(d.kind))continue;
  if(d.phase==='repaired')continue;
  // Old saves used a temporary timer; new incidents remain until resolved.
  d.until=null;
  d.phase??='fallen';
  if(d.phase==='fallen'){
   const casualty=g.npcs.find(n=>n.alive&&n.trappedBy===d.id);
   if(casualty){
    casualty.path=[];casualty.activity='Trapped under debris';
    const rescuer=g.npcs.find(n=>n.alive&&n.unconscious<=0&&['paramedic','firefighter'].includes(n.role)&&near(n,d,3));
    if(rescuer){
     d.rescueProgress=(d.rescueProgress||0)+dt;
     rescuer.activity='Freeing trapped person';rescuer.action='offerHelp';
     if(d.rescueProgress>=5){casualty.trappedBy=null;casualty.activity='Freed from debris';d.phase='clearing';d.rescueProgress=0}
    }
   }else d.phase='clearing';
  }
  if(d.phase==='clearing'){
   const worker=g.npcs.find(n=>n.alive&&n.unconscious<=0&&['employee','firefighter'].includes(n.role)&&near(n,d,3));
   if(worker){
    d.repairProgress=(d.repairProgress||0)+dt;
    worker.activity=d.kind==='fallenSign'?'Reinstalling sign':'Removing debris';worker.action='stock';
    if(d.repairProgress>=9){d.phase='repaired';const object=[...g.world.fixtures,...g.world.props].find(o=>o.id===d.signId);if(object){object.damaged=false;object.destroyed=false;object.repairUntil=0}}
   }
  }
 }
 g.world.damage=debris.filter(d=>d.phase!=='repaired');
}
export function debrisBlocksMovement(world,x,y){
 return (world?.damage||[]).some(d=>['fallenSign','fallenBox'].includes(d.kind)&&d.phase!=='repaired'&&Math.hypot(d.x-x,d.y-y)<.65);
}
