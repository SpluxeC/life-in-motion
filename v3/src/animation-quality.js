// Render-only quality selection. Screen size and frame cost affect visuals,
// never the gameplay clock, pathfinding or saved NPC data.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function animationDetail({zoom=1,fps=60,reducedMotion=false,selected=false}={}){
 const z=Number.isFinite(zoom)?zoom:1;
 const f=Number.isFinite(fps)?fps:60;
 // Preserve functional limb motion at all quality levels.
 const level=selected||z>=.95&&f>=28?'high':z>=.55&&f>=24?'medium':'low';
 return Object.freeze({level,secondary:!reducedMotion&&level==='high',gesture:level!=='low',essential:true});
}
export function adaptiveFrameRate(previous=60,delta=1/60){
 const sample=Number.isFinite(delta)&&delta>0?clamp(1/delta,1,120):60;
 return clamp(previous*.94+sample*.06,1,120);
}
export function animationRenderOptions(detail){
 return {secondaryMotion:detail.secondary,activityGesture:detail.gesture};
}
