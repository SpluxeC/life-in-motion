// Shared painter-order keys for the iso projection. Large x+y is farther
// from the camera, so it is painted first. Every NPC is ordered by FEET.
export function renderDepth(kind,o){
 const x=kind==='npc'?(o.rx??o.x??0):(o.x??0);
 const y=kind==='npc'?(o.ry??o.y??0):(o.y??0);
 // Fixtures occupy tiles extending toward the viewer. Use their near-side
 // footprint boundary, rather than their center, for shelf/wall occlusion.
 return x+y;
}
export function compareRenderDepth(a,b){
 const difference=b.depth-a.depth;
 if(Math.abs(difference)>0.0001)return difference;
 // At matching ground depth, the solid fixture/wall is painted over the NPC.
 const priority={npc:0,item:1,sign:2,door:3,fixture:4,vehicle:4,wall:5};
 return (priority[a.kind]??2)-(priority[b.kind]??2);
}
