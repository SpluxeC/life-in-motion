// Isometric stick-figure two-segment limbs, measured in local screen units.
// Only simulation time drives the cycle, so pausing holds every joint still.
const pt=(x,y)=>({x,y});
export function npcLimbPose(n,t){
 const active=!!(n.alive&&n.unconscious<=0&&(n.path?.length||0)>0);
 const facing=n.facing==='left'?-1:1;
 const speed=n.panic>0?12:9.5;
 const seed=String(n.id||'').split('').reduce((v,c)=>v+c.charCodeAt(0),0)*.17;
 const phase=active?t*speed+seed:0;
 const body=active?Math.cos(phase*2)*.65:0;
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const step=active?Math.sin(phase+(side===1?Math.PI:0)):0;
  const lift=active?Math.max(0,step)*3.3:0;
  const hip=pt(side*2,-10+body*.45);
  const foot=pt(side*5+step*7*facing,-lift);
  const knee=pt((hip.x+foot.x)*.5+step*2.1*facing,-5.7-lift*.45);
  legs.push({side,hip,knee,foot});
  const shoulder=pt(side*5,-16+body);
  let wrist,elbow;
  const activity=n.action||'idle',wave=Math.sin((n.actionPhase||0)*7);
  if(activity==='offerHelp'){
   wrist=pt(side===-1?-14:13,side===-1?-32-wave*2:-22+wave*2);
  }else if(activity==='scan'||activity==='type'){
   wrist=pt(side===-1?-13:12,-12+wave*2);
  }else if(activity==='stock'||activity==='inspect'){
   wrist=pt(side*13,-24+wave*3);
  }else if(activity==='drink'&&side===-1){
   wrist=pt(-4,-25);
  }else if(activity==='talk'){
   wrist=pt(side*12,-18+wave*2);
  }else{
   const swing=active?-step*5*facing:0;
   wrist=pt(side*10+swing,-18+body+Math.abs(step)*2);
  }
  const midX=(shoulder.x+wrist.x)*.5,midY=(shoulder.y+wrist.y)*.5;
  elbow=pt(midX+side*(active?2.6:3),midY+2.9);
  arms.push({side,shoulder,elbow,wrist});
 }
 return {active,phase,body,arms,legs};
}
