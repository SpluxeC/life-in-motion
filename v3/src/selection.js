// Canvas picking utilities shared with QA. A floor click has a ground-space
// footprint; tall fixtures are hit by their real projected silhouette rather
// than a giant bounding rectangle that swallows neighboring aisle tiles.
const within=(n,lo,hi)=>n>=lo&&n<=hi;
function hull(points){
 const pts=points.map(p=>({x:p.x,y:p.y})).sort((a,b)=>a.x-b.x||a.y-b.y);
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const lo=[],hi=[];
 for(const p of pts){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
 for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p)}
 lo.pop();hi.pop();return lo.concat(hi);
}
function polygonContains(poly,x,y){
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];
  if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
export function hitProjectedFixture(o,sx,sy,project,height=35){
 const x=o.x,y=o.y,w=o.w||1,h=o.h||1;
 const points=[];
 for(const z of [0,height])for(const px of [x-.5,x+w-.5])for(const py of [y-.5,y+h-.5])points.push(project(px,py,z));
 const outline=hull(points);
 if(!polygonContains(outline,sx,sy))return null;
 const mid=project(x+(w-1)*.5,y+(h-1)*.5,height*.5);
 return Math.hypot(sx-mid.x,sy-mid.y)/Math.max(1,w+h);
}
export function isGroundTileTap(world,x,y,sx,sy,project,zoom=1){
 if(!world||!within(x,0,world.width-1)||!within(y,0,world.height-1))return false;
 if(world.walls.has(x+','+y)||world.blocking.has(x+','+y)||
  world.fixtures.some(f=>x>=f.x&&x<f.x+f.w&&y>=f.y&&y<f.y+f.h))return false;
 const p=project(x,y);
 const dx=Math.abs(sx-p.x)/(24*zoom),dy=Math.abs(sy-p.y)/(12*zoom);
 return dx+dy<=1.12;
}
const displayName=text=>String(text||'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export function selectionLabel(world,selected){
 if(!selected)return '';
 if(selected.type==='tile'){
  const ground=world?.ground?.find(t=>t.x===selected.x&&t.y===selected.y);
  const label=ground?.area==='store'?'Store Aisle':displayName(ground?.area||'Ground');
  return label+' Tile ('+selected.x+', '+selected.y+')';
 }
 const namedMachines={paintMixer:'Paint Mixer',keyCutter:'Key Cutting Machine',wireCutter:'Wire Cutting Machine',forklift:'Forklift',handTruck:'Hand Truck',bucketStack:'Paint Buckets',ridingMower:'Riding Lawn Mower'};
 if(namedMachines[selected.type])return namedMachines[selected.type];
 const person=world?.npcs?.find?.(o=>o.id===selected.id);
 if(person)return person.name;
 if(selected.name)return selected.name;
 if(selected.label)return selected.label;
 if(selected.type==='gardenToolsRack')return 'Garden Tools';
 if(selected.department)return displayName(selected.department)+' Shelf';
 return displayName(selected.type||'Selection');
}
