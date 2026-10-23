// Life in Motion v3 — resolution-independent, built-in isometric environment artwork.
// Nothing in this module downloads external images. Every object uses the same
// world-tile footprint and screen projection as collision/pathfinding.
import {departmentItem,visibleShelfCount} from './merchandise.js?v=signs-doors-hair-20261023-1';
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
   const len=span*(1-open)*.91,from= d.x===20&&axis==='x'?span-len:0;
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
 function checkout(o){
  const {x,y,w,h}=o;
  shadow(x,y,w,h,1.05);
  // Steel register counter aligned with the long X-axis. Shoppers stand
  // north (-Y); the POS screen, till and keyboard face the cashier south (+Y).
  solid(x,y,w,h,17,'#c3c8c1','#586870','#84928d');
  // Conveyor belt: a broad charcoal rubber band with raised steel rollers
  // instead of a vague dark rectangle.
  surface(x+.12,y+.1,1.10,.73,18.1,'#333d45','#58696e');
  surface(x+.16,y+.16,1.01,.60,18.5,'#202d35','#879398');
  for(let i=0;i<5;i++){
   const bx=x-.29+i*.20;
   line(P(bx,y-.34,18.7),P(bx,y+.24,18.7),'#405158',.95);
  }
  line(P(x-.40,y-.40,19),P(x+.68,y-.40,19),'#e6e4da',2.4);
  line(P(x-.40,y+.30,19),P(x+.68,y+.30,19),'#8c9b9a',2);
  // Thick point-of-sale platform with an inset glass barcode scanner.
  solid(x+1.05,y+.08,.80,.78,20,'#b4c3bf','#576d72','#899b98');
  surface(x+1.02,y+.11,.35,.58,20.5,'#293940','#9ea9a6');
  line(P(x+.58,y-.27,21),P(x+.87,y+.14,21),'#76c9cc',2.4);
  line(P(x+.62,y-.22,21.1),P(x+.89,y+.17,21.1),'#d9f6ed',.8);
  // Employee cash drawer / till handle on the +Y (staff) face.
  const drawerY=y+.47;
  poly([
   P(x+.58,drawerY,8),P(x+1.33,drawerY,8),
   P(x+1.33,drawerY,16),P(x+.58,drawerY,16)
  ],'#708388','#334a50',1);
  line(P(x+.85,drawerY+.015,12),P(x+1.10,drawerY+.015,12),'#dfe6de',2.2);
  // Monitor stand anchored into the POS platform; no floating panels.
  line(P(x+1.13,y+.28,21),P(x+1.13,y+.28,30),'#455a63',4);
  surface(x+1.0,y+.26,.29,.29,21.2,'#607479','#344951');
  // The active terminal display faces +Y, where the cashier stands.
  // The opposite customer side sees the back of the casing.
  const sy=y+.495,left=x+.85,right=x+1.40;
  const screen=[P(left,sy,29),P(right,sy,29),P(right,sy,43),P(left,sy,43)];
  poly(screen,'#2a404a','#182d36',2.2);
  const glass=[P(left+.05,sy+.015,31),P(right-.05,sy+.015,31),
               P(right-.05,sy+.015,40),P(left+.05,sy+.015,40)];
  poly(glass,'#3d7680','#8fb1b4',.65);
  line(P(left+.10,sy+.02,37),P(right-.10,sy+.02,37),'#b0ead1',1.35);
  line(P(left+.10,sy+.02,34),P(left+.30,sy+.02,34),'#f2ca8b',1.7);
  // Low profile keyboard directly between cashier and screen.
  surface(x+.97,y+.39,.38,.14,22,'#344953','#182c34');
  for(let i=0;i<3;i++)line(P(x+.78+i*.1,y+.39,22.3),
                         P(x+.78+i*.1,y+.46,22.3),'#b8c9c5',.7);
  // Customer-facing card reader, attached to the -Y edge.
  const cardY=y-.445;
  const card=[P(x+.72,cardY,22),P(x+1.02,cardY,22),
              P(x+1.02,cardY,28),P(x+.72,cardY,28)];
  poly(card,'#30434d','#172c33',1.3);
  line(P(x+.77,cardY-.015,25),P(x+.97,cardY-.015,25),'#86cebb',1.9);
  // Small bag holder / receipt printer adjacent to the POS.
  solid(x+1.30,y+.20,.16,.28,24,'#dddcd0','#7b8d91','#9ba7a0');
  const printer=P(x+1.38,y+.26,26);
  line({x:printer.x-3*Z(),y:printer.y},{x:printer.x+3*Z(),y:printer.y},
       '#f7f4dc',2.7);
  // Brand-neutral end strip and queue-side bumper.
  line(P(x-.46,y-.47,14),P(x+1.45,y-.47,14),'#af6b50',3.3);
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
  if(type==='checkout'){checkout(o);return}
  if(type==='serviceDesk'){
   solid(x,y,w,h,22,'#b1bcbc','#6d7778','#8f9b9a');
   surface(x+.1,y+.1,w-.2,h-.2,23,'#d5cec0','#8e9994');
   miniBox(x+.3,y+.28,27,'#354e59',.45,.33,7);miniBox(x+1.15,y+.33,27,'#e8dec7',.25,.32,3)
  }else if(type==='paintMixer'){
   solid(x,y,1,1,18,'#bdc5c0','#737e80');miniCan(x+.35,y+.4,24,'#bd4e3c',5);
   miniBox(x+.25,y+.23,31,'#4d6973',.48,.28,13)
  }else if(type==='keyCutter'){
   solid(x,y,1,1,19,'#8eab9e','#667a79');
   const p=P(x+.5,y+.46,25);ellipse(p.x,p.y,9,4,'#4e626b');
   line(P(x+.27,y+.22,31),P(x+.75,y+.67,31),'#d9c3a0',3);miniBox(x+.15,y+.11,34,'#374b53',.3,.36,4)
  }else if(type==='saw'){
   solid(x,y,w,h,18,'#bca98b','#665f54');surface(x+.08,y+.06,.87,.87,20,'#a1a9a9');
   const p=P(x+.5,y+.5,27);ellipse(p.x,p.y,12,5,'#c1c7bf','#455255');
   ellipse(p.x,p.y,3,3,'#a35e44');line(P(x+.28,y+.3,34),P(x+.72,y+.52,34),'#bf6c40',3)
  }else if(type==='pallet'||type==='bagPallet'){
   solid(x,y,w,h,5,'#b79566','#8a6545','#a47e58');
   for(let i=0;i<6;i++){miniBox(x+.08+i%3*.56,y+.12+Math.floor(i/3)*.36,13+i%2*5,
     type==='bagPallet'?'#d8cab1':['#a9936b','#b7a383','#989b89'][i%3],.48,.32,10)}
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
   endcapDisplay(o);
  }else if(type==='hardwareBins'){
   // Small-parts storage uses the same larger display vocabulary as endcaps.
   endcapDisplay({...o,department:'HARDWARE'});
  }else if(type==='bucketStack'){
   for(let i=0;i<Math.min(4,o.stock??4);i++)miniCan(x-.18+i%2*.38,y-.18+Math.floor(i/2)*.38,8,'#dadbd0',7)
  }else if(type==='lumberRack'){
   solid(x,y,w,h,8,'#837866','#565447');for(let i=0;i<6;i++){
    solid(x+.12,y+.1+i*.13,w-.25,.12,12+i*3,'#c09e6c','#8a684c')}
  }else if(type==='toolCabinet'){
   solid(x,y,w,h,33,'#a34438','#733c37','#974a3e');
   for(let i=0;i<3;i++)line(P(x+.13,y+.1+i*.26,22),P(x+1.75,y+.1+i*.26,22),'#d0cbb4',1.5)

  }else if(type==='safetyStation'){
   solid(x,y,w,h,28,'#e6e9dc','#b8c5c0');
   miniCan(x+.52,y+.55,28,'#c94940',4)
  }else if(type==='utilityCart'){
   solid(x,y,w,h,13,'#60878d','#49636a');miniBox(x+.1,y+.12,18,'#b8ae90',.32,.44,5);
   const p=P(x+.7,y+.7);ellipse(p.x,p.y,4,4,'#26373d')
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
   // Narrow upright steel dolly with rear wheels and an anchored loading lip.
   solid(x,y,.65,.42,3,'#829397','#586d74');
   for(const yy of [-.18,.18]){
    const wheel=P(x-.18,y+yy,3);ellipse(wheel.x,wheel.y,4,3,'#303c3c','#849193');
   }
   for(const yy of [-.21,.20]){
    line(P(x+.18,y+yy,4),P(x+.18,y+yy,38),'#64808b',2.6);
   }
   line(P(x+.18,y-.21,38),P(x+.18,y+.20,38),'#64808b',2.5);
   miniBox(x-.36,y-.29,5,'#baa47f',.5,.4,10);
  }else if(type==='flatCart'){
   solid(x,y,w,h,7,'#899a9a','#647a7e','#8d9e9b');
   for(const pos of [[-.34,-.27],[w-.68,-.27],[-.34,.24],[w-.68,.24]]){
    const p=P(x+pos[0],y+pos[1]);ellipse(p.x,p.y,3.5,2.4,'#303b3d')
   }
   line(P(x-.38,y+.29,7),P(x-.38,y+.29,28),'#b1bdb7',2);
   line(P(x+w-.66,y+.29,7),P(x+w-.66,y+.29,28),'#b1bdb7',2);
   line(P(x-.38,y+.29,28),P(x+w-.66,y+.29,28),'#b1bdb7',2);
   miniBox(x-.2,y-.22,9,'#bca77c',.65,.34,8);
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
 function drawDepartmentSign(x,y,name,accent='#467887'){
  // The board is a true vertical isometric plane (local X runs along the
  // projected shelf axis, local Y runs straight down from the ceiling).
  // Text receives that same *affine* projection, not only a rotation;
  // this keeps every glyph on the painted face instead of hovering outside.
  const title=String(name).toUpperCase(),span=title.length>=9?2.28:1.78,z=70;
  const a=P(x-span,y-.12,z),b=P(x+span,y-.12,z),
        c=P(x+span,y-.12,z-26),d=P(x-span,y-.12,z-26);
  const width=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);
  for(const t of [.18,.82]){
   const xx=x-span+2*span*t;
   line(P(xx,y-.12,z+14),P(xx,y-.12,z),'#b4bdb1',1.6);
  }
  // A narrow, offset backing makes the sign visibly three-dimensional.
  poly([P(x-span,y-.15,z-2),P(x+span,y-.15,z-2),P(x+span,y-.15,z-28),P(x-span,y-.15,z-28)],'#516567');
  poly([a,b,c,d],'#e8e7d9','#4c6568',1.2);
  line(P(x-span+.06,y-.12,z-3),P(x+span-.06,y-.12,z-3),accent,2.8);
  const mid={x:(a.x+b.x+c.x+d.x)/4,y:(a.y+b.y+c.y+d.y)/4};
  ctx.save();
  // Clip to the panel so long labels cannot run across the surrounding wall.
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.clip();
  ctx.translate(mid.x,mid.y);ctx.rotate(angle);
  // Counter-rotate the local vertical basis so the lettering follows the
  // sign's sloping top edge AND its vertical face, unlike plain rotated text.
  ctx.transform(1,0,Math.sin(angle),Math.cos(angle),0,0);
  ctx.font=`700 ${Math.max(6.5,10.5*Z())}px system-ui,sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#273f41';
  ctx.fillText(title,0,0,width-17*Z());
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
