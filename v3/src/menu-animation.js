// Main-menu cursor gaze. All ambient movement is CSS, not a second render loop.
// No events are processed while playing, on touch devices, or with reduced motion.
export function initMenuAnimation(menu, view=window){
 const eye=menu?.querySelector('.menuMark');
 const pupil=menu?.querySelector('.menuEyePupil');
 if(!menu||!eye||!pupil||!view?.matchMedia)return ()=>{};
 const reduced=view.matchMedia('(prefers-reduced-motion: reduce)');
 const precisePointer=view.matchMedia('(hover: hover) and (pointer: fine)');
 let lastX=0,lastY=0;
 const reset=()=>{
  lastX=0;lastY=0;
  pupil.style.setProperty('--eye-x','0px');
  pupil.style.setProperty('--eye-y','0px');
 };
 const onMove=event=>{
  if(reduced.matches||!precisePointer.matches||menu.classList.contains('hidden'))return;
  const bounds=eye.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  const centerX=bounds.left+bounds.width/2,centerY=bounds.top+bounds.height/2;
  const x=Math.max(-3,Math.min(3,(event.clientX-centerX)/Math.max(bounds.width*2.5,1)*3));
  const y=Math.max(-2,Math.min(2,(event.clientY-centerY)/Math.max(bounds.height*3.5,1)*2));
  if(Math.abs(lastX-x)<.12&&Math.abs(lastY-y)<.12)return;
  lastX=x;lastY=y;
  pupil.style.setProperty('--eye-x',x.toFixed(2)+'px');
  pupil.style.setProperty('--eye-y',y.toFixed(2)+'px');
 };
 menu.addEventListener('pointermove',onMove,{passive:true});
 menu.addEventListener('pointerleave',reset);
 if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',reset);
 if(typeof precisePointer.addEventListener==='function')precisePointer.addEventListener('change',reset);
 return ()=>{
  menu.removeEventListener('pointermove',onMove);
  menu.removeEventListener('pointerleave',reset);
  if(typeof reduced.removeEventListener==='function')reduced.removeEventListener('change',reset);
  if(typeof precisePointer.removeEventListener==='function')precisePointer.removeEventListener('change',reset);
  reset();
 };
}
