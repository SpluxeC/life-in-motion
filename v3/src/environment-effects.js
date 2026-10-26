// Phase 3 environmental cues are derived exclusively from active world hazards.
// No gameplay mutation; deterministic under pause, saving, and browser refresh.
const finite=v=>Number.isFinite(v)?v:0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function environmentCue(hazard={},elapsed=0){
 if(!(finite(hazard.life)>0))return null;
 const kind=hazard.kind;
 if(!['fire','spill','electric'].includes(kind))return null;
 const x=finite(hazard.x),y=finite(hazard.y);
 const seed=(Math.floor(x*13+y*19)%37)/37;
 const t=finite(elapsed);
 const phase=t*(kind==='fire'?3.2:kind==='electric'?7:1.2)+seed*6.28;
 const strength=kind==='fire'?.7+.3*Math.sin(phase)**2:kind==='electric'?.5+.5*Math.sin(phase)**2:.35;
 return Object.freeze({kind,x,y,phase,strength:clamp(strength,0,1),radius:kind==='fire'?18:kind==='electric'?13:21});
}
export function environmentCues(world,elapsed){
 return (world?.hazards||[]).map(h=>environmentCue(h,elapsed)).filter(Boolean);
}
