// Two-pointer, screen-space camera zoom that keeps the world under the
// gesture midpoint fixed while supporting simultaneous two-finger panning.
// No UI hints: touch-action:none on the canvas lets pointer events own input.
export function pinchCamera(camera,before,after,viewport){
 const distance=pair=>Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y);
 const oldDistance=distance(before),newDistance=distance(after);
 if(oldDistance<1||!Number.isFinite(newDistance)||!Number.isFinite(camera.zoom))
  return {zoom:camera.zoom,offset:{...camera.offset}};
 const zoom=Math.max(.32,Math.min(2,camera.zoom*newDistance/oldDistance));
 const oldMid={x:(before[0].x+before[1].x)/2,y:(before[0].y+before[1].y)/2};
 const newMid={x:(after[0].x+after[1].x)/2,y:(after[0].y+after[1].y)/2};
 const cx=viewport.w*.5,cy=viewport.h*.56;
 return {zoom,offset:{
  x:camera.offset.x+(oldMid.x-cx)/camera.zoom-(newMid.x-cx)/zoom,
  y:camera.offset.y+(oldMid.y-cy)/camera.zoom-(newMid.y-cy)/zoom
 }};
}
