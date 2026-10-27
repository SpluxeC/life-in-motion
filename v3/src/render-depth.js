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
 // Draw wall panels behind the nearby front-mounted fixtures.
 if(kind==='wall')return x*cx+y*cy+Math.max(cx,cy)*1.05;
 return solid?nearX*cx+nearY*cy:x*cx+y*cy;
}
export function compareRenderDepth(a,b){
 const d=b.depth-a.depth;
 if(Math.abs(d)>1e-5)return d;
 const priority={npc:0,item:1,hazard:1,sign:2,door:3,wall:3,fixture:4,vehicle:4};
 return (priority[a.kind]??2)-(priority[b.kind]??2);
}

/**
 * Wall-side display fixtures must sit ahead of their own backing wall,
 * without jumping ahead of nearer NPCs or unrelated props.
 */
export function fixtureDepthWithBackingWall(fixture,walls,cameraAngle=45){
 const ordinary=renderDepth('fixture',fixture,cameraAngle);
 const wallSide=fixture.type==='gardenToolsRack'||fixture.type==='lockers'||
   fixture.type==='departmentWallShelf'&&fixture.x===35;
 if(!wallSide)return ordinary;
 const nearby=walls.filter(w=>w.section!=='gardenFence'&&
   w.x>=fixture.x-1&&w.x<=fixture.x+(fixture.w||1)+1&&
   w.y>=fixture.y-1&&w.y<=fixture.y+(fixture.h||1)+1);
 if(!nearby.length)return ordinary;
 // Paint after the nearest local wall, but continue to participate normally
 // in the depth queue (including NPCs and vehicles).
 const nearestWall=Math.min(...nearby.map(w=>renderDepth('wall',w,cameraAngle)));
 return Math.min(ordinary,nearestWall-.025);
}
