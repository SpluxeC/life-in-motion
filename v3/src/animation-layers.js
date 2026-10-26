// Phase 1: deterministic, render-only animation layers. No simulation state is changed.
// All phases are derived from saved simulation fields, so pause and save/load are stable.
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const finite=(v,otherwise=0)=>Number.isFinite(v)?v:otherwise;
const weighted=(a,b,weight)=>a+(b-a)*clamp(weight,0,1);
export function animationLayers(n){
 const walk=!!(n.alive&&finite(n.unconscious)<=0&&(n.path?.length||0)>0);
 const action=String(n.action||'idle');
 const phase=finite(n.actionPhase);
 // Walk locomotion always outranks idle and activity gestures.
 const activityWeight=walk||!n.alive||finite(n.unconscious)>0?0:1;
 const seed=String(n.id??'').split('').reduce((a,ch)=>a+ch.charCodeAt(0),0)*.137;
 const idleBreath=!walk&&n.alive&&finite(n.unconscious)<=0?Math.sin(phase*1.8+seed)*.28:0;
 const expressiveness=clamp(finite(n.energy,60)/100,.25,1);
 const gesture=activityWeight*(action==='talk'?.8:action==='offerHelp'?.95:action==='scan'||action==='type'?.45:action==='stock'||action==='inspect'?.55:0);
 return Object.freeze({walk,action,activityWeight,idleBreath,gesture,expressiveness});
}
// Blend a secondary offset with an authored base pose. This never changes limb
// attachment coordinates or creates a new gameplay action.
export function blendSecondary(base,offset,weight=1){return weighted(base,base+finite(offset),weight)}
