// Life in Motion v3 — resolution-independent, built-in isometric environment artwork.
// Nothing in this module downloads external images. Every object uses the same
// world-tile footprint and screen projection as collision/pathfinding.
import {departmentItem,visibleShelfCount} from './merchandise.js?v=driver-side-forklift-wheels-20261023-1';
export function createArtwork(ctx,project,getZoom){
 const P=(x,y,h=0)=>project(x,y,h),Z=()=>getZoom();
 const colorNoise=(x,y)=>{let k=((x*73856093)^(y*19349663))>>>0;return k%7};
 function poly(vertices,fill,stroke=null,width=1){
  ctx.beginPath();vertices.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width*Z();ctx.stroke()}
 }
 function line(a,b,color='#253439',width=1){
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width*Z();ctx.stroke()
 }
 function ellipse(x,y,rx,ry,color,stroke=null){
  ctx.beginPath();ctx.ellipse(x,y,Math.max(.2,rx*Z()),Math.max(.2,ry*Z()),0,0,Math.PI*2);
  ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Z();ctx.stroke()}
 }
 const footprint=(x,y,w,h)=>[P(x-.5,y-.5),P(x+w-.5,y-.5),P(x+w-.5,y+h-.5),P(x-.5,y+h-.5)];
 function surface(x,y,w,h,height,fill,stroke='#3d4f51'){
  const vs=footprint(x,y,w,h).map(p=>({x:p.x,y:p.y-height*Z()}));poly(vs,fill,stroke,.6);return vs;
 }
 function solid(x,y,w,h,height,top='#aab0a9',sideX='#687877',sideY='#84918b'){
  const base=footprint(x,y,w,h),z=height*Z(),topPts=base.map(p=>({x:p.x,y:p.y-z}));
  // In this projection both +X and +Y recede upward on screen.
  // The visible vertical faces share the NEAR corner (index 0), not
  // the far corner (index 2). Drawing far faces made cabinets/pallets
  // appear to have their entire lower halves missing.
  poly([topPts[3],topPts[0],base[0],base[3]],sideX,'#35474a',.7);
  poly([topPts[0],topPts[1],base[1],base[0]],sideY,'#35474a',.7);
  poly(topPts,top,'#405354',.8);return topPts;
 }
 function shadow(x,y,w,h,scale=1){
  const p=P(x+(w-1)*.5,y+(h-1)*.5);ellipse(p.x+4*Z(),p.y+6*Z(),Math.max(8,(w+h)*11*scale),Math.max(3,(w+h)*4*scale),'#111e203b')
 }
 function label(x,y,z,text,ink='#f4eee2',bg='#344951',width=46){
  const p=P(x,y,z),s=Z();ctx.fillStyle=bg;ctx.fillRect(p.x-width*s*.5,p.y-7*s,width*s,11*s);
  ctx.font=`bold ${Math.max(6,8*s)}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;
  ctx.fillText(text,p.x,p.y-1*s,width*s-3*s)
 }
 function miniBox(x,y,z,c='#ad865b',w=.34,h=.37,t=6){
  const corners=[P(x-.5,y-.5,z),P(x+w-.5,y-.5,z),P(x+w-.5,y+h-.5,z),P(x-.5,y+h-.5,z)];
  const top=[P(x-.5,y-.5,z+t),P(x+w-.5,y-.5,z+t),P(x+w-.5,y+h-.5,z+t),P(x-.5,y+h-.5,z+t)];
  // Small cartons use the identical near-face rule as all fixtures.
  poly([top[3],top[0],corners[0],corners[3]],'#7b6a58');
  poly([top[0],top[1],corners[1],corners[0]],'#9b8065');
  poly(top,c,'#445154',.5);
 }
 function miniCan(x,y,z,c='#c76b4d',r=3){
  const p=P(x,y,z);ctx.fillStyle=c;ctx.fillRect(p.x-r*Z(),p.y-6*Z(),r*2*Z(),6*Z());
  ellipse(p.x,p.y-6*Z(),r,1.7,'#dddcd2','#4a5958');line({x:p.x-r*Z(),y:p.y},{x:p.x+r*Z(),y:p.y},'#586e6f')
 }
 function bolt(x,y,z,c='#bcc7c5'){
  const p=P(x,y,z);ellipse(p.x,p.y,2.3,2,c,'#536365');line({x:p.x-4*Z(),y:p.y+4*Z()},{x:p.x+5*Z(),y:p.y-4*Z()},'#758483',2)
 }
 function plants(x,y,z=0,qty=3){
  for(let i=0;i<qty;i++){
   const px=x+(i%3)*.4,py=y+Math.floor(i/3)*.4,p=P(px,py,z);
   ellipse(p.x,p.y,5,3,'#8e664a','#524935');
   line({x:p.x,y:p.y},{x:p.x,y:p.y-11*Z()},'#517d49',1.8);
   for(let k=0;k<4;k++){ellipse(p.x+Math.cos(k*1.6+i)*5*Z(),p.y-9*Z()+Math.sin(k*1.7)*3*Z(),4,3,['#356b49','#568a4b','#799e53'][k%3])}
  }
 }
 function drawFloor(world,viewport){
  const z=Z(),W=viewport.w,H=viewport.h;
  const palette={road:['#38444b','#3b464c','#414b50'],parking:['#555f62','#576064','#60696a'],store:['#b4b5aa','#aeafa5','#a9aaa1'],employee:['#8f9b94','#95a097','#89948d'],garden:['#9b9981','#a6a48a','#a2a48c'],sidewalk:['#b9bbb0','#b5b9ae','#c2c3b8'],loading:['#777f7d','#828986','#747c7a'],landscape:['#56704f','#5b7554','#617955'],grass:['#6a7f5c','#718360','#637856']};
  for(const tile of world.ground){
   const p=P(tile.x,tile.y);if(p.x<-40||p.x>W+40||p.y<-70||p.y>H+70)continue;
   const a=24*z,b=12*z,base=palette[tile.area]||palette.grass,c=base[colorNoise(tile.x,tile.y)%base.length];
   poly([{x:p.x,y:p.y-b},{x:p.x+a,y:p.y},{x:p.x,y:p.y+b},{x:p.x-a,y:p.y}],c);
   if(tile.area==='store'||tile.area==='employee'){
    if((tile.x+tile.y)%2===0&&z>.45){
     const e=P(tile.x+.46,tile.y+.46),d=P(tile.x-.46,tile.y+.46);
     line(d,e,tile.area==='store'?'#7c857a35':'#66796f48',.7)
    }
    if(colorNoise(tile.x+9,tile.y+3)===0&&z>.65)ellipse(p.x,p.y,1.2,.6,'#848c7f55')
   }else if(tile.area==='road'||tile.area==='parking'){
    if(colorNoise(tile.x,tile.y+13)===0&&z>.45){const e=P(tile.x+.16,tile.y),f=P(tile.x-.17,tile.y);line(e,f,'#9ca2a326',1)}
   }else if(colorNoise(tile.x+5,tile.y)===0&&z>.55){
    line({x:p.x,y:p.y-1*z},{x:p.x+2*z,y:p.y-3*z},'#3a604144',1)
   }
  }
  // Parking-bay rules and handicap-access aisle graphics belong to floor coordinates.
  for(let x=5;x<64;x+=8){
   const a=P(x,2.5),b=P(x,7.6),c=P(x+5,2.5),d=P(x+5,7.6);
   line(a,b,'#e6e3cb',2.2);line(c,d,'#e6e3cb',2.2)
  }
  // Store sidewalk & pedestrian crossing from the lot to the entrance.
  for(let x=2;x<=36;x++){const p=P(x,9);ellipse(p.x,p.y,8,2,'#ced2c166')}
  for(let y=4;y<=9;y+=2){
   const a=P(64.3,y-.7),b=P(65.7,y-.7),c=P(65.7,y+.5),d=P(64.3,y+.5);
   poly([a,b,c,d],'#dbdfd5cf')
  }
  for(let y=13;y<42;y+=5)line(P(69,y),P(69,y+2.2),'#e4d1a0',2.1);
 }
 // All vertical panels are oriented in world space; wall-side cabinets face
 // accessible staff aisles instead of appearing like camera-facing billboards.
 function cabinetFace(o,height=43){
  const facing=o.facing||'south',x=o.x,y=o.y,w=o.w||1,h=o.h||1;
  let p1,p2,p3,p4;
  if(facing==='west'){
   p1=P(x-.48,y-.42,2);p2=P(x-.48,y+h-.58,2);
   p3=P(x-.48,y+h-.58,height-5);p4=P(x-.48,y-.42,height-5);
  }else{
   p1=P(x-.42,y-.48,2);p2=P(x+w-.58,y-.48,2);
   p3=P(x+w-.58,y-.48,height-5);p4=P(x-.42,y-.48,height-5);
  }
  poly([p1,p2,p3,p4],'#526c7188','#d0dfda',1.1);
  line({x:p1.x*.3+p4.x*.7,y:p1.y*.3+p4.y*.7},{x:p2.x*.3+p3.x*.7,y:p2.y*.3+p3.y*.7},'#e6e9dc',.8);
  return [p1,p2,p3,p4];
 }
 function drawTimberFence(o){
  const x=o.x-.5,y=o.y-.5;
  const a=P(x,y),b=o.axis==='y'?P(x,y+1):P(x+1,y);
  const at=h=>({x:a.x,y:a.y-h*Z()}),bt=h=>({x:b.x,y:b.y-h*Z()});
  // Two continuous rails behind closely spaced pickets, with sturdy posts.
  for(const height of [9,22]){
   const low=height-2,high=height+2;
   poly([at(high),bt(high),bt(low),at(low)],'#ad8859','#694a32',.8);
  }
  for(let i=0;i<=4;i++){
   const t=i/4,px=x+(o.axis==='y'?0:t),py=y+(o.axis==='y'?t:0);
   const bottom=P(px,py,2),top=P(px,py,30+(i%2));
   line(bottom,top,i%2?'#a77d51':'#bd9667',5.2);
   line(P(px,py,29),P(px,py,32), '#ddbb83',2.5);
  }
  for(const pt of [[x,y],[x+(o.axis==='y'?0:1),y+(o.axis==='y'?1:0)]]){
   const base=P(pt[0],pt[1],0),top=P(pt[0],pt[1],35);
   line(base,top,'#805633',7);
   ellipse(top.x,top.y,4.5,2.3,'#e2b77d','#865a39');
   line(P(pt[0],pt[1],15),P(pt[0],pt[1],18),'#5e432b',.8);
  }
 }
 function drawWall(o,world){
  if(o.section==='gardenFence'){drawTimberFence(o);return}
  const dirs=o.axes?.length?o.axes:[o.axis==='y'?'y':'x'];
  const height=o.section==='staff'?55:53,z=height*Z();
  // Paint each leg of a genuine X/Y corner once. Previously the world
  // overwrote a wall leg, creating holes; drawing duplicate end caps instead
  // made the opposite corners look thicker than the rest of the building.
  for(const axis of dirs){
   // Slightly overlap neighboring fills to prevent antialiased pixel seams.
   const p=P(o.x-.52,o.y-.52),q=axis==='y'?P(o.x-.52,o.y+.52):P(o.x+.52,o.y-.52);
   const top={x:p.x,y:p.y-z},end={x:q.x,y:q.y-z};
   const shade=axis==='y'?'#a6b7b0':'#c0c6ba';
   poly([{x:p.x+3*Z(),y:p.y+5*Z()},{x:q.x+3*Z(),y:q.y+5*Z()},
     {x:q.x+4*Z(),y:q.y-20*Z()},{x:p.x+4*Z(),y:p.y-20*Z()}],'#1a252a27');
   poly([p,q,end,top],shade);
   line(top,end,o.section==='staff'?'#ede9dc':'#e7e5d5',3);
   // North elevation faces the parking lot. Glass and mullions stay inside
   // the physical wall segment; no window occupies either main entry tile.
   if(o.window==='storefront'&&o.y===10&&axis==='x'){
    const left=o.x-.38,right=o.x+.38,front=o.y-.51;
    const topZ=43,bottomZ=14;
    const a=P(left,front,topZ),b=P(right,front,topZ);
    const c=P(right,front,bottomZ),d=P(left,front,bottomZ);
    poly([a,b,c,d],'#507b8799','#3d5e67',1.5);
    line(P(left,front,topZ),P(right,front,topZ),'#d6e0dc',1.2);
    line(P(left,front,bottomZ),P(right,front,bottomZ),'#aebfb8',1.5);
    line(P(left,front,29),P(right,front,29),'#c7d5d2',.9);
    line(P(left+.10,front,40),P(left+.46,front,17),'#e6eff055',1.8);
   }
  }
 }
 function drawDoor(d){
  const axis=d.axis||([36,38].includes(d.x)?'y':'x'),open=Math.max(0,Math.min(1,d.open||0));
  const start={x:d.x-.5,y:d.y-.5};
  const span=axis==='x'?(d.w||1):(d.h||1);
  const end=axis==='x'?{x:start.x+span,y:start.y}:{x:start.x,y:start.y+span};
  const h=d.type==='rollup'?53:48;
  const a=P(start.x,start.y),b=P(end.x,end.y),at=P(start.x,start.y,h),bt=P(end.x,end.y,h);
  // Rigid frame: ground threshold, twin jambs, lintel; opening stays empty.
  line(a,b,d.type==='sliding'?'#b6d0d1':'#4f6665',3);
  line(a,at,'#3e5659',3.7);line(b,bt,'#3e5659',3.7);line(at,bt,'#d2d7c9',3.5);
  if(d.type==='gate'){
   // Garden entry is a working hinged gate and uses the same collision
   // and auto-open timing as staff doors, not a static fence graphic.
   const swing=open*1.30,ex=start.x-Math.sin(swing),ey=start.y+Math.cos(swing);
   const from=t=>({x:start.x+(ex-start.x)*t,y:start.y+(ey-start.y)*t});
   line(P(start.x,start.y),P(start.x,start.y,35),'#815634',7);
   line(P(end.x,end.y),P(end.x,end.y,35),'#815634',7);
   for(const h of [10,22]){
    line(P(start.x,start.y,h),P(ex,ey,h),'#b58a58',3);
   }
   for(let i=0;i<=5;i++){
    const p=from(i/5);
    line(P(p.x,p.y,2),P(p.x,p.y,31),'#b58e5c',4);
   }
   ellipse(P(ex,ey,17).x,P(ex,ey,17).y,2,1.5,'#d7d3b1');
   return;
  }
  if(d.type==='rollup'){
   const visible=h*(1-open);
   if(visible>1){
    let aa=P(start.x,start.y,h),bb=P(end.x,end.y,h),cc=P(end.x,end.y,h-visible),dd=P(start.x,start.y,h-visible);
    poly([aa,bb,cc,dd],'#9da7a3','#46595a',1);
    for(let k=5;k<visible;k+=6)line(P(start.x,start.y,h-k),P(end.x,end.y,h-k),'#607472',1.4)
   }
   ellipse((at.x+bt.x)/2,(at.y+bt.y)/2,5,2,'#b0b3a9');
   return;
  }
  if(d.type==='sliding'){
   // Both axes share the exact sliding track plane; the garden wall runs
   // along Y, so its glass translates along Y rather than turning outward.
   // Paired double entrances slide away from their shared center.
   const len=span*(1-open)*.91,from=d.slideTo==='end'?span-len:0;
   const x1=start.x+(axis==='x'?from:0),y1=start.y+(axis==='y'?from:0);
   const x2=x1+(axis==='x'?len:0),y2=y1+(axis==='y'?len:0);
   poly([P(x1,y1,4),P(x2,y2,4),P(x2,y2,h-4),P(x1,y1,h-4)],'#699da363','#90b2b4',1.7);
   line(P((x1+x2)/2,(y1+y2)/2,4),P((x1+x2)/2,(y1+y2)/2,h-4),'#d2e7e3',.7);
   return;
  }
  // A true swinging panel rotates *in world space*, not by resizing a 2-D rectangle.
  const angle=open*1.32;
  let ex=start.x+(axis==='x'?Math.cos(angle):-Math.sin(angle));
  let ey=start.y+(axis==='x'?Math.sin(angle):Math.cos(angle));
  const edgeBottom=P(ex,ey,3),edgeTop=P(ex,ey,h-3),hingeBottom=P(start.x,start.y,3),hingeTop=P(start.x,start.y,h-3);
  poly([hingeBottom,edgeBottom,edgeTop,hingeTop],d.label.includes('Restroom')?'#b7cac2':'#ad9678','#6a6655',1.6);
  line(P(start.x,start.y,17),P(ex,ey,17),'#d8c5a4',1);
  const handle=P(start.x+(ex-start.x)*.8,start.y+(ey-start.y)*.8,19);
  ellipse(handle.x,handle.y,2.3,1.7,'#edd5a0','#71593d');
 }
 // Chunky, easily distinguishable merchandise displays. These are shelf
 // graphics, not tiny physical copies of inventory objects. All four colors
 // for a department remain distinct when viewed at normal game zoom.
 const shelfSchemes={
  PAINT:      {accent:'#cf6b53',light:'#f3ddaa',dark:'#6b5964',packs:['#bf6659','#e1bb67','#75a9c0','#b7b5ac']},
  TOOLS:      {accent:'#d7a44e',light:'#eed8a1',dark:'#3c4852',packs:['#434f5a','#d1a54c','#5e6d72','#be7450']},
  ELECTRICAL: {accent:'#e1bd65',light:'#e9edda',dark:'#344e61',packs:['#618cac','#d8b25d','#426c83','#b0d2d9']},
  PLUMBING:   {accent:'#78b7d0',light:'#e7eeeb',dark:'#3f646f',packs:['#5596b5','#9dc0cb','#d5dfe0','#608c93']},
  HARDWARE:   {accent:'#b9bd7a',light:'#e2dfc3',dark:'#4d6765',packs:['#819a91','#bea871','#607c7b','#b4c3b7']}
 };
 function productScheme(dept){return shelfSchemes[dept]||shelfSchemes.HARDWARE}
 function merchandiseFace(axis,fixed,start,end,bottom,top,dept,index){
  const scheme=productScheme(dept);
  const point=(along,z)=>axis==='x'?P(fixed,along,z):P(along,fixed,z);
  const a=point(start,bottom),b=point(end,bottom),c=point(end,top),d=point(start,top);
  // Full-height illustrated packaging covers most of the shelf opening.
  const shade=scheme.packs[index%scheme.packs.length];
  poly([d,c,b,a],shade,scheme.dark,.7);
  const stripe=point(start,top-2),stripeEnd=point(end,top-2);
  line(stripe,stripeEnd,scheme.light,1.15);
  const middle=(start+end)/2,centerZ=(bottom+top)/2;
  const p=point(middle,centerZ);
  if(dept==='PAINT'){
   // Giant tin labels and a reflective metal lid read clearly in silhouette.
   const canTop=point(middle,top-1),canBottom=point(middle,bottom+1);
   ellipse(canTop.x,canTop.y,5.7,2.2,'#d7ded9','#697575');
   const labelA=point(start+.09,centerZ+1.5),labelB=point(end-.09,centerZ+1.5);
   line(labelA,labelB,'#f6eacb',2.6);
   ellipse(canBottom.x,canBottom.y,4.9,1.5,'#4e6666');
  }else if(dept==='TOOLS'){
   const left=point(start+.12,centerZ),right=point(end-.12,centerZ);
   line(left,right,scheme.accent,3);
   // Oversized tool case handle.
   line(point(middle-.12,top-1),point(middle+.12,top-1),'#e8ddd0',2.2);
   ellipse(p.x,p.y,2.2,1.9,'#cbd7cf');
  }else if(dept==='ELECTRICAL'){
   const high=point(middle,top-2),low=point(middle,bottom+2);
   line(high,low,'#e4e5cf',1.6);
   line(point(start+.07,centerZ),point(end-.07,centerZ),scheme.accent,2.5);
   ellipse(p.x,p.y,2,2,'#fff3bf','#839c9f');
  }else if(dept==='PLUMBING'){
   // White pipe elbows and round chrome fittings on blue packaging.
   const left=point(start+.12,centerZ-1.5),right=point(end-.12,centerZ+1.5);
   line(left,right,'#e1e9e5',3.5);
   ellipse(p.x,p.y,3.2,2.4,'#bfd0ce','#447e9a');
  }else{
   // Large sectional fastener bins with prominent yellow bin labels.
   const left=point(start+.08,centerZ-2),right=point(end-.08,centerZ-2);
   line(left,right,'#3d5d5e',3);
   line(point(start+.15,centerZ+1),point(end-.15,centerZ+1),scheme.accent,2);
   for(const t of [-.08,.09]){
    const q=point(middle+t,bottom+1.8);
    ellipse(q.x,q.y,1.7,1.5,'#e0d7a9');
   }
  }
 }
 function shelfBand(axis,fixed,start,end,z,dept){
  const scheme=productScheme(dept);
  const point=along=>axis==='x'?P(fixed,along,z):P(along,fixed,z);
  // Color-coded trim is more visible than micro-text on moving shelves.
  line(point(start),point(end),scheme.accent,3);
  line(axis==='x'?P(fixed,start,z-2):P(start,fixed,z-2),
       axis==='x'?P(fixed,end,z-2):P(end,fixed,z-2),'#cfd6d0',.8);
 }
 function rack(x,y,w,h,dept,stock,capacity=12){
  shadow(x,y,w,h,1.12);
  const scheme=productScheme(dept),shelfHeights=[9,21,33,45];
  // Real-sized shelving with a continuous back panel: the product graphics
  // sit on the exposed aisle face, not on a tiny camera-facing billboard.
  solid(x,y,w,h,46,'#71817e','#506266','#637676');
  const nearX=x-.505,frontStart=y-.44,frontEnd=y+h-.57;
  const bayCount=Math.round(h*1.4);
  const baysVisible=visibleShelfCount(stock,capacity,bayCount);
  for(let tier=0;tier<3;tier++){
   const bottom=shelfHeights[tier],top=shelfHeights[tier+1]-2;
   for(let i=0;i<baysVisible;i++){
    const step=(frontEnd-frontStart)/bayCount;
    const start=frontStart+i*step+.04,end=frontStart+(i+1)*step-.04;
    merchandiseFace('x',nearX,start,end,bottom+1,top,dept,i+tier*2);
   }
   shelfBand('x',nearX-.009,frontStart,frontEnd,bottom,dept);
   // Shelf lip and shelf depth are emphasized at zoomed-out scale.
   const p1=P(x-.52,y-.48,bottom),p2=P(x+.49,y-.48,bottom);
   line(p1,p2,'#c2c9bf',2.2);
  }
  for(const sy of [frontStart,frontStart+(frontEnd-frontStart)/2,frontEnd]){
   line(P(nearX-.02,sy,2),P(nearX-.02,sy,47),'#2f5056',3.4);
   line(P(nearX-.02,sy,46),P(nearX-.02,sy,48),scheme.accent,2.6);
  }
  const topLeft=P(x-.52,y-.49,49),topRight=P(x-.52,y+h-.51,49);
  line(topLeft,topRight,scheme.accent,4.1);
 }
 function endcapDisplay(o){
  const {x,y,w,h}=o,dept=o.department||'HARDWARE',scheme=productScheme(dept);
  const capacity=o.capacity||Math.max(1,o.stock||6);
  shadow(x,y,w,h,1.13);
  solid(x,y,w,h,41,'#738382','#435861','#5e7270');
  const faceY=y-.518,left=x-.40,right=x+w-.60;
  const shelves=[9,19,29];
  const visible=visibleShelfCount(o.stock,capacity,3);
  // High-contrast promotional endcap with a broad decorative header.
  for(let level=0;level<3;level++){
   const bottom=shelves[level],top=bottom+8.1;
   for(let j=0;j<visible;j++){
    const start=left+j*(right-left)/3+.025,end=left+(j+1)*(right-left)/3-.025;
    merchandiseFace('y',faceY,start,end,bottom+1,top,dept,j+level*2);
   }
   shelfBand('y',faceY-.009,left,right,bottom,dept);
  }
  const head=[P(left,faceY,33),P(right,faceY,33),P(right,faceY,40),P(left,faceY,40)];
  poly(head,scheme.dark,scheme.accent,1.15);
  line(P(left+.05,faceY,36),P(right-.05,faceY,36),scheme.accent,3.1);
  line(P(left,faceY,7),P(left,faceY,41),'#33565b',3);
  line(P(right,faceY,7),P(right,faceY,41),'#33565b',3);
  // A second visible side face gives the one-tile unit physical depth.
  shelfBand('x',x-.50,y-.45,y+.36,37,dept);
 }
 // Shelves mounted against the east wall face WEST into the aisle.
 // The visible merchandise and shelf lips occupy the x-negative plane.
 function westWallDisplay(o){
  const {x,y,h}=o,dept=o.department==='FASTENERS'?'HARDWARE':o.department||'HARDWARE';
  const scheme=productScheme(dept),faceX=x-.52;
  shadow(x,y,1,h,1.1);
  solid(x,y,1,h,41,'#768782','#435b60','#607678');
  const start=y-.44,end=y+h-.55,bays=Math.max(3,h*3),visible=visibleShelfCount(o.stock,o.capacity||8,bays);
  for(let tier=0;tier<3;tier++){
   const bottom=8+tier*10,top=bottom+8;
   for(let i=0;i<visible;i++){
    const a=start+(end-start)*i/bays+.015,b=start+(end-start)*(i+1)/bays-.015;
    merchandiseFace('x',faceX,a,b,bottom+1,top,dept,i+tier*3);
   }
   shelfBand('x',faceX-.01,start,end,bottom,dept);
  }
  for(const yy of [start,end]){
   line(P(faceX-.02,yy,4),P(faceX-.02,yy,41),'#38565e',3);
  }
  line(P(faceX-.02,start,40),P(faceX-.02,end,40),scheme.accent,4);
  // Prominent west-facing display fascia, trays and stocked product blocks.
  // Extend towards the aisle to avoid appearing as a thin cabinet side.
  for(let tier=0;tier<3;tier++){
   const z=7+tier*10;
   const a=P(x-.63,start,z),b=P(x-.63,end,z);
   line(a,b,'#d6dfd7',3.5);
   line(P(x-.64,start,z+8),P(x-.64,end,z+8),scheme.accent,1.5);
   for(let bin=0;bin<3;bin++){
    const yy=start+(bin+.5)*(end-start)/3;
    const c=P(x-.68,yy,z+4);
    ellipse(c.x,c.y,4.4,3.2,scheme.packs[(tier+bin)%scheme.packs.length],'#284348');
   }
  }
 }
 // Cylindrical paint pails stacked in offset tiers on a low timber pallet.
 function paintBucketStack(o){
  const {x,y}=o;
  shadow(x,y,1,1,1.04);
  solid(x,y,1,1,4,'#bda579','#79634a','#99805a');
  const colors=['#ddddd4','#dce2dc','#d4d9d8','#e6e0d2','#d8dfd6','#dbd7ce'];
  for(let tier=0;tier<2;tier++)for(let i=0;i<3;i++){
   const bx=x-.23+i*.25+(tier?.09:0),by=y-.19+(i%2)*.12,z=5+tier*13;
   const pt=P(bx,by,z);
   ctx.fillStyle=colors[(i+tier*3)%colors.length];
   ctx.fillRect(pt.x-5.7*Z(),pt.y-9*Z(),11.4*Z(),9*Z());
   ellipse(pt.x,pt.y-9*Z(),5.9,2.7,'#f4f4eb','#727f7d');
   ellipse(pt.x,pt.y,5.6,2.2,'#9aa6a2','#687876');
   line({x:pt.x-5.6*Z(),y:pt.y-5*Z()},{x:pt.x+5.6*Z(),y:pt.y-5*Z()},
    ['#b45f54','#729eb0','#ceaa5f'][i%3],3.1);
   ctx.beginPath();ctx.arc(pt.x,pt.y-6*Z(),5*Z(),.05,Math.PI-.05);
   ctx.strokeStyle='#637775';ctx.lineWidth=1.3*Z();ctx.stroke();
  }
 }
 function utilityServiceCart(o){
  const {x,y}=o;
  shadow(x,y,1,1,.95);
  // Open steel rolling stock cart: separate bottom and upper trays.
  for(const z of [8,23]){
   solid(x+.12,y+.13,.72,.61,2+z,'#9eada8','#527279','#71878a');
   surface(x+.15,y+.15,.65,.53,z+2.5,'#c0cac1','#576d70');
  }
  for(const px of [x-.29,x+.29])for(const py of [y-.26,y+.25]){
   line(P(px,py,6),P(px,py,34),'#455f66',3);
  }
  // Real rear push handle and four low-profile swiveling casters.
  line(P(x-.30,y+.35,34),P(x+.30,y+.35,34),'#aec5c0',4);
  for(const px of [x-.26,x+.29])for(const py of [y-.25,y+.27]){
   const c=P(px,py,3);
   ellipse(c.x,c.y,3.5,3,'#293b41','#7b9294');
  }
  // Cleaning and stocking supplies physically sit on the trays.
  miniBox(x+.24,y+.25,26,'#d2c4a4',.28,.28,7);
  for(let i=0;i<2;i++){
   const c=P(x-.22+i*.26,y-.18,34);
   ellipse(c.x,c.y,4.1,2.5,i?'#8bc2b7':'#d5a866','#596f70');
   line({x:c.x-3*Z(),y:c.y},{x:c.x+3*Z(),y:c.y},'#e7e7dc',1.4);
  }
  line(P(x-.28,y-.16,35),P(x-.33,y-.16,46),'#8ba6a7',2.4);
  // Tall back frame and visually larger side basket: readable at gameplay zoom.
  line(P(x-.34,y-.32,5),P(x-.34,y-.32,40),'#294e58',4);
  line(P(x+.37,y-.32,5),P(x+.37,y-.32,40),'#294e58',4);
  line(P(x-.34,y-.32,40),P(x+.37,y-.32,40),'#d3e0d8',4);
  for(const z of [14,27]){
   line(P(x-.38,y-.34,z),P(x+.40,y-.34,z),'#afc3bf',3.2);
  }
  const supply=P(x+.06,y+.07,35);
  ellipse(supply.x,supply.y,6,4,'#e8c4a1','#697e7d');
 }
 function checkout(o){
  const {x,y,w,h}=o;
  // Swap the physical front/back: employees now operate from north (-Y).
  const at=(px,py,z=0)=>P(px,2*y-py,z);
  shadow(x,y,w,h,1.05);
  // Steel register counter aligned with the long X-axis. Cashiers stand
  // north (-Y); the POS screen and till face them, while shoppers stand south.
  solid(x,y,w,h,17,'#c3c8c1','#586870','#84928d');
  // Conveyor belt: a broad charcoal rubber band with raised steel rollers
  // instead of a vague dark rectangle.
  surface(x+.12,y+.1,1.10,.73,18.1,'#333d45','#58696e');
  surface(x+.16,y+.16,1.01,.60,18.5,'#202d35','#879398');
  for(let i=0;i<5;i++){
   const bx=x-.29+i*.20;
   line(at(bx,y-.34,18.7),at(bx,y+.24,18.7),'#405158',.95);
  }
  line(at(x-.40,y-.40,19),at(x+.68,y-.40,19),'#e6e4da',2.4);
  line(at(x-.40,y+.30,19),at(x+.68,y+.30,19),'#8c9b9a',2);
  // Thick point-of-sale platform with an inset glass barcode scanner.
  solid(x+1.05,y+.08,.80,.78,20,'#b4c3bf','#576d72','#899b98');
  surface(x+1.02,y+.11,.35,.58,20.5,'#293940','#9ea9a6');
  line(at(x+.58,y-.27,21),at(x+.87,y+.14,21),'#76c9cc',2.4);
  line(at(x+.62,y-.22,21.1),at(x+.89,y+.17,21.1),'#d9f6ed',.8);
  // Employee cash drawer / till handle on the -Y (staff) face.
  const drawerY=y+.47; // mirrored to -Y
  poly([
   at(x+.58,drawerY,8),at(x+1.33,drawerY,8),
   at(x+1.33,drawerY,16),at(x+.58,drawerY,16)
  ],'#708388','#334a50',1);
  line(at(x+.85,drawerY+.015,12),at(x+1.10,drawerY+.015,12),'#dfe6de',2.2);
  // Monitor stand anchored into the POS platform; no floating panels.
  line(at(x+1.13,y+.28,21),at(x+1.13,y+.28,30),'#455a63',4);
  surface(x+1.0,y+.26,.29,.29,21.2,'#607479','#344951');
  // The active terminal display faces -Y, where the cashier stands.
  // The opposite customer side sees the back of the casing.
  const sy=y+.495,left=x+.85,right=x+1.40;
  const screen=[at(left,sy,29),at(right,sy,29),at(right,sy,43),at(left,sy,43)];
  poly(screen,'#2a404a','#182d36',2.2);
  const glass=[at(left+.05,sy+.015,31),at(right-.05,sy+.015,31),
               at(right-.05,sy+.015,40),at(left+.05,sy+.015,40)];
  poly(glass,'#3d7680','#8fb1b4',.65);
  line(at(left+.10,sy+.02,37),at(right-.10,sy+.02,37),'#b0ead1',1.35);
  line(at(left+.10,sy+.02,34),at(left+.30,sy+.02,34),'#f2ca8b',1.7);
  // Low profile keyboard directly between cashier and screen.
  surface(x+.97,y+.39,.38,.14,22,'#344953','#182c34');
  for(let i=0;i<3;i++)line(at(x+.78+i*.1,y+.39,22.3),
                         at(x+.78+i*.1,y+.46,22.3),'#b8c9c5',.7);
  // Customer-facing card reader, attached to the +Y edge.
  const cardY=y-.445; // mirrored to +Y
  const card=[at(x+.72,cardY,22),at(x+1.02,cardY,22),
              at(x+1.02,cardY,28),at(x+.72,cardY,28)];
  poly(card,'#30434d','#172c33',1.3);
  line(at(x+.77,cardY-.015,25),at(x+.97,cardY-.015,25),'#86cebb',1.9);
  // Small bag holder / receipt printer adjacent to the POS.
  solid(x+1.30,y+.20,.16,.28,24,'#dddcd0','#7b8d91','#9ba7a0');
  const printer=at(x+1.38,y+.26,26);
  line({x:printer.x-3*Z(),y:printer.y},{x:printer.x+3*Z(),y:printer.y},
       '#f7f4dc',2.7);
  // Brand-neutral end strip and queue-side bumper.
  line(at(x-.46,y-.47,14),at(x+1.45,y-.47,14),'#af6b50',3.3);
 }
 function serviceDesk(o){
  const {x,y,w,h}=o;
  // Swap the physical front/back: employees now operate from north (-Y).
  const at=(px,py,z=0)=>P(px,2*y-py,z);
  shadow(x,y,w,h,1.08);
  // Three-tile customer-service counter, built into the isometric footprint.
  // Front (+Y) is customer-facing; staff workstation is now north (-Y).
  solid(x,y,w,h,23,'#b8bdb3','#566a6a','#788d89');
  surface(x+.07,y+.07,w-.14,h-.14,24,'#dad8ca','#6e8581');
  // Customer-side (+Y) woodgrain front and a protective bumper.
  const frontY=y-.505;
  poly([at(x-.39,frontY,5),at(x+w-.62,frontY,5),
        at(x+w-.62,frontY,19),at(x-.39,frontY,19)],'#836f61','#536764',1);
  line(at(x-.42,frontY-.012,19),at(x+w-.59,frontY-.012,19),'#dbb990',2.1);
  line(at(x-.42,frontY-.012,7),at(x+w-.59,frontY-.012,7),'#52696b',1.8);
  for(let i=1;i<3;i++){
   const sx=x-.5+i;
   line(at(sx,frontY-.01,6),at(sx,frontY-.01,18),'#9e8874',1.05);
  }
  // Staff-facing (-Y) PC: a freestanding base, a vertical monitor plane,
  // dark bezel, accessible keyboard and visible illuminated UI lines.
  const screenX=x+.47,screenY=y+.435;
  surface(screenX-.18,y+.11,.36,.29,24.7,'#465c66','#283d44');
  line(at(screenX,screenY-.14,24),at(screenX,screenY-.14,34),'#53686d',3.6);
  poly([at(screenX-.32,screenY,32),at(screenX+.32,screenY,32),
        at(screenX+.32,screenY,48),at(screenX-.32,screenY,48)],'#253740','#192d34',2);
  poly([at(screenX-.27,screenY+.01,34),at(screenX+.27,screenY+.01,34),
        at(screenX+.27,screenY+.01,45),at(screenX-.27,screenY+.01,45)],'#387a84','#81acae',.9);
  line(at(screenX-.22,screenY+.02,41),at(screenX+.17,screenY+.02,41),'#b9e9d7',1.45);
  line(at(screenX-.22,screenY+.02,38),at(screenX+.08,screenY+.02,38),'#f6d28d',1.25);
  // Keyboard / mouse physically rest on the countertop on the employee side.
  poly([at(x+.13,y+.32,24.7),at(x+.65,y+.32,24.7),
        at(x+.65,y+.47,24.7),at(x+.13,y+.47,24.7)],'#394d54','#263b41',1);
  for(let k=0;k<4;k++){
   const u=x+.18+k*.105;
   line(at(u,y+.35,25),at(u,y+.43,25),'#acc8c0',.65);
  }
  const mouse=at(x+.80,y+.39,25);
  ellipse(mouse.x,mouse.y,2.8,1.6,'#4b6470','#213941');
  // Center section: layered paper forms, document tray and clip binder.
  poly([at(x+1.08,y-.30,24.6),at(x+1.94,y-.30,24.6),
        at(x+1.94,y+.22,24.6),at(x+1.08,y+.22,24.6)],'#617b7e','#39585e',1);
  for(let layer=0;layer<4;layer++){
   const z=25+layer*1.1,dx=layer*.017;
   poly([at(x+1.17+dx,y-.24,z),at(x+1.84+dx,y-.24,z),
         at(x+1.84+dx,y+.16,z),at(x+1.17+dx,y+.16,z)],layer%2?'#f8f6ed':'#e3e8e1','#a0a9a5',.6);
  }
  for(let k=0;k<3;k++){
   line(at(x+1.27,y-.16+k*.10,29.7),
        at(x+1.75-(k%2)*.12,y-.16+k*.10,29.7),'#8c9a98',.7);
  }
  const binder=at(x+1.24,y-.24,30);
  ellipse(binder.x,binder.y,2.3,1.3,'#354f59');
  // Right-hand realistic desktop printer: rectangular casing, paper feeder,
  // printed output sheet and dark control/status panel.
  miniBox(x+2.12,y+.11,24.5,'#c4c9c3',.67,.59,9);
  poly([at(x+1.67,y-.31,34),at(x+2.29,y-.31,34),
        at(x+2.29,y+.21,34),at(x+1.67,y+.21,34)],'#d6dbd4','#74898a',1);
  poly([at(x+1.75,y-.25,34.5),at(x+2.11,y-.25,34.5),
        at(x+2.11,y+.09,34.5),at(x+1.75,y+.09,34.5)],'#3f555b','#51646a',.7);
  // Paper going into the back feeder, vertical and rigid.
  poly([at(x+1.77,y-.20,34),at(x+2.13,y-.20,34),
        at(x+2.13,y-.20,42),at(x+1.77,y-.20,42)],'#f6f4e9','#a3b7b6',.8);
  // Output tray projects toward the staff, resting above the counter.
  poly([at(x+1.83,y+.12,32),at(x+2.20,y+.12,32),
        at(x+2.20,y+.37,30),at(x+1.83,y+.37,30)],'#e8e9e0','#79898b',.7);
  line(at(x+2.14,y+.325,35),at(x+2.21,y+.325,35),'#7bc9a8',1.8);
 }
 function safetyStation(o){
  const {x,y}=o;
  shadow(x,y,1,1,.75);
  // Shallow wall-side emergency cabinet with a glass cabinet door, visible
  // white cross, first-aid supplies, eyewash shelf, fire extinguisher and
  // red emergency accent. Its accessible face points west toward the aisle.
  const frontX=x-.455;
  // Narrow footprint retains access around the staff-wing wall.
  solid(x+.18,y, .56,.81,43,'#d8e2db','#899e9c','#a0b2ac');
  const face=[P(frontX,y-.37,7),P(frontX,y+.36,7),
              P(frontX,y+.36,40),P(frontX,y-.37,40)];
  poly(face,'#eaf1ea','#597d82',1.6);
  const pane=[P(frontX-.015,y-.26,17),P(frontX-.015,y+.26,17),
              P(frontX-.015,y+.26,34),P(frontX-.015,y-.26,34)];
  poly(pane,'#a0c8cabb','#54787e',1);
  for(const height of [20,25,30]){
   line(P(frontX-.023,y-.22,height),P(frontX-.023,y+.22,height),'#d1e1dccc',.85);
  }
  const bx=frontX-.035;
  // Cross is on the same vertical face (x constant), not camera-facing text.
  poly([P(bx,y-.035,34),P(bx,y+.035,34),P(bx,y+.035,36.8),
        P(bx,y+.18,36.8),P(bx,y+.18,39),P(bx,y-.18,39),
        P(bx,y-.18,36.8),P(bx,y-.035,36.8)],'#bf4f50','#a23c41',.6);
  const doorHandle=P(bx,y+.29,22);
  ellipse(doorHandle.x,doorHandle.y,1.8,3.2,'#d2d7cb','#647b7c');
  // Wall-backed eyewash bottles held by a small stainless shelf.
  const sx=x-.22,sy=y+.25;
  line(P(sx,sy,15),P(x+.33,sy,15),'#779ca0',2.8);
  for(let i=0;i<2;i++){
   const py=y+.05+i*.20,cap=P(x-.05,py,22);
   poly([P(x-.15,py-.07,16),P(x+.09,py-.07,16),
         P(x+.09,py+.07,21),P(x-.15,py+.07,21)],'#91c8ce','#5a939e',.6);
   ellipse(cap.x,cap.y,2.2,1.4,'#d2eee8');
  }
  // Extinguisher on a separate secure mount at the side of the cabinet.
  const ex=x-.17,ey=y-.32;
  const body=[P(ex-.12,ey-.09,5),P(ex+.11,ey-.09,5),
              P(ex+.11,ey-.09,21),P(ex-.12,ey-.09,21)];
  poly(body,'#c84340','#7f3d3b',.9);
  line(P(ex,ey-.10,22),P(ex,ey-.10,27),'#4d5b5c',2.2);
  line(P(ex-.10,ey-.11,27),P(ex+.14,ey-.11,27),'#303e43',2.3);
  line(P(ex-.04,ey-.13,14),P(ex+.08,ey-.13,14),'#f0dbc0',1.8);
 }
 // The Paint department's two-tile mixing/tinting counter is a genuine
 // floor-mounted workstation: cabinet, dispensing head, cradled can, touchscreen,
 // mixing clamp and a practical set of paint swatches.
 function paintMixingDesk(o){
  const {x,y,w,h}=o;
  shadow(x,y,w,h,1.1);
  solid(x,y,w,h,23,'#cfd7d0','#688482','#8ea19c');
  surface(x+.04,y+.04,w-.08,h-.08,24.1,'#e5e8df','#687c79');
  // Counter front: pair of closed cabinets with handles, a baseboard,
  // and color sample edging (all aligned along the real south face).
  const front=y+.505;
  for(let bay=0;bay<2;bay++){
   const left=x-.39+bay*.94,right=left+.84;
   poly([P(left,front,3),P(right,front,3),P(right,front,20),P(left,front,20)],
    bay===0?'#7e9795':'#879b98','#475e62',1);
   line(P(left+.52,front+.012,14),P(left+.66,front+.012,14),'#e9ece0',2);
  }
  line(P(x-.43,front+.01,3),P(x+w-.54,front+.01,3),'#415c5d',2);
  // Tall industrial tinted-paint dispenser, with an overhanging housing and
  // downward nozzle (not a small generic carton).
  miniBox(x+.23,y+.05,25,'#d8d9cf',.70,.65,12);
  solid(x+.27,y-.13,.46,.38,51,'#e0e2d9','#5a7778','#91aaa7');
  surface(x+.33,y-.06,.35,.22,52,'#4a686e','#58757a');
  const nozzle=P(x+.45,y+.24,38);
  line(P(x+.45,y+.19,46),P(x+.45,y+.19,33),'#52666b',3.5);
  ellipse(nozzle.x,nozzle.y,3.7,2.2,'#556e70','#c2d1ca');
  // Can nest and steel retaining brackets directly below dispenser.
  solid(x+.31,y+.28,.34,.28,25,'#697f80','#50666a','#96a7a1');
  const paint=P(x+.47,y+.43,33);
  ellipse(paint.x,paint.y,7,3.4,'#d4dbd6','#5f7577');
  poly([P(x+.31,y+.44,27),P(x+.63,y+.44,27),P(x+.63,y+.44,33),P(x+.31,y+.44,33)],
   '#d7d6ca','#738886',.9);
  line(P(x+.30,y+.45,30),P(x+.63,y+.45,30),'#b76d5d',2.8);
  // Screen and physical control buttons on the service side of the desk.
  const sx=x+1.16,sy=y+.33;
  line(P(sx,sy,24),P(sx,sy,32),'#475a5f',3);
  poly([P(sx-.31,sy,30),P(sx+.30,sy,30),P(sx+.30,sy,45),P(sx-.31,sy,45)],
   '#283e47','#152d33',2);
  poly([P(sx-.25,sy+.008,33),P(sx+.24,sy+.008,33),
        P(sx+.24,sy+.008,42),P(sx-.25,sy+.008,42)],
   '#4c8791','#8db4b2',.9);
  for(let row=0;row<2;row++)
   line(P(sx-.17,sy+.012,39-row*3),P(sx+.17,sy+.012,39-row*3),
     row?'#c6edcf':'#f3d58b',1.25);
  for(let i=0;i<3;i++){
   const dot=P(x+1.43+i*.12,y+.30,25);
   ellipse(dot.x,dot.y,2.5,1.6,['#dd755a','#81b7b7','#e6c47b'][i]);
  }
  // A proper rotating paint-can shaker with safety strap on the right end.
  solid(x+1.58,y-.11,.30,.60,29,'#7d9999','#465f65','#9caca4');
  line(P(x+1.72,y-.04,29),P(x+1.72,y-.04,42),'#4a626b',2.7);
  line(P(x+1.60,y+.40,42),P(x+1.85,y+.40,42),'#d1d9d0',3.3);
  const shaker=P(x+1.73,y+.18,31);
  ellipse(shaker.x,shaker.y,5.8,2.6,'#ccd4ce','#647776');
  // Large fan of color swatches taped to the customer-facing counter.
  for(let i=0;i<5;i++){
   const c=['#b96859','#d7b05f','#82a5a5','#6882a2','#a48eaf'][i];
   const px=x+.91+i*.12;
   const q=P(px,y-.37,24.9);
   ellipse(q.x,q.y,2.3,1.7,c);
  }
 }
 // Heavy-duty industrial duplicate-key cutter on a steel, two-tile hardware
 // workbench. Distinct grinding wheel, guard, twin key jaws, controller,
 // chip tray and organized blanks ensure it reads as a real machine.
 function keyCuttingBench(o){
  const {x,y,w,h}=o;
  shadow(x,y,w,h,1.08);
  solid(x,y,w,h,22,'#afbcb7','#51696b','#82938f');
  surface(x+.04,y+.04,w-.08,h-.08,23.6,'#d0d5cf','#6a7d7b');
  for(let k=0;k<2;k++){
   const yy=y+.506,left=x-.39+k*.95,right=left+.83;
   poly([P(left,yy,4),P(right,yy,4),P(right,yy,19),P(left,yy,19)],
    k===0?'#526d70':'#677f80','#2f4c52',.9);
   line(P(left+.31,yy+.01,12),P(left+.52,yy+.01,12),'#d4dfd7',2);
  }
  // Metal cutting-machine housing anchored to the benchtop.
  solid(x+.30,y-.14,.90,.69,30,'#465d63','#2d4149','#71878b');
  miniBox(x+.45,y-.12,31,'#8fa3a0',.57,.48,15);
  // Hardened blade spindle and enclosed rotating cutting wheel.
  const rotor=P(x+.72,y+.16,49);
  ellipse(rotor.x,rotor.y,10,10,'#9caeb2','#3f575f');
  ellipse(rotor.x,rotor.y,6.8,6.8,'#cbd3cf','#596d73');
  ellipse(rotor.x,rotor.y,2.7,2.7,'#3c5660','#dce5dc');
  // Wheel shroud / safety cover: a protective metal lip above the blade.
  line(P(x+.42,y-.09,52),P(x+1.02,y-.09,52),'#425c65',5);
  line(P(x+1.02,y-.09,52),P(x+1.05,y+.05,46),'#56727b',3);
  // Two vise clamps hold the customer key and duplicate blank side by side.
  for(let i=0;i<2;i++){
   const cx=x+.40+i*.34,cy=y+.40;
   solid(cx,cy,.23,.21,29,'#4f6970','#344f56','#6d8587');
   line(P(cx+.02,cy+.08,31),P(cx+.26,cy+.08,31),'#c4d1c7',2.5);
   line(P(cx+.16,cy+.08,31),P(cx+.35,cy+.08,31),'#d4b477',1.7);
   const knob=P(cx+.19,cy+.11,32);
   ellipse(knob.x,knob.y,2.2,1.7,'#e9ddbf','#546b71');
  }
  // Control station with glowing buttons and warning-colored stop switch.
  miniBox(x+1.36,y+.10,27,'#d1d6cf',.47,.53,11);
  poly([P(x+1.44,y+.39,32),P(x+1.79,y+.39,32),
        P(x+1.79,y+.39,40),P(x+1.44,y+.39,40)],
   '#274754','#193339',1.2);
  line(P(x+1.51,y+.40,37),P(x+1.68,y+.40,37),'#a8dcba',1.4);
  for(let j=0;j<3;j++){
   const p=P(x+1.42+j*.15,y+.50,30);
   ellipse(p.x,p.y,2.3,1.6,['#bb4c49','#dfba58','#8eafab'][j]);
  }
  // Key blanks organized on rear rack, with an open nickel tray and spare
  // brass keys resting on the real horizontal bench surface.
  line(P(x+1.15,y-.30,30),P(x+1.15,y-.30,44),'#687f82',2);
  line(P(x+1.08,y-.31,43),P(x+1.67,y-.31,43),'#a7b8b1',3);
  for(let i=0;i<4;i++){
   const kx=x+1.16+i*.15;
   line(P(kx,y-.32,41),P(kx,y-.32,35-i%2*3),'#dbc896',1.7);
   const key=P(kx,y-.32,40);
   ellipse(key.x,key.y,1.8,1.5,'#f0dda1','#71817c');
  }
  surface(x+1.06,y+.12,.28,.28,24.6,'#667f83','#3a535c');
  for(let i=0;i<3;i++){
   const p=P(x+1.16+i*.07,y+.25,26);
   ellipse(p.x,p.y,1.6,1.1,'#d0ba84');
  }
 }
 // Industrial wire-cutting and stripping station, fixed to a two-tile
 // work counter, with guarded cutting jaws, paired feed rollers and a
 // measurement rail. Artwork stays in the world plane, not camera-facing.
 function wireCuttingStation(o){
  const {x,y,w,h}=o;
  shadow(x,y,w,h,1.08);
  solid(x,y,w,h,22,'#b9c5bf','#556a6c','#819593');
  surface(x+.06,y+.06,w-.12,h-.12,23,'#d5dad2','#546c70');
  // Lockable bench-front panels and sturdy steel foot rail.
  for(let i=0;i<2;i++){
   const px=x-.40+i*.95;
   poly([P(px,y+.51,5),P(px+.82,y+.51,5),
     P(px+.82,y+.51,19),P(px,y+.51,19)],'#627d80','#385358',1);
   line(P(px+.28,y+.52,13),P(px+.51,y+.52,13),'#e3e8dc',2);
  }
  line(P(x-.42,y+.52,3),P(x+1.43,y+.52,3),'#465d62',2.3);
  // A solid cutting-machine housing and transparent guards.
  solid(x+.35,y-.12,.89,.65,30,'#506e76','#304d58','#829b9b');
  miniBox(x+.49,y-.13,31,'#9db0ad',.56,.46,13);
  const cutter=P(x+.75,y+.08,46);
  ellipse(cutter.x,cutter.y,10,8,'#a0b1b0','#395560');
  ellipse(cutter.x,cutter.y,5,4,'#e1ded1','#607477');
  // Two opposed hardened blades with a safety shield.
  poly([P(x+.63,y+.30,32),P(x+.83,y+.30,32),
    P(x+.90,y+.30,42),P(x+.67,y+.30,42)],'#667b82','#2c4c55',1.2);
  line(P(x+.62,y+.30,39),P(x+.92,y+.30,36),'#d3dfda',3.1);
  line(P(x+.62,y+.30,36),P(x+.92,y+.30,39),'#d3dfda',3.1);
  // Feed rollers and a straight feed guide, including a visible copper wire.
  for(const i of [0,1]){
   const p=P(x+.36+i*.47,y+.42,30);
   ellipse(p.x,p.y,5,4,'#99b4b6','#405b62');
   ellipse(p.x,p.y,2.3,2,'#536c73');
  }
  line(P(x+.10,y+.43,32),P(x+1.13,y+.43,32),'#cc985e',2.5);
  line(P(x+.10,y+.44,33),P(x+1.13,y+.44,33),'#f4d1a1',.9);
  // Adjustable stop and measuring marks on the cutter's front rail.
  line(P(x+.16,y+.49,25),P(x+1.23,y+.49,25),'#405e64',2.6);
  for(let i=0;i<8;i++){
   const dx=x+.18+i*.14;
   line(P(dx,y+.50,25),P(dx,y+.50,27+(i%2)),'#dce3dc',.85);
  }
  // An angled operator control with emergency stop and status LEDs.
  miniBox(x+1.37,y+.15,25,'#cad6d1',.42,.53,12);
  poly([P(x+1.48,y+.40,32),P(x+1.78,y+.40,32),
    P(x+1.78,y+.40,39),P(x+1.48,y+.40,39)],'#294b56','#1e323a',1.3);
  line(P(x+1.53,y+.41,36),P(x+1.72,y+.41,36),'#9ce1cc',1.4);
  for(let i=0;i<3;i++){
   const p=P(x+1.45+i*.15,y+.50,28);
   ellipse(p.x,p.y,2.6,1.8,['#ba4f4a','#d5b15c','#83c0b4'][i]);
  }
  // Copper wire spool and tray of short cut lengths on the right end.
  const spool=P(x+1.61,y-.19,31);
  ellipse(spool.x,spool.y,8,5,'#c08b5a','#6f6458');
  ellipse(spool.x,spool.y,4,2.7,'#536a70','#e3c69d');
  surface(x+1.34,y-.24,.46,.20,24.5,'#607b80','#39585e');
  for(let i=0;i<4;i++)
   line(P(x+1.40,y-.22+i*.04,26),P(x+1.72,y-.22+i*.04,26),'#d7a675',1.25);
 }
 function drawItem(id,x,y,z=5,scale=1){
  const p=P(x,y,z),s=Z()*scale,at=(dx,dy)=>({x:p.x+dx*s,y:p.y+dy*s});
  const stroke=(v1,v2,c,w=2)=>line(at(...v1),at(...v2),c,w*scale);
  if(id==='hammer'){
   stroke([-7,4],[4,-5],'#916541',2.8);
   poly([at(0,-9),at(7,-13),at(11,-7),at(4,-3)],'#87969a','#39484c',.8)
  }else if(id==='wrench'){
   stroke([-6,4],[5,-7],'#a3b4ba',3);
   ctx.beginPath();ctx.arc(p.x+7*s,p.y-8*s,3.4*s,-.5,2.4);ctx.strokeStyle='#b8c6ca';ctx.lineWidth=2.1*s;ctx.stroke()
  }else if(id==='broom'){
   stroke([-8,5],[8,-9],'#bd9a61',2);
   poly([at(-10,2),at(-5,-2),at(0,2),at(-6,7)],'#c5b37c','#7f704e',.8);
   for(let i=0;i<4;i++)stroke([-9+i*2.2,3],[-7+i*2,8],'#94774e',.7)
  }else if(id==='flashlight'){
   stroke([-8,4],[3,-3],'#4b5962',5);
   poly([at(2,-5),at(7,-8),at(10,-3),at(4,0)],'#b5c6c5','#596b71',.8);
   ellipse(p.x+8*s,p.y-6*s,2.5*scale,2*scale,'#f2dfac')
  }else if(id==='paint'){
   ellipse(p.x,p.y+2*s,6*scale,2.6*scale,'#5a777d');
   ctx.fillStyle='#b65f4d';ctx.fillRect(p.x-6*s,p.y-6*s,12*s,8*s);
   ellipse(p.x,p.y-6*s,6*scale,3*scale,'#e5e1d4','#596666');
   ctx.fillStyle='#f3d59a';ctx.fillRect(p.x-2*s,p.y-3*s,4*s,4*s)
  }else if(id==='bandage'){
   poly([at(-7,1),at(-2,-5),at(8,-1),at(2,5)],'#f7eee3','#b6b4a5',.7);
   poly([at(-1,-3),at(3,-2),at(2,3),at(-2,2)],'#d7a48b');
   ellipse(p.x,p.y,1.4*scale,1.2*scale,'#f7e8d0')
  }else if(id==='water'){
   poly([at(-3,4),at(-4,-6),at(-2,-9),at(2,-9),at(4,-6),at(3,4)],'#82bec6','#cbdedf',.8);
   poly([at(-3,-4),at(3,-4),at(3,1),at(-3,1)],'#e1f1e7b8');
   line(at(-2,-10),at(2,-10),'#467e97',2)
  }else if(id==='phone'){
   poly([at(-5,4),at(-4,-8),at(5,-8),at(5,4)],'#293942','#9aaeb1',.8);
   poly([at(-3,-6),at(3,-6),at(3,0),at(-3,0)],'#4b9aad');
   ellipse(p.x,p.y+2*s,1*scale,1*scale,'#becfd1')
  }else if(id==='gloves'){
   for(let i=0;i<2;i++){
    const shift=i*8-4;
    poly([at(shift-3,5),at(shift-4,-2),at(shift-1,-7),at(shift+1,-3),at(shift+3,-7),at(shift+5,-1),at(shift+3,5)],'#d2aa71','#725e44',.6)
   }
  }else{ellipse(p.x,p.y,4*scale,3*scale,'#c8a273','#3a464a')}
 }
 function drawFixture(o){
  const {x,y,w,h,type}=o;shadow(x,y,w,h,1.1);
  if(type==='shelf'){rack(x,y,w,h,o.department,o.stock,o.capacity||12);return}
  if(type==='pallet'){
   // Flat, EMPTY shipping pallet: separated top deck boards, visible gaps,
   // longitudinal runners and spacer blocks. No boxes or stock on top.
   shadow(x,y,w,h,.96);
   for(const yy of [y-.32,y+.02,y+.34])solid(x+.08,yy,w-.16,.12,3.5,'#806043','#60452f','#916e4e');
   for(const xx of [x+.15,x+w-.75])for(const yy of [y-.27,y+.27])
    solid(xx,yy,.24,.16,6.5,'#b38b60','#805e42','#9c734f');
   for(let i=0;i<6;i++){
    const yy=y-.41+i*.15;
    solid(x+.04,yy,w-.08,.11,9,'#cda579','#886445','#b68d63');
    line(P(x+.08,yy+.055,9.2),P(x+w-.56,yy+.055,9.2),'#a47a53',.85);
   }
   return;
  }
  if(type==='checkout'){checkout(o);return}
  if(type==='serviceDesk'){
   serviceDesk(o);
  }else if(type==='paintMixer'){
   paintMixingDesk(o);
  }else if(type==='keyCutter'){
   keyCuttingBench(o);
  }else if(type==='wireCutter'){
   wireCuttingStation(o);
  }else if(type==='saw'){
   // A recognizably industrial two-tile table saw: bright orange elevated
   // overhead blade guard, cast-iron top, cut lumber and freestanding legs.
   shadow(x,y,w,h,1.16);
   for(const xx of [x-.38,x+1.38])for(const yy of [y-.34,y+.32]){
    line(P(xx,yy,2),P(xx,yy,27),'#3c505b',5.5);
    const foot=P(xx,yy,2);ellipse(foot.x,foot.y,4.5,2.2,'#253e49');
   }
   solid(x,y,w,h,17,'#3d5a68','#243b46','#657b80');
   solid(x+.02,y+.03,w-.04,h-.06,28,'#b3c4c2','#3d585e','#7c9695');
   surface(x+.06,y+.06,w-.12,h-.12,29,'#d0ddda','#5f7677');
   // Bright orange safety-shrouded cutting unit raised prominently above bed.
   solid(x+.70,y+.13,.66,.68,55,'#e6a742','#a35b30','#c77d36');
   surface(x+.74,y+.17,.58,.50,56,'#f7c466','#8b4f29');
   const blade=P(x+1.05,y+.58,52);
   ellipse(blade.x,blade.y,16,15,'#394c55','#edc36b');
   ellipse(blade.x,blade.y,11.5,11,'#dde7df','#516b73');
   ellipse(blade.x,blade.y,3.5,3.5,'#415e68','#ceddd8');
   // Enclosing orange blade crown is tall and unmistakable at game zoom.
   poly([P(x+.75,y+.18,58),P(x+1.32,y+.18,58),
     P(x+1.36,y+.49,61),P(x+.71,y+.49,61)],'#ee933c','#754a35',2.1);
   line(P(x+.75,y+.18,58),P(x+.75,y+.18,33),'#b87b3e',4.5);
   // Long unmistakable rip fence and two timber planks staged across table.
   line(P(x-.43,y-.25,32),P(x+1.44,y-.25,32),'#273f4e',6);
   line(P(x-.43,y-.27,34),P(x+1.44,y-.27,34),'#e6e9dd',2.7);
   for(let i=0;i<2;i++){
    const yy=y+.18+i*.18;
    surface(x+.09,yy,1.73,.12,31+i*.8,i?'#c49b68':'#dcbb87','#936d48');
    line(P(x+.15,yy+.06,32),P(x+1.65,yy+.06,32),'#a77c51',.85);
   }
   // Larger safety-stop panel on the cabinet face.
   poly([P(x+1.48,y+.51,13),P(x+1.80,y+.51,13),
     P(x+1.80,y+.51,27),P(x+1.48,y+.51,27)],'#e6ad4c','#7b5335',1.5);
   const off=P(x+1.63,y+.53,21);
   ellipse(off.x,off.y,5.5,5,'#c23f36','#f6d7a5');
   line(P(x+1.54,y+.53,17),P(x+1.74,y+.53,17),'#f6dfba',1.5);
   // Separate push stick and timber supports remain inside actual footprint.
   line(P(x+.13,y-.30,35),P(x+.45,y-.10,35),'#d8a76c',4);
   line(P(x-.34,y+.36,11),P(x+1.35,y+.36,11),'#536f72',4);
  }else if(type==='gardenToolsRack'){
   // Wall-mounted, two-tile garden hardware rail. Every shaft, hook,
   // shovel blade and rake tine shares the store's Y-oriented wall plane.
   // No crates, boxes or bags: customers see hanging tools from the aisle.
   const back=x+.39,toolX=x+.13,left=y-.46,right=y+1.46;
   poly([P(back,left,9),P(back,right,9),P(back,right,54),P(back,left,54)],
    '#627768','#354a47',1.2);
   for(const z of [12,34,51]){
    line(P(back-.005,left,z),P(back-.005,right,z),'#9b7854',4.8);
    line(P(back-.03,left,z+1.3),P(back-.03,right,z+1.3),'#d3b18a',1.15);
   }
   for(const yy of [left,right])line(P(back,yy,8),P(back,yy,54),'#465957',4.2);
   for(let i=0;i<6;i++){
    const yy=y-.25+i*.31,shovel=i%2===0,metal=shovel?'#82989b':'#9cafb1';
    // Matching metal wall pegs support each real hanging garden implement.
    line(P(back,yy,46),P(toolX,yy,46),'#d0d8cc',2.9);
    line(P(toolX,yy,47),P(toolX,yy,44),'#c2c6b8',2.3);
    if(o.toolSet==='hoesLoppers'){
     if(i%2===0){
      // Hoe: long single wooden shaft, perpendicular steel hoe blade and
      // bent socket near its lower end, all flat against the wall plane.
      line(P(toolX,yy,17),P(toolX,yy,45),'#a77647',4.4);
      line(P(toolX-.014,yy,19),P(toolX-.014,yy,42),'#d9b07d',1.4);
      line(P(toolX,yy,17),P(toolX-.07,yy,12.2),'#707f84',3.1);
      poly([P(toolX-.075,yy-.125,13),P(toolX-.075,yy+.125,13),
       P(toolX-.095,yy+.125,8.6),P(toolX-.095,yy-.125,8.6)],
       '#899ba0','#475a5c',1);
      line(P(toolX-.105,yy-.116,10),P(toolX-.105,yy+.116,10),
       '#c1ccca',1);
      const grip=P(toolX,yy,45);
      ellipse(grip.x,grip.y,2.2,1.5,'#5f7049','#344637');
     }else{
      // Loppers: two long separated handles and rubber grip tips meet
      // at a single visible pivot under opposing steel cutting jaws.
      line(P(toolX,yy,37),P(toolX-.03,yy-.095,15),'#9c7552',4);
      line(P(toolX,yy,37),P(toolX-.03,yy+.095,15),'#b99162',4);
      line(P(toolX-.03,yy-.095,15),P(toolX-.03,yy-.126,7),
       '#d48838',4.8);
      line(P(toolX-.03,yy+.095,15),P(toolX-.03,yy+.126,7),
       '#d48838',4.8);
      line(P(toolX,yy,37),P(toolX-.045,yy-.075,48),
       '#80969a',3.5);
      line(P(toolX,yy,37),P(toolX-.045,yy+.085,47),
       '#bac6c3',3.5);
      poly([P(toolX-.05,yy-.076,48),P(toolX-.05,yy+.01,44),
       P(toolX-.05,yy+.03,41),P(toolX-.05,yy-.026,44)],
       '#c9d2ce','#53696b',1);
      const pivot=P(toolX,yy,37);
      ellipse(pivot.x,pivot.y,3.3,2.9,'#c9c6a2','#405557');
     }
     continue;
    }
    line(P(toolX,yy,17),P(toolX,yy,43),'#a77647',4.2);
    line(P(toolX-.016,yy,18),P(toolX-.016,yy,42),'#d4ae74',1.3);
    // D-grips on the shovels, plain capped handles on the rakes.
    if(shovel){
     line(P(toolX,yy,43),P(toolX,yy,48),'#5b493a',2.5);
     const handleTop=P(toolX,yy,48);
     ellipse(handleTop.x,handleTop.y,2.5,3.4,'#b88b59','#594938');
     // Spade follows the vertical wall rather than a camera-facing icon.
     poly([P(toolX-.03,yy-.10,15),P(toolX-.03,yy+.10,15),
      P(toolX-.03,yy+.105,9),P(toolX-.03,yy,4.5),
      P(toolX-.03,yy-.105,9)],metal,'#425b5d',1.25);
     line(P(toolX-.045,yy,14),P(toolX-.045,yy,6),'#d6e1db',1);
    }else{
     const baseZ=16;
     line(P(toolX-.025,yy-.14,baseZ),P(toolX-.025,yy+.14,baseZ),
      '#71868c',5.3);
     for(let t=-2;t<=2;t++){
      const ty=yy+t*.061;
      line(P(toolX-.035,ty,baseZ),P(toolX-.035,ty,7.5),metal,1.8);
     }
     const top=P(toolX,yy,44);
     ellipse(top.x,top.y,2,1.45,'#394c47');
    }
   }
  }else if(type==='ridingMower'){
   // Two-tile ride-on lawn tractor parked with its FRONT / hood toward
   // the shop interior (negative X), away from the garden sliding doors.
   // Draw far tires, the cohesive deck/chassis, then near tires so all
   // four wheels connect to the machine rather than floating beside it.
   const tire=(xx,yy,r)=>{
    const p=P(xx,yy,8);
    ellipse(p.x,p.y,r,r*1.12,'#202a2b','#131b20');
    ellipse(p.x,p.y,r*.51,r*.55,'#a0a9a1','#414d4d');
    ellipse(p.x,p.y,r*.20,r*.22,'#4b5552');
    for(let t=0;t<7;t++){
     const a=t*Math.PI*2/7;
     const v={x:p.x+Math.cos(a)*r*.82*Z(),y:p.y+Math.sin(a)*r*.93*Z()};
     ellipse(v.x,v.y,1.05,1.1,'#3e4948');
    }
   };
   for(const [xx,r] of [[x+.18,5.5],[x+1.44,8]])
    tire(xx,y-.32,r);
   // Low yellow-topped cutting deck reaches both sides of the tractor.
   solid(x+.29,y+.04,1.05,.9,7,'#c9a44c','#79602c','#a78a37');
   surface(x+.29,y+.04,1.05,.9,8,'#d9bd60','#846a35');
   for(const xx of [x+.54,x+1.02]){
    const p=P(xx,y+.13,9);
    ellipse(p.x,p.y,7,3,'#a78438','#d9c16f');
   }
   // Real tractor proportions: front grille, formed rear fenders, exposed
   // mower deck spindle housings, footwell and black rubber tires.
   // West-facing longitudinal frame; engine hood at the west/front end,
   // driver seat and rear axle at the east/rear end.
   solid(x+.39,y+.04,1.29,.75,12,'#4b7338','#2b482e','#5b7c3f');
   solid(x+.03,y+.08,.83,.68,25,'#8ebc50','#527e33','#739e43');
   surface(x+.10,y+.13,.65,.55,27,'#a5d16c','#527b3f');
   for(const yy of [y+.22,y+.43]){
    line(P(x-.36,yy,19),P(x-.36,yy+.13,19),'#354e40',2.7);
    const lamp=P(x-.375,yy+.06,23);
    ellipse(lamp.x,lamp.y,2.7,2.1,'#f1e7b2','#59644a');
   }
   // Engine ventilation grills are on the inward-facing long hood.
   for(let i=0;i<4;i++){
    const xx=x+.13+i*.13;
    line(P(xx,y-.23,24),P(xx+.065,y-.23,24),'#4c7344',2.2);
   }
   // Rear axle fenders wrap around the drive wheels.
   for(const yy of [y-.27,y+.29]){
    solid(x+1.17,yy,.49,.22,19,'#79a947','#436b34','#5b8a3b');
    line(P(x+1.18,yy,19),P(x+1.59,yy,19),'#d2e2ad',1.2);
   }
   // Open textured rubber foot platform between engine and seat.
   surface(x+.80,y+.04,.38,.72,15,'#313d3b','#172729');
   for(let i=0;i<4;i++)line(P(x+.86+i*.07,y-.20,16),P(x+.86+i*.07,y+.17,16),'#768079',.8);
   // Steering column rises in front of the padded operator's seat.
   line(P(x+.92,y+.12,13),P(x+.95,y+.12,32),'#374b49',3.9);
   const steer=P(x+.95,y+.12,34);
   ellipse(steer.x,steer.y,9,3.9,'#28383b','#697b79');
   line(P(x+.82,y+.12,34),P(x+1.07,y+.12,34),'#5c706e',1.2);
   // Raised single driver's seat with visible backrest and arm-length gap.
   solid(x+1.18,y+.09,.38,.43,27,'#353e3c','#222e2e','#4c5550');
   poly([P(x+1.50,y-.115,24),P(x+1.50,y+.26,24),
    P(x+1.50,y+.26,45),P(x+1.50,y-.115,45)],
    '#323b39','#1e2b2c',1.6);
   surface(x+1.19,y+.10,.34,.39,28,'#505b52','#2a3838');
   // Protective rear mudguards sit above the rear drive wheels.
   for(const yy of [y-.30,y+.31]){
    line(P(x+1.44,yy,17),P(x+1.63,yy,17),'#7ba447',5);
   }
   // Contrasting nose grille and twin headlamp bezels make the hood read
   // as a real front-facing engine compartment rather than a green box.
   poly([P(x-.405,y-.19,13),P(x-.405,y+.21,13),
    P(x-.405,y+.21,23),P(x-.405,y-.19,23)],'#324941','#1f3433',1.2);
   for(let i=0;i<5;i++){
    const yy=y-.13+i*.069;
    line(P(x-.415,yy,14),P(x-.415,yy,21),'#a3b0a5',.9);
   }
   // Deck discharge chute leads toward the store-facing lateral side.
   solid(x+.64,y+.34,.53,.19,6,'#8b9d4a','#465f38','#6a8240');
   line(P(x+.66,y+.43,7),P(x+1.12,y+.43,7),'#d7c86d',1.3);
   // The two near-side wheels show the mower's real wheelbase.
   for(const [xx,r] of [[x+.18,5.5],[x+1.44,8]])
    tire(xx,y+.37,r);
   const exhaust=P(x+.57,y-.18,30);
   ellipse(exhaust.x,exhaust.y,2.5,2,'#37484a','#738785');
  }else if(type==='pallet'||type==='bagPallet'){
   solid(x,y,w,h,5,'#b79566','#8a6545','#a47e58');
   for(let i=0;i<6;i++)miniBox(x+.08+i%3*.56,y+.12+Math.floor(i/3)*.36,13+i%2*5,
     type==='bagPallet'?'#d8cab1':['#a9936b','#b7a383','#989b89'][i%3],.48,.32,10);
  }else if(type==='workbench'||type==='office'){
   solid(x,y,w,h,19,'#b9946b','#776049','#8f7255');
   if(type==='office'){miniBox(x+.07,y+.3,26,'#465860',.45,.3,8);miniBox(x+.57,y+.3,23,'#d7d7ca',.24,.28,2)}
   else{for(let i=0;i<4;i++)drawItem(['hammer','wrench','flashlight','gloves'][i],x+.3+i*.37,y+.4,24)}
  }else if(type==='lockers'){
   solid(x,y,w,h,48,'#91a5ac','#667b80','#81979a');
   // Tall double-bank doors follow the cabinet plane, not the camera.
   for(let i=0;i<4;i++){
    // The bank spans two X tiles, so put four full door fronts on the
    // long accessible aisle face rather than its narrow end.
    const frontY=y-.49,slot=x-.39+(i+.5)*(w-.20)/4,half=(w-.24)/8;
    const a=P(slot-half,frontY,6),b=P(slot+half,frontY,6),
     c=P(slot+half,frontY,43),d=P(slot-half,frontY,43);
    poly([a,b,c,d],i%2?'#748b90':'#8da4a9','#4d676a',1);
    line(P(slot+half*.55,frontY,22),P(slot+half*.55,frontY,28),'#e0ebe5',1.6);
   }
  }else if(type==='vending'||type==='drinkCooler'){
   solid(x,y,w,h,49,type==='vending'?'#ad5445':'#d2dad6','#56686d','#859395');
   const panel=cabinetFace(o,48);
   poly(panel,'#345861bb','#bed4d0',1.2);
   // Display shelves read along the vertical wall-mounted plane.
   for(let row=0;row<4;row++){
    const front=o.facing==='west';
    const a=front?P(x-.5,y-.32,10+row*8):P(x-.32,y-.5,10+row*8);
    const b=front?P(x-.5,y+.32,10+row*8):P(x+.32,y-.5,10+row*8);
    line(a,b,'#bbd7d6',1.1);
    for(let col=0;col<3;col++){
     const q=front?P(x-.51,y-.23+col*.23,13+row*8):P(x-.23+col*.23,y-.51,13+row*8);
     ellipse(q.x,q.y,2.5,4,row%2?'#d9bd74':'#a8d3cf');
    }
   }
  }else if(type==='table'){
   solid(x,y,w,h,17,'#aa8968','#6b5949');for(let i=0;i<2;i++)miniCan(x+.4+i*.8,y+.4,21,'#d5d8cb',3);
   for(let i=0;i<2;i++)solid(x+i*1.3,y+.42,.44,.34,10,'#5b6e71')
  }else if(type==='sink'){
   solid(x,y,w,h,27,'#c9d0c8','#8c9a95');const p=P(x+.5,y+.4,29);ellipse(p.x,p.y,10,5,'#8ca7a9','#e4eee8');
   line(P(x+.47,y+.32,34),P(x+.47,y+.32,44),'#bfcac8',2);line(P(x+.47,y+.32,44),P(x+.57,y+.43,44),'#bcc8c7',2)
  }else if(type==='restroom'){
   solid(x,y,1,1,11,'#e9e7db','#b7bdb8');ellipse(P(x+.45,y+.5,15).x,P(x+.45,y+.5,15).y,9,5,'#ecefe9','#819a9b');
   solid(x+.1,y+.7,.8,.2,25,'#ecf0e9')
  }else if(type==='plants'||type==='gardenDesk'){
   solid(x,y,w,h,type==='plants'?9:19,type==='plants'?'#a38b68':'#829784','#615c48');
   plants(x+.17,y+.18,type==='plants'?13:23,Math.min(9,Math.round(w*h*2)+2))
  }else if(type==='endcap'){
   o.facing==='west'?westWallDisplay(o):endcapDisplay(o);
  }else if(type==='hardwareBins'){
   o.facing==='west'?westWallDisplay(o):endcapDisplay({...o,department:'HARDWARE'});
  }else if(type==='bucketStack'){
   paintBucketStack(o);
  }else if(type==='lumberBundle'){
   // Several courses of individually drawn milled boards. Each bundle's real
   // tile width controls its length; colored straps bind the full stack.
   shadow(x,y,w,h,1.1);
   solid(x,y,w,h,5,'#876646','#5d4939','#997654');
   const courses=o.bundleSize==='long'?4:o.bundleSize==='medium'?3:2;
   for(let layer=0;layer<courses;layer++){
    const z=7+layer*6;
    for(let board=0;board<3;board++){
     const yy=y-.36+board*.26;
     solid(x+.06,yy,w-.12,.21,5+z,
      ['#d3ab75','#bf9564','#dfbc85'][(layer+board)%3],
      '#846448','#b58d60');
     // End grain outlines distinguish stacked lumber from boxes.
     const tip=P(x+w-.56,yy+.10,z+5);
     line({x:tip.x-3*Z(),y:tip.y-2*Z()},
       {x:tip.x+3*Z(),y:tip.y+2*Z()},'#9d764e',.85);
    }
   }
   for(const dx of [.34,w-.70]){
    poly([P(x+dx,y-.47,9),P(x+dx+.12,y-.47,9),
      P(x+dx+.12,y-.47,13+courses*6),P(x+dx,y-.47,13+courses*6)],
      '#374e57','#233c43',1);
    line(P(x+dx,y-.47,13+courses*6),
         P(x+dx,y+.43,13+courses*6),'#415e64',3);
   }
   // Lift-truck timber skids keep each pack visibly grounded.
   for(const dx of [.22,w-.75])solid(x+dx,y+.02,.30,.78,5,'#77543a','#554333','#87654a');
  }else if(type==='lumberRack'){
   // Exposed south-facing horizontal bays, oriented across the long edge
   // toward customers (previous rack looked like a solid pile of blocks).
   shadow(x,y,w,h,1.1);
   const aisleFace=y+.52;
   for(const xx of [x-.42,x+.44,x+w-.55]){
    line(P(xx,aisleFace,3),P(xx,aisleFace,52),'#53646a',4.5);
    line(P(xx,y-.36,3),P(xx,y-.36,52),'#475d63',3);
   }
   for(const z of [11,25,39]){
    surface(x+.05,y-.30,w-.10,.75,z,'#667b7a','#395259');
    line(P(x-.42,aisleFace,z),P(x+w-.53,aisleFace,z),'#d5d9d0',3.4);
    for(let plank=0;plank<3;plank++){
     const yy=y-.24+plank*.23;
     solid(x+.10,yy,w-.20,.17,z+3,
      ['#cfa36d','#ddb681','#b88b59'][plank],'#9b744f','#b48b62');
     line(P(x+.13,yy+.08,z+3),P(x+w-.64,yy+.08,z+3),'#9a754d',.8);
    }
   }
   // Aisle-visible orange rack-end warning strip.
   line(P(x-.43,aisleFace,48),P(x+w-.53,aisleFace,48),'#d8a049',4);
  }else if(type==='toolCabinet'){
   solid(x,y,w,h,33,'#a34438','#733c37','#974a3e');
   for(let i=0;i<3;i++)line(P(x+.13,y+.1+i*.26,22),P(x+1.75,y+.1+i*.26,22),'#d0cbb4',1.5)

  }else if(type==='safetyStation'){
   safetyStation(o);
  }else if(type==='utilityCart'){
   utilityServiceCart(o);
  }else if(type==='palletStack'||type==='boxStack'){
   // Stacked shipping loads sit square on timber skids; no floating boxes.
   const pallet=type==='palletStack';
   solid(x,y,w,h,pallet?6:3,'#b98f5c','#7b593d','#96714b');
   const cols=w>1?3:2,rows=pallet?2:3;
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const px=x-.39+col*(w-.22)/cols,py=y-.26+(row%2)*.10;
    const hBox=pallet?10:12;
    miniBox(px,py,8+row*hBox,['#c4a77d','#b5956d','#9f927a'][col%3],
     (w-.18)/cols-.04,.42,hBox-1);
   }
   const p=P(x+(w-1)/2,y,25);
   line({x:p.x-9*Z(),y:p.y},{x:p.x+9*Z(),y:p.y},'#866744',1);
  }else if(type==='receivingDesk'){
   solid(x,y,w,h,22,'#b2aa92','#6e746f','#91988e');
   surface(x+.07,y+.08,w-.14,h-.16,23,'#ddd0b2','#8b8c7a');
   miniBox(x-.29,y-.15,24,'#c9d2ca',.4,.30,2);
   for(let i=0;i<4;i++)line(P(x+.2+i*.17,y-.23,26),P(x+.2+i*.17,y+.10,26),'#586a6d',.8);
   const p=P(x+1.05,y-.15,33);ellipse(p.x,p.y,4,3,'#384f5a');
  }else if(type==='handTruck'){
   // Hand dolly depth order: far tire and rear rail first, platform and
   // braces next, and near tire / near rail last. No wheel crosses a rail.
   shadow(x,y,1,1,.75);
   const rear=y-.25,front=y+.24,side=x+.34;
   const rearWheel=P(x+.35,rear,5);
   ellipse(rearWheel.x,rearWheel.y,7.5,7.5,'#253138','#73858a');
   ellipse(rearWheel.x,rearWheel.y,3.2,3.2,'#bfcbca');
   // Rear-facing structural rail is occluded by platform and nearer details.
   // Tall rear upright painted ON TOP of its tire, including the axle area.
   line(P(side,rear,13),P(side,rear,56),'#506b75',5.5);
   line(P(side,rear,56),P(side,front,56),'#c8d4cf',4.7);
   line(P(side,rear,42),P(side,front,42),'#8ba2a5',3.4);
   line(P(side,rear,25),P(side,front,25),'#8ba2a5',3.4);
   line(P(side,rear,10),P(side,front,10),'#83999d',3);
   // Low loading lip projects forward and is visibly grounded.
   surface(x-.31,y-.14,.55,.42,5,'#a8b9b8','#526a72');
   line(P(x-.34,y+.28,5),P(x+.22,y+.28,5),'#d0dcd6',4);
   // Front wheel sits offset from the near rail, behind its bottom section.
   const frontWheel=P(x+.35,front,5);
   ellipse(frontWheel.x,frontWheel.y,7.5,7.5,'#253138','#73858a');
   ellipse(frontWheel.x,frontWheel.y,3.2,3.2,'#bfcbca');
   // The opposite (front / other) tire must be covered by its full upright.
   line(P(side,front,3),P(side,front,56),'#607e87',5.5);
   // Axle is confined to the underside, not drawn through the handle.
   line(P(x+.30,rear,5),P(x+.30,front,5),'#60747b',2);
  }else if(type==='forklift'){
   // Painter-ordered industrial forklift. Far wheels and back safety posts
   // first, then body/seat, near wheels, overhead guard and forward mast.
   shadow(x,y,w,h,1.12);
   // Passenger-side wheels are fully hidden; only the two driver-side
   // tires on the near Y face are exposed.
   const axleX=[x+.84,x+1.47],driverY=y+.36;
   // Chassis and orange body exactly occupy the cab support footprint.
   const cabLeft=x+.75,cabRight=x+1.57,cabRear=y-.24,cabFront=y+.24;
   solid(x+.68,y-.25,1.02,.72,18,'#da9538','#84532d','#b77730');
   solid(x+1.03,y-.18,.62,.59,26,'#e9b34c','#916233','#d8953f');
   surface(x+1.08,y-.16,.51,.48,27,'#c98a3d','#865a32');
   solid(x+1.05,y-.10,.28,.29,33,'#34454c','#24343b','#5c7074');
   line(P(x+.94,y+.12,28),P(x+.90,y+.12,41),'#60747c',3);
   const steering=P(x+.90,y+.12,41);
   ellipse(steering.x,steering.y,6,4,'#293941','#acbab6');
   // Engine counterweight and ventilation at the rear of the lift.
   solid(x+1.38,y-.17,.25,.54,28,'#c17c32','#764826','#e8a84d');
   for(let i=0;i<4;i++)line(P(x+1.59,y-.10+i*.10,21),
    P(x+1.59,y-.10+i*.10,25),'#414a47',2.2);
   // Driver footwell, pedals and seated operator controls.
   surface(x+.87,y+.10,.25,.30,21,'#344345','#6a7470');
   for(const xx of [x+.92,x+1.04]){
    line(P(xx,y+.29,22),P(xx+.025,y+.29,25),'#b4bab0',2);
   }
   // Exactly two visible driver-side tires, mounted below the chassis.
   for(const xx of axleX){
    const p=P(xx,driverY,6);
    ellipse(p.x,p.y,10,9,'#253138','#61767b');
    ellipse(p.x,p.y,4,3.5,'#b8c6c2');
    ellipse(p.x,p.y,1.6,1.45,'#657474');
    for(let t=0;t<6;t++){
     const a=t*Math.PI/3;
     ellipse(p.x+Math.cos(a)*7.5*Z(),p.y+Math.sin(a)*6.6*Z(),1.6,1.3,'#374448');
    }
   }
   // All four cage legs START on the forklift body surface at Z=18.
   // Roof corners use precisely the same XY points as their feet.
   for(const xx of [cabLeft,cabRight]){
    for(const yy of [cabRear,cabFront]){
     line(P(xx,yy,18),P(xx,yy,62),'#435b65',5);
     const mount=P(xx,yy,18);
     ellipse(mount.x,mount.y,3.2,2.3,'#63767c');
    }
   }
   surface(cabLeft,cabRear,cabRight-cabLeft,cabFront-cabRear,62,
    '#364e56','#6d8284');
   // Cab roof has visible perimeter lips, brackets and a rear grab handle.
   for(const yy of [cabRear,cabFront])
    line(P(cabLeft,yy,63),P(cabRight,yy,63),'#839698',2.3);
   line(P(cabRight,y-.26,43),P(cabRight+.12,y-.26,43),'#829296',2);
   // The forward mast stays in the foreground and tines emerge at its base.
   for(const yy of [y-.26,y+.28])
    line(P(x+.29,yy,7),P(x+.29,yy,78),'#2c434d',6.8);
   for(const z of [19,43,76])
    line(P(x+.29,y-.26,z),P(x+.29,y+.28,z),'#a1b2b7',3.8);
   // Chain guides, lift carriage and hydraulic cylinder run inside mast.
   for(const yy of [y-.12,y+.12]){
    line(P(x+.32,yy,20),P(x+.32,yy,71),'#9cadab',1.5);
    for(let z=22;z<70;z+=6){const p=P(x+.32,yy,z);ellipse(p.x,p.y,1.1,1.05,'#3a5055');}
   }
   solid(x+.36,y-.10,.12,.34,59,'#6f8791','#405b65','#8ba1a8');
   for(const z of [20,34])line(P(x+.12,y-.28,z),P(x+.12,y+.30,z),'#5b7278',4);
   solid(x+.18,y-.12,.22,.53,13,'#556f77','#334b54','#72888c');
   for(const yy of [y-.20,y+.18]){
    surface(x-.36,yy,.63,.10,6,'#bac6c4','#485c63');
    line(P(x-.38,yy+.05,6),P(x+.20,yy+.05,6),'#364c54',3);
   }
   // Fork heel transitions into horizontal load-bearing steel tines.
   for(const yy of [y-.20,y+.18]){
    line(P(x+.08,yy,12),P(x-.38,yy,6),'#65777b',3.4);
    line(P(x-.36,yy,6),P(x-.43,yy,6),'#c9d3ce',2);
   }
   // Safety lamp goes on top, not behind the mast.
   const warning=P(x+1.45,y-.24,67);
   ellipse(warning.x,warning.y,5,3,'#e8ae45','#a7682f');
  }else if(type==='filingCabinet'||type==='supplyCabinet'||type==='storageShelves'){
   const metal=type==='filingCabinet';
   solid(x,y,w,h,metal?36:40,metal?'#9aa8ae':'#b6bcb1',metal?'#657b82':'#707b75');
   cabinetFace(o,metal?36:40);
   for(let i=0;i<4;i++){
    const height=7+i*8,ap=o.facing==='east'?P(x+.42,y-.18,height):P(x-.48,y-.18,height),
      bp=o.facing==='east'?P(x+.42,y+.20,height):P(x-.48,y+.20,height);
    line(ap,bp,metal?'#c5d0cf':'#5c6e6d',1.8);
    if(metal)ellipse((ap.x+bp.x)*.5,(ap.y+bp.y)*.5,2,1,'#384d53');
    else miniBox(x-.2,y-.16,height+1,'#a8a087',.26,.3,4);
   }
  }else if(type==='noticeBoard'){
   // Mounted board on a narrow stand near the office wall.
   solid(x,y,.4,.3,27,'#777a65','#5b655b');
   const p=P(x-.27,y-.22,45);
   ctx.fillStyle='#a77e55';ctx.fillRect(p.x-11*Z(),p.y-7*Z(),23*Z(),16*Z());
   ctx.strokeStyle='#e0cfaf';ctx.lineWidth=1.4*Z();ctx.strokeRect(p.x-11*Z(),p.y-7*Z(),23*Z(),16*Z());
   for(let i=0;i<3;i++){
    ctx.fillStyle=['#c9b876','#ebe7d7','#d0d8c9'][i];
    ctx.fillRect(p.x+(-8+i*6)*Z(),p.y-4*Z(),5*Z(),8*Z());
   }
  }else if(type==='coffeeStation'){
   solid(x,y,w,h,20,'#a58b6e','#63584e');
   miniBox(x-.18,y-.24,21,'#343c43',.44,.43,12);
   const cp=P(x-.10,y-.04,34);ellipse(cp.x,cp.y,5,2,'#c8d8d6');
   for(let i=0;i<2;i++)miniCan(x+.20,y-.20+i*.3,26,'#e9e9d9',2.3);
  }else if(type==='coatRack'){
   line(P(x,y,0),P(x,y,47),'#6d5847',3.5);
   for(const d of [[-.22,-.20],[.20,-.15],[-.12,.20],[.22,.19]]){
    line(P(x,y,38),P(x+d[0],y+d[1],42),'#87705c',2);
   }
   solid(x-.24,y-.25,.48,.48,3,'#84684c');
  }else if(type==='flowerBed'||type==='planter'){
   const pot=type==='planter',height=pot?19:10;
   solid(x,y,w,h,height,pot?'#a57b55':'#bc996d','#755e49','#8c7053');
   surface(x+.08,y+.08,w-.16,h-.16,height+.5,'#523e32','#8e6e4c');
   for(let i=0;i<(pot?4:12);i++){
    const xx=x-.30+(i%4)*(w-.30)/4,yy=y-.25+Math.floor(i/4)*(h-.12)/3;
    const q=P(xx,yy,height+9+(i%2)*3);
    line(P(xx,yy,height+1),q,'#43754e',1.2);
    for(const k of [0,1,2,3]){
     const r=k*Math.PI/2;
     ellipse(q.x+Math.cos(r)*3.5*Z(),q.y+Math.sin(r)*3*Z(),2.7,2.1,
      ['#e5bb58','#f0a5a6','#e1a6d4','#a7badc'][i%4]);
    }
    ellipse(q.x,q.y,1.2,1.1,'#efdc8b');
   }
  }else if(type==='seedDisplay'){
   solid(x,y,w,h,33,'#809781','#526b63');
   cabinetFace(o,33);
   for(let i=0;i<9;i++){
    const q=P(x-.52,y-.29+(i%3)*.24,10+Math.floor(i/3)*9);
    ctx.fillStyle=['#d6b85d','#9bc283','#b5a4cc'][i%3];
    ctx.fillRect(q.x-3.5*Z(),q.y-5*Z(),7*Z(),10*Z());
    ctx.fillStyle='#4d8260';ctx.fillRect(q.x-3.5*Z(),q.y+1*Z(),7*Z(),3*Z());
   }
  }else if(type==='pottingBench'){
   // Wood top, sink tub, plant pots and under-bench shelves.
   solid(x,y,w,h,20,'#bc9368','#73593c','#956c49');
   solid(x+.10,y+.13,w-.20,h-.22,6,'#ad855b','#755638');
   const p=P(x-.13,y-.18,22);ellipse(p.x,p.y,8,4,'#8b9c96','#dddbbf');
   for(let i=0;i<3;i++){
    const q=P(x+.4+i*.39,y-.12,25);
    ellipse(q.x,q.y,6,3,'#a86b50','#58493e');
    line(q,{x:q.x,y:q.y-8*Z()},'#477949',1.8);
    ellipse(q.x-2*Z(),q.y-9*Z(),4,2.5,'#5b8d55');
    ellipse(q.x+3*Z(),q.y-12*Z(),4,2.5,'#6b985e');
   }
  }else if(type==='gardenBench'){
   solid(x,y,w,h,12,'#b49066','#74634d','#926e50');
   for(let i=0;i<3;i++){
    line(P(x-.40,y-.34+i*.30,15),P(x-.40,y+.34+i*.30,15),'#cfaa7b',2);
   }
   for(const side of [-.3,.3])line(P(x+side,y-.2,13),P(x+side,y-.2,28),'#89633e',3);
   line(P(x-.35,y-.2,29),P(x+.34,y-.2,29),'#c79a64',4);
  }else if(type==='birdbath'){
   const p=P(x,y,22);
   line(P(x,y,1),p,'#adad9f',5);
   ellipse(p.x,p.y,13,5,'#c2c5b5','#778783');
   ellipse(p.x,p.y-1*Z(),9,3,'#7da9ac','#acb5aa');
   const bird=P(x+.10,y-.03,29);
   ellipse(bird.x,bird.y,3,3,'#788e82');
   line(P(x+.12,y-.04,30),P(x+.25,y-.04,31),'#c8bb86',1);
  }else if(type==='wateringStation'){
   solid(x,y,w,h,13,'#859b90','#667a73');
   miniCan(x-.16,y-.08,19,'#9aa8b1',7);
   const q=P(x+.24,y-.24,18);
   line(q,P(x+.24,y-.24,39),'#738b85',2.6);
   line(P(x+.24,y-.24,39),P(x+.38,y-.24,39),'#839f9e',2.5);
   ellipse(q.x+4*Z(),q.y-1*Z(),4,2,'#b3b5a7');
  }else{solid(x,y,w,h,20,'#a7b4ad','#6a7c7b')}
  if(o.damaged){const p=P(x+w*.5,y+h*.5,52);ellipse(p.x,p.y,5,4,'#edbb5e')}
 }
 function drawVehicle(v,t){
  if(v.type==='tree'||v.type==='shrub'){drawFoliage(v);return}
  let {x,y}=v,w=v.w||2,h=v.h||(v.emergency&&v.color==='#b9594d'?4:3);
  shadow(x,y,w,h,1.15);
  // Tire locations, bumpers and roof use the same physical world footprint.
  for(const pos of [[-.25,.16],[w-.75,.16],[-.25,h-.7],[w-.75,h-.7]]){
   const p=P(x+pos[0],y+pos[1]);ellipse(p.x,p.y,7,4,'#1b292c','#101a1d');
  }
  const body=v.emergency?(v.color==='#b9594d'?'#bf4d43':v.color==='#dfd8be'?'#e0e1d9':'#4a7395'):(v.color||'#81969a');
  solid(x,y,w,h,13,body,'#465f66','#70838a');
  solid(x+.23,y+.55,1.53,Math.max(1.4,h-1.45),22,body,'#4e646a','#6c8790');
  surface(x+.35,y+.63,1.3,.55,22,'#33545b','#6d8990');
  surface(x+.35,y+h-1.25,1.3,.5,22,'#375d66','#5c7980');
  for(let side=0;side<2;side++){
   const head=P(x-.25+side*(w-.5),y+.08,13);
   ellipse(head.x,head.y,4,2,'#ede1bb','#928f7d');
   const rear=P(x-.25+side*(w-.5),y+h-.67,13);ellipse(rear.x,rear.y,3,2,'#b14e44');
  }
  if(v.emergency){
   const beacon=P(x+1,y+1.15,27),flash=Math.sin(t*9)>0;
   ellipse(beacon.x-6*Z(),beacon.y,5,3,flash?'#f14e4a':'#8c2930');
   ellipse(beacon.x+6*Z(),beacon.y,5,3,flash?'#3b70bc':'#80b6f0');
   if(v.color==='#b9594d')label(x+1,y+1.8,26,'FIRE','#f7f2dc','#8b3f39',31)
  }
 }
 function drawFoliage(v){
  const {x,y}=v,tree=v.type==='tree',p=P(x,y);
  shadow(x-.3,y-.3,1,1,1.2);
  if(tree){
   line(P(x,y,1),P(x,y,45),'#6d5036',8);
   for(let i=0;i<7;i++){const q=P(x+(i%3-1)*.25,y+(Math.floor(i/3)-1)*.24,57+(i%2)*8);
    ellipse(q.x,q.y,12,8,['#305e47','#427650','#5e854e','#709453'][i%4])}
  }else{for(let i=0;i<6;i++){const q=P(x+(i%3)*.22-.25,y+Math.floor(i/3)*.25-.13,12+(i%2)*3);
   ellipse(q.x,q.y,7,5,['#356947','#558350','#6e9857'][i%3])}}
 }
 // Overhead department signage is an independent visual layer:
 // signs have no collision footprint and do not block doors or aisles.
 function drawDepartmentSign(x,y,name,accent='#467887',axis='x'){
  // A sign over a doorway must follow the wall axis: the garden double
  // entrance runs along world Y while ordinary department signs run along X.
  // Both render as properly tilted *vertical* isometric panels.
  const title=String(name).toUpperCase();
  const span=axis==='y'?1.06:(title.length>=9?2.28:1.78),z=70;
  const point=(along,height,offset=-.12)=>
   axis==='y'?P(x+offset,y-along,height):P(x+along,y+offset,height);
  const a=point(-span,z),b=point(span,z),
        c=point(span,z-26),d=point(-span,z-26);
  const width=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);
  for(const t of [.18,.82]){
   const along=-span+2*span*t;
   line(point(along,z+14),point(along,z),'#b4bdb1',1.6);
  }
  poly([point(-span,z-2,-.15),point(span,z-2,-.15),
   point(span,z-28,-.15),point(-span,z-28,-.15)],'#516567');
  poly([a,b,c,d],'#e8e7d9','#4c6568',1.2);
  line(point(-span+.06,z-3),point(span-.06,z-3),accent,2.8);
  const mid={x:(a.x+b.x+c.x+d.x)/4,y:(a.y+b.y+c.y+d.y)/4};
  ctx.save();
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.clip();
  ctx.translate(mid.x,mid.y);ctx.rotate(angle);
  // Counter-rotate lettering with the projected vertical panel, avoiding a
  // camera-facing floating label or an upside-down garden sign.
  ctx.transform(1,0,Math.sin(angle),Math.cos(angle),0,0);
  ctx.font=`700 ${Math.max(6.5,10.5*Z())}px system-ui,sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#273f41';
  ctx.fillText(title,0,0,width-(axis==='y'?9:17)*Z());
  ctx.restore();
 }
 // A-frame warning sign sits at the actual wet-floor tile and persists briefly.
 function drawWetFloorSign(x,y){
  const baseLeft=P(x-.22,y-.1,0),baseRight=P(x+.24,y-.1,0);
  const top=P(x,y-.1,25),back=P(x,y+.14,1);
  poly([baseLeft,baseRight,top],'#efd04d','#7e6c23',1.7);
  poly([baseRight,back,top],'#c6a53f','#7b6425',1.2);
  line(top,P(x,y-.1,4),'#8b7324',1.2);
  const p=P(x,y-.1,17);
  ctx.fillStyle='#3d391c';ctx.beginPath();
  ctx.moveTo(p.x,p.y-5*Z());ctx.lineTo(p.x+5*Z(),p.y+4*Z());
  ctx.lineTo(p.x-5*Z(),p.y+4*Z());ctx.closePath();ctx.fill();
  ctx.font=`bold ${Math.max(6,7*Z())}px system-ui,sans-serif`;
  ctx.textAlign='center';ctx.fillStyle='#fff2b4';ctx.fillText('!',p.x,p.y+2*Z(),9*Z());
  const writing=P(x,y-.1,8);ctx.fillStyle='#41351d';
  ctx.font=`bold ${Math.max(5,6*Z())}px system-ui,sans-serif`;
  ctx.fillText('WET FLOOR',writing.x,writing.y,33*Z())
 }
 // Movement-driven mop head and bucket; time comes from the NPC's own cleaning phase.
 function drawCleaningSet(x,y,phase=0){
  const z=Z(),swing=Math.sin(phase*7)*.33,bucket=P(x+.52,y+.20);
  shadow(x+.48,y+.17,.4,.4,.7);
  // Bucket walls, handle, water surface and a moving reflection.
  const a=P(x+.35,y+.06,1),b=P(x+.68,y+.06,1),c=P(x+.68,y+.40,1),d=P(x+.35,y+.40,1);
  const at=P(x+.35,y+.06,15),bt=P(x+.68,y+.06,15),ct=P(x+.68,y+.40,15),dt=P(x+.35,y+.40,15);
  poly([dt,ct,c,d],'#e5bd41','#7b6832',1);poly([bt,ct,c,b],'#d4a734','#7b6832',1);
  poly([at,bt,ct,dt],'#edcd56','#987b2b',1);
  ellipse(bucket.x,bucket.y-15*z,6.5,3.1,'#93cdd3','#4b8086');
  line(P(x+.34,y+.12,14),P(x+.47,y+.20,26),'#a7b4af',1.3);
  line(P(x+.47,y+.20,26),P(x+.68,y+.3,14),'#a7b4af',1.3);
  const mopX=x-.28+swing,mopY=y-.14-swing*.18;
  const foot=P(mopX,mopY,2),hand=P(x-.08,y-.05,44);
  line(hand,foot,'#b68d57',3);
  line(P(mopX-.16,mopY+.12,3),P(mopX+.18,mopY-.10,3),'#94a8a4',4);
  for(let k=-2;k<=2;k++)line(P(mopX+k*.05,mopY+.15,1),P(mopX+k*.05+.04,mopY+.28,1),'#d7d1b8',1.2);
  if(phase>0)for(let i=0;i<3;i++){const p=P(mopX+i*.12-.12,mopY+.33,1);ellipse(p.x,p.y,2.2,1,'#9bc9cc88')}
 }
 function drawDrop(d){
  shadow(d.x-.1,d.y-.1,.25,.25,.75);
  drawItem(d.item,d.x,d.y,6,1.2)
 }
 return {drawFloor,drawWall,drawDoor,drawFixture,drawVehicle,drawDrop,drawItem,drawDepartmentSign,drawWetFloorSign,drawCleaningSet};
}
