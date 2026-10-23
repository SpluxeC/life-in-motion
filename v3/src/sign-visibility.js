// Screen-space occlusion for overhead departmental signs.
// The sign is translucent only while a living NPC can actually be seen behind
// its projected face; nearby people outside the silhouette leave it opaque.
function polygonContains(poly,p){
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
export function signFace(sign,project){
 const span=sign.name.length>=9?2.28:1.78,x=sign.x,y=sign.y-.12;
 return [project(x-span,y,70),project(x+span,y,70),
  project(x+span,y,44),project(x-span,y,44)];
}
export function signCoversNpc(sign,n,project,zoom=1){
 if(!n.alive||n.unconscious>0)return false;
 const poly=signFace(sign,project);
 const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y);
 const minX=Math.min(...xs),maxX=Math.max(...xs);
 const minY=Math.min(...ys),maxY=Math.max(...ys);
 const foot=project(n.rx??n.x,n.ry??n.y);
 const head=project(n.rx??n.x,n.ry??n.y,35);
 const halfWidth=8*zoom;
 if(foot.x+halfWidth<minX||foot.x-halfWidth>maxX||
    foot.y<minY-3*zoom||head.y>maxY+3*zoom)return false;
 // Sample the NPC's head-to-waist silhouette. A tiny tolerance handles
 // anti-aliased sign edges but does not fade signs for adjacent aisle users.
 for(const z of [10,17,25,33]){
  const p=project(n.rx??n.x,n.ry??n.y,z);
  if(polygonContains(poly,p)||
     polygonContains(poly,{x:p.x-halfWidth*.45,y:p.y})||
     polygonContains(poly,{x:p.x+halfWidth*.45,y:p.y}))return true;
 }
 return false;
}
export function signOpacity(sign,npcs,project,zoom,paintDepth,actorDepth){
 return npcs.some(n=>actorDepth(n)>paintDepth&&signCoversNpc(sign,n,project,zoom))?.26:1;
}
