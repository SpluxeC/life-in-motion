// Shared, camera-consistent depth keys for procedural isometric artwork.
// The canvas camera projects farther tiles higher: larger x+y renders first.
export function renderDepth(kind,o){
 if(kind==='npc'){
  // A stick figure rises ~35 projected height units. Pull it slightly toward
  // the viewer when sorting with tall fixtures, so shoulders/heads at a
  // counter or aisle aren't incorrectly painted over by nearby equipment.
  return (o.rx??o.x)+(o.ry??o.y)-2.75;
 }
 const x=o.x||0,y=o.y||0,w=o.w||1,h=o.h||1;
 if(kind==='fixture'||kind==='vehicle'){
  // Center of the actual occupied footprint, not its back-most corner.
  return x+y+(w+h-2)*.5;
 }
 return x+y;
}
export function compareRenderDepth(a,b){
 const depthDifference=b.depth-a.depth;
 // For coplanar positions, place actors after fixtures so they remain legible.
 return depthDifference||((a.kind==='npc'?1:0)-(b.kind==='npc'?1:0));
}
