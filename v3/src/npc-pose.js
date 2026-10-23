// Two-bone limbs for the isometric stick figures. A full alternating
// two-step cycle represents 1.9 world tiles traveled, so slower/faster NPCs
// automatically swing arms at the pace of their actual steps.
const pt=(x,y)=>({x,y});
export const STRIDE_TILES=1.9;
export function npcLimbPose(n,t=0){
 const active=!!(n.alive&&n.unconscious<=0&&(n.path?.length||0)>0);
 const facing=n.facing==='left'?-1:1;
 const seed=String(n.id||'').split('').reduce((v,c)=>v+c.charCodeAt(0),0)*.071;
 // The phase comes from locomotion distance, never wall clock or render frames.
 const distance=Number.isFinite(n.walkDistance)?n.walkDistance:0;
 const phase=active?distance*(2*Math.PI/STRIDE_TILES)+seed:0;
 const body=active?Math.cos(phase*2)*.28:0;
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const step=active?Math.sin(phase+(side===1?Math.PI:0)):0;
  const lift=active?Math.max(0,step)*2.7:0;
  const hip=pt(side*2,-10+body*.25);
  const foot=pt(side*3.8+step*5.4*facing,-lift);
  const knee=pt((hip.x+foot.x)*.5+step*1.75*facing,-5.6-lift*.55);
  legs.push({side,hip,knee,foot});
  // Arms hang at the sides: shoulders -> elbows -> hands near the hips.
  // The elbow stays below the shoulder; each small swing counterbalances
  // the *opposite* leg and never raises a walking hand to shoulder height.
  const shoulder=pt(side*5,-18.5+body);
  let wrist;
  const activity=n.action||'idle',wave=Math.sin((n.actionPhase||0)*4);
  if(active){
   const armSwing=-step*2.4*facing;
   wrist=pt(side*7.4+armSwing,-8.6+Math.abs(step)*.45+body);
  }else if(activity==='offerHelp'){
   wrist=pt(side===-1?-14:10,side===-1?-28-wave*2:-11);
  }else if(activity==='scan'||activity==='type'){
   wrist=pt(side===-1?-12:11,-12+wave*1.5);
  }else if(activity==='stock'||activity==='inspect'){
   wrist=pt(side*10,-16+wave*2);
  }else if(activity==='drink'&&side===-1){
   wrist=pt(-4,-24);
  }else if(activity==='talk'){
   wrist=pt(side*11,-12+wave*1.5);
  }else{
   wrist=pt(side*7.4,-8.6);
  }
  const elbow=active?
   pt(side*7.8+(wrist.x-side*7.4)*.43,-13.6+body):
   pt((shoulder.x+wrist.x)*.5+side*1.3,(shoulder.y+wrist.y)*.5+.65);
  arms.push({side,shoulder,elbow,wrist});
 }
 return {active,phase,body,arms,legs};
}
