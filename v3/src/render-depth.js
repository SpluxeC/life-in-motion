// Camera-aware 2.5D painter order. The camera's ground projection is
// yScreen = -c*x-d*y. Larger (c*x+d*y) is farther away and draws first.
// Do not change camera controls, geometry, map layout or gameplay collision.
export function renderDepth(kind,o,cameraAngle=45){
 const yaw=cameraAngle*Math.PI/180;
 const cx=Math.sin(yaw),cy=Math.cos(yaw);
 const x=kind==='npc'?(o.rx??o.x??0):(o.x??0);
 const y=kind==='npc'?(o.ry??o.y??0):(o.y??0);
 if(kind==='npc')return x*cx+y*cy;
 // Whole tile footprints: choose the viewer-nearest edge for solid objects.
 // Wall polygons may store their own footprints, otherwise assume 1 tile.
 const w=Math.max(1,Number(o.w)||1),h=Math.max(1,Number(o.h)||1);
 const solid=['fixture','wall','vehicle','door'].includes(kind);
 const nearX=x+(cx>=0?w-1:0),nearY=y+(cy>=0?h-1:0);
 return solid?nearX*cx+nearY*cy:x*cx+y*cy;
}
export function compareRenderDepth(a,b){
 const d=b.depth-a.depth;
 if(Math.abs(d)>1e-5)return d;
 const priority={npc:0,item:1,hazard:1,sign:2,door:3,fixture:4,vehicle:4,wall:5};
 return (priority[a.kind]??2)-(priority[b.kind]??2);
}
