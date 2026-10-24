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
 // Deterministic botanical clusters: tapered branching stems, varied
 // foliage silhouettes, terracotta pots and occasional flower heads.
 // Pots use actual table coordinates and sit at the supporting tabletop Z.
 function plants(x,y,z=0,qty=3,w=1,h=1){
  const greens=['#355f40','#47774b','#638e53','#749a5b','#2e654b'];
  const cols=Math.max(1,Math.min(4,Math.ceil(Math.sqrt(qty*w/Math.max(.5,h))))),rows=Math.ceil(qty/cols);
  for(let i=0;i<qty;i++){
   const col=i%cols,row=Math.floor(i/cols);
   const px=x-.5+(col+.5)*w/cols,py=y-.5+(row+.5)*h/rows;
   const growth=10+(i*5)%11;
   const base=P(px,py,z);
   // Pot body rises directly FROM tabletop, not above it or outside it.
   poly([P(px-.09,py-.09,z),P(px+.09,py-.09,z),
    P(px+.105,py+.09,z+5),P(px-.105,py+.09,z+5)],
    '#b67851','#62452f',.75);
   const rim=P(px,py,z+5);
   ellipse(rim.x,rim.y,5.4,2.5,'#c88962','#634735');
   ellipse(rim.x,rim.y-.6*Z(),3.4,1.35,'#453b2d');
   for(let branch=0;branch<3;branch++){
    const sx=(branch-1)*.1,sy=(branch%2?-.05:.05),top=z+growth+4-branch%2*3;
    line(P(px,py,z+5),P(px+sx,py+sy,top),'#416b3e',1.5);
    for(let leaf=0;leaf<3;leaf++){
     const q=P(px+sx*(leaf+1)/3+(leaf%2?.06:-.06),py+sy*(leaf+1)/3,
      z+7+leaf*(growth-4)/3);
     ellipse(q.x,q.y,3+(i%2),1.8,greens[(i+branch+leaf)%greens.length]);
    }
   }
   if(i%3===0){
    const top=P(px,py,z+growth+6),petals=['#e9b871','#e3a9a6','#e2c8da'];
    for(let k=0;k<5;k++){
     const theta=k*Math.PI*2/5;
     ellipse(top.x+Math.cos(theta)*3*Z(),top.y+Math.sin(theta)*2.3*Z(),
      2,1.5,petals[Math.floor(i/3)%3]);
    }
    ellipse(top.x,top.y,1.4,1.1,'#dfbb61');
   }
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
   // At actual exterior corners, don't draw full outward-facing arms:
   // each half segment joins the interior neighboring wall at the corner.
   const isOuterCorner=dirs.length===2&&o.section!=='receivingOffice';
   const neighbor=(xx,yy,leg)=>world?.walls.get(xx+','+yy)?.axes?.includes(leg);
   let x0=o.x-.52,x1=o.x+.52,y0=o.y-.52,y1=o.y+.52;
   if(isOuterCorner&&axis==='x'){
    if(neighbor(o.x+1,o.y,'x')&&!neighbor(o.x-1,o.y,'x'))x0=o.x;
    if(neighbor(o.x-1,o.y,'x')&&!neighbor(o.x+1,o.y,'x'))x1=o.x;
   }
   if(isOuterCorner&&axis==='y'){
    if(neighbor(o.x,o.y+1,'y')&&!neighbor(o.x,o.y-1,'y'))y0=o.y;
    if(neighbor(o.x,o.y-1,'y')&&!neighbor(o.x,o.y+1,'y'))y1=o.y;
   }
   const p=P(x0,y0),q=axis==='y'?P(x0,y1):P(x1,y0);
   const top={x:p.x,y:p.y-z},end={x:q.x,y:q.y-z};
   const shade=axis==='y'?'#a6b7b0':'#c0c6ba';
   poly([{x:p.x+3*Z(),y:p.y+5*Z()},{x:q.x+3*Z(),y:q.y+5*Z()},
     {x:q.x+4*Z(),y:q.y-20*Z()},{x:p.x+4*Z(),y:p.y-20*Z()}],'#1a252a27');
   poly([p,q,end,top],shade);
   line(top,end,o.section==='staff'?'#ede9dc':'#e7e5d5',3);
   // North elevation faces the parking lot. Glass and mullions stay inside
   // the physical wall segment; no window occupies either main entry tile.
   if(o.window==='office'){
    const left=-.37,right=.37,topZ=44,bottomZ=18;
    const p1=axis==='x'?P(o.x+left,o.y-.51,topZ):P(o.x-.51,o.y+left,topZ);
    const p2=axis==='x'?P(o.x+right,o.y-.51,topZ):P(o.x-.51,o.y+right,topZ);
    const p3=axis==='x'?P(o.x+right,o.y-.51,bottomZ):P(o.x-.51,o.y+right,bottomZ);
    const p4=axis==='x'?P(o.x+left,o.y-.51,bottomZ):P(o.x-.51,o.y+left,bottomZ);
    poly([p1,p2,p3,p4],'#739da684','#dce9e4',1.7);
    line(P(axis==='x'?o.x:o.x-.51,axis==='x'?o.y-.51:o.y,topZ),
     P(axis==='x'?o.x:o.x-.51,axis==='x'?o.y-.51:o.y,bottomZ),'#e3ebe6',1.4);
    line(p4,p3,'#708e90',2);
   }
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
   // Cohesive west-facing lawn tractor, painted back-to-front. Keep all
   // geometry within the two-tile parking footprint; no floating trim.
   shadow(x,y,w,h,1.12);
   const wheel=(xx,yy,r)=>{
    const p=P(xx,yy,7);
    ellipse(p.x,p.y,r,r*.95,'#25302f','#151d1e');
    ellipse(p.x,p.y,r*.46,r*.46,'#a5aaa0','#586361');
   };
   // Far-side wheels disappear behind the integrated tractor body.
   wheel(x+.23,y-.22,5.8);
   wheel(x+1.43,y-.22,8.2);
   // Cutting deck and chute form a low single connected underside.
   solid(x+.38,y+.01,1.01,.75,8,'#b9993d','#806b2b','#a98e35');
   solid(x+.76,y+.30,.42,.19,8,'#c9a84c','#826c2c','#ac9137');
   // Entire main chassis is one continuous green mass.
   solid(x+.31,y+.01,1.34,.70,15,'#538039','#36572f','#628a46');
   // Hood remains at the western/inside-store end.
   solid(x+.03,y+.06,.77,.61,25,'#8bb953','#4b7937','#74a34d');
   surface(x+.09,y+.10,.63,.50,26,'#acd176','#5d8845');
   // Nose face, headlights and grill occupy one physical nose plane.
   poly([P(x-.46,y-.24,14),P(x-.46,y+.22,14),
    P(x-.46,y+.22,23),P(x-.46,y-.24,23)],'#3b5145','#25392f',1.2);
   for(let i=0;i<4;i++){
    const yy=y-.16+i*.105;
    line(P(x-.466,yy,16),P(x-.466,yy,20),'#9da9a2',1.3);
   }
   for(const yy of [y-.19,y+.16]){
    const p=P(x-.47,yy,22);
    ellipse(p.x,p.y,2.5,1.8,'#eee4b8','#68766a');
   }
   // The ribbed footwell separates the engine hood from the rear seat.
   surface(x+.84,y+.06,.27,.57,16,'#303f3c','#182826');
   for(let i=0;i<3;i++){
    const xx=x+.88+i*.075;
    line(P(xx,y-.16,17),P(xx,y+.16,17),'#849083',1.2);
   }
   // A single steering wheel ahead of the seat, with no hood intersection.
   line(P(x+.98,y+.05,17),P(x+.98,y+.05,32),'#435550',3.2);
   const steering=P(x+.98,y+.05,34);
   ellipse(steering.x,steering.y,7,3.2,'#273636','#8d9992');
   // Seat cushion is on chassis, seatback rises behind it.
   solid(x+1.20,y+.09,.33,.36,27,'#353f3d','#26312e','#505a55');
   poly([P(x+1.49,y-.11,26),P(x+1.49,y+.23,26),
    P(x+1.49,y+.23,40),P(x+1.49,y-.11,40)],'#333e3d','#23312e',1.4);
   // Near-side fender is behind the wheels rather than drawn across tires.
   line(P(x+1.18,y+.29,20),P(x+1.65,y+.29,20),'#83ac4d',4);
   wheel(x+.23,y+.35,5.8);
   wheel(x+1.43,y+.35,8.2);
   const exhaust=P(x+.61,y-.22,29);
   ellipse(exhaust.x,exhaust.y,2.2,1.6,'#354748','#72817b');
  }else if(type==='pallet'||type==='bagPallet'){
   solid(x,y,w,h,5,'#b79566','#8a6545','#a47e58');
   for(let i=0;i<6;i++)miniBox(x+.08+i%3*.56,y+.12+Math.floor(i/3)*.36,13+i%2*5,
     type==='bagPallet'?'#d8cab1':['#a9936b','#b7a383','#989b89'][i%3],.48,.32,10);
  }else if(type==='workbench'){
   solid(x,y,w,h,19,'#b9946b','#776049','#8f7255');
   for(let i=0;i<4;i++)drawItem(['hammer','wrench','flashlight','gloves'][i],x+.3+i*.37,y+.4,24);
  }else if(type==='office'){
   // Compact manager office: wood worktop, drawer pedestal and computer.
   shadow(x,y,w,h,.8);
   solid(x,y,w,h,25,'#b48a66','#74543d','#987251');
   surface(x+.04,y+.04,w-.08,h-.08,26,'#d1ad88','#826044');
   solid(x+.12,y+.12,.27,.58,22,'#8e735b','#594b3d','#79634e');
   for(const z of [8,15,20])line(P(x-.33,y+.18,z),P(x-.14,y+.18,z),'#c2b5a5',1.6);
   line(P(x+.03,y-.16,27),P(x+.03,y-.16,33),'#4e6069',3);
   poly([P(x-.25,y-.25,33),P(x+.30,y-.25,33),
    P(x+.30,y-.25,48),P(x-.25,y-.25,48)],'#304c5c','#718a91',2.2);
   surface(x+.05,y+.15,.46,.21,27,'#687478','#485a60');
   miniBox(x+.42,y-.15,27,'#e6e2d6',.26,.22,2);
  }else if(type==='officeChair'){
   // One-tile ergonomic swivel chair with casters and upholstered back.
   shadow(x,y,1,1,.6);
   for(const [dx,dy] of [[-.20,0],[.20,0],[0,-.19],[0,.19]]){
    line(P(x,y,4),P(x+dx,y+dy,4),'#52656b',2.8);
    const p=P(x+dx,y+dy,3);ellipse(p.x,p.y,2.4,1.9,'#253238');
   }
   line(P(x,y,4),P(x,y,18),'#7b8787',3);
   solid(x-.25,y-.23,.50,.46,20,'#3f5563','#273943','#596f79');
   for(const xx of [x-.21,x+.21])
    line(P(xx,y+.14,21),P(xx,y+.14,28),'#677983',2.2);
   line(P(x+.19,y,18),P(x+.24,y,37),'#556e79',3);
   poly([P(x+.24,y-.24,22),P(x+.24,y+.24,22),
    P(x+.24,y+.24,43),P(x+.24,y-.24,43)],'#3b5261','#233845',1.6);
  }else if(type==='officePrinter'){
   // Low document cabinet with a copier and realistic paper trays.
   solid(x,y,w,h,22,'#87948f','#586963','#768581');
   solid(x+.08,y+.08,.84,.78,33,'#d0d5cf','#7b8e8d','#afbcb6');
   surface(x+.13,y+.16,.68,.58,34,'#384b52','#a9b7b4');
   miniBox(x+.20,y+.22,34,'#eeeade',.43,.25,2);
   for(let i=0;i<3;i++)
    line(P(x-.37,y-.21+i*.16,13),P(x-.37,y-.06+i*.16,13),'#d4dcd4',1.3);
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
  }else if(type==='breakTable'){
   // Staff lunch table: dark metal legs, laminated wood surface and cups.
   for(const xx of [x-.30,x+w-.69])for(const yy of [y-.24,y+.23])
    line(P(xx,yy,1),P(xx,yy,23),'#5c696b',3.2);
   solid(x,y,w,h,25,'#c9a47c','#816348','#aa865f');
   surface(x+.05,y+.05,w-.10,h-.10,26,'#d9b993','#886b50');
   for(const xx of [x+.26,x+1.12]){
    const p=P(xx,y+.02,27);ellipse(p.x,p.y,5.3,2.7,'#e7e6dc','#8d9893');
    ellipse(p.x,p.y-1*Z(),3.0,1.4,'#735847');
   }
  }else if(type==='breakChair'){
   // Single tile cafe chair supported by four legs, with rear backrest.
   shadow(x,y,1,1,.58);
   for(const xx of [x-.22,x+.22])for(const yy of [y-.23,y+.22])
    line(P(xx,yy,0),P(xx,yy,18),'#58696b',2.7);
   solid(x-.22,y-.22,.44,.44,20,'#77919a','#4d6974','#607d87');
   for(const xx of [x-.22,x+.22])
    line(P(xx,y+.22,17),P(xx,y+.22,38),'#566d78',2.7);
   poly([P(x-.23,y+.22,25),P(x+.23,y+.22,25),
    P(x+.23,y+.22,39),P(x-.23,y+.22,39)],
    '#728c96','#465d6a',1.5);
  }else if(type==='microwave'){
   // Counter with stainless microwave and visible control panel.
   solid(x,y,w,h,23,'#a6a393','#6d7069','#909389');
   solid(x+.12,y+.10,.76,.70,37,'#a4b0b2','#6b7b80','#c0c9c7');
   poly([P(x-.36,y+.31,26),P(x+.15,y+.31,26),
    P(x+.15,y+.31,34),P(x-.36,y+.31,34)],'#344e5c','#94a8aa',1.5);
   for(let i=0;i<3;i++){
    const p=P(x+.26,y+.31,28+i*3);
    ellipse(p.x,p.y,1.3,1.2,'#e6d8b9');
   }
  }else if(type==='table'){
   solid(x,y,w,h,17,'#aa8968','#6b5949');for(let i=0;i<2;i++)miniCan(x+.4+i*.8,y+.4,21,'#d5d8cb',3);
   for(let i=0;i<2;i++)solid(x+i*1.3,y+.42,.44,.34,10,'#5b6e71')
  }else if(type==='sink'){
   // Commercial restroom vanity: sturdy cabinet, recessed porcelain bowl,
   // broad mirror, chrome faucet and soap pump, all physically supported.
   solid(x,y,w,h,23,'#aab8b5','#657574','#879a96');
   surface(x+.04,y+.04,.92,.92,24,'#d8dcd5','#8d9b98');
   const basin=P(x+.02,y+.07,25);
   ellipse(basin.x,basin.y,10.5,5.6,'#f1f1e8','#758d91');
   ellipse(basin.x,basin.y-1.1*Z(),7.0,3.7,'#a8c1c1','#e8eeea');
   line(P(x-.05,y-.30,25),P(x-.05,y-.30,36),'#afc1c1',2.7);
   line(P(x-.05,y-.30,36),P(x+.10,y-.20,36),'#cdd7d3',2.7);
   line(P(x+.10,y-.20,36),P(x+.10,y-.20,32),'#bdcdca',2.3);
   // Framed wall mirror lies flat on the back wall, not floating.
   poly([P(x-.38,y-.44,34),P(x+.38,y-.44,34),
    P(x+.38,y-.44,63),P(x-.38,y-.44,63)],
    '#87a8b1','#d4e0dc',2.7);
   line(P(x-.31,y-.45,56),P(x+.18,y-.45,39),'#e6f1ef66',2);
   solid(x+.27,y+.18,.12,.13,27,'#d5e0d7','#80958d');
   line(P(x+.33,y+.20,29),P(x+.33,y+.20,33),'#83988f',1.5);
  }else if(type==='restroom'||type==='restroomStall'){
   // Framed privacy stall with toilet pedestal, cistern, paper holder,
   // raised partition and a clear open doorway toward the approach side.
   shadow(x,y,1,1,.62);
   const back=y-.37,front=y+.33;
   solid(x-.06,y-.18,.45,.53,8,'#d9ddda','#a5b2ae','#c5ccc7');
   const bowl=P(x+.06,y+.05,12);
   ellipse(bowl.x,bowl.y,8.5,5,'#f7f7f0','#91a8a7');
   ellipse(bowl.x,bowl.y-1.2*Z(),5.1,3.0,'#a9c3c1','#e4e9e3');
   solid(x-.10,back,.36,.22,27,'#eaede5','#afbeba','#c9d2cb');
   // Raised stall partition: sides grounded, entry deliberately open.
   for(const xx of [x-.43,x+.43]){
    line(P(xx,back,3),P(xx,front,3),'#7f9697',2.6);
    poly([P(xx,back,7),P(xx,front,7),P(xx,front,48),P(xx,back,48)],
     '#b5c9c785','#6f8588',1.5);
    line(P(xx,back,48),P(xx,front,48),'#e6ece6',2);
   }
   line(P(x-.43,back,48),P(x+.43,back,48),'#859b9a',2.7);
   const paper=P(x+.37,y+.17,25);
   ellipse(paper.x,paper.y,3.5,3,'#e8e5da','#93a39b');
   ellipse(paper.x,paper.y,1.1,1,'#84908b');
   // The stall door is half open, attached to the left jamb.
   poly([P(x-.42,front,5),P(x-.05,front+.08,5),
    P(x-.05,front+.08,43),P(x-.42,front,43)],
    '#c5d3cf','#788f8d',1.5);
  }else if(type==='handDryer'){
   // Wall-mounted hand dryer on the restroom's eastern wall.
   poly([P(x+.30,y-.30,31),P(x+.30,y+.25,31),
    P(x+.30,y+.25,46),P(x+.30,y-.30,46)],
    '#e0e7e2','#7a918f',2);
   line(P(x+.315,y-.20,34),P(x+.315,y+.15,34),'#768f90',2);
   const sensor=P(x+.32,y+.01,38);
   ellipse(sensor.x,sensor.y,2,1.4,'#3e6d78');
  }else if(type==='restroomBin'){
   // Floor-standing stainless waste basket with inset dark opening.
   shadow(x,y,.65,.65,.6);
   solid(x-.25,y-.25,.50,.50,17,'#aebcb9','#64787a','#889c9a');
   surface(x-.22,y-.22,.44,.44,18,'#374e50','#aebdb9');
   for(const yy of [y-.10,y+.08])
    line(P(x-.37,yy,3),P(x-.37,yy,15),'#d2dcd6',1.3);
  }else if(type==='plants'||type==='gardenDesk'){
   const isPlants=type==='plants',height=isPlants?10:19;
   // Continuous table surface supports the actual underside of every pot.
   solid(x,y,w,h,height,isPlants?'#947657':'#829784','#5e5546','#816d54');
   surface(x+.04,y+.04,w-.08,h-.08,height+.3,'#c1a07b','#77624c');
   for(let yy=y-.28;yy<y+h-.49;yy+=.32)
    line(P(x-.36,yy,height+.5),P(x+w-.64,yy,height+.5),'#a98560',1);
   // A display's tile dimensions determine grid spacing; no overflow.
   plants(x,y,height+.5,Math.min(9,Math.round(w*h*2)+2),w-.25,h-.25);
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
   // Open heavy-duty cantilever lumber rack: vertical steel columns,
   // diagonal bracing, projecting shelf arms, and real separated boards.
   // All material rests directly on the supports inside the 2x1 footprint.
   shadow(x,y,w,h,1.08);
   const rear=y-.34,front=y+.30,left=x-.38,right=x+w-.62;
   // Grounded base feet and raised rear stanchions.
   for(const xx of [left,x+.47,right]){
    solid(xx-.055,rear-.09,.11,.75,5,'#52636c','#354951','#657780');
    line(P(xx,rear,3),P(xx,rear,62),'#536b76',5);
    line(P(xx+.025,rear,4),P(xx+.025,rear,61),'#81949a',1.1);
   }
   // Diagonal stiffeners on the back of the rack keep bays open.
   for(const [ax,bx] of [[left,x+.47],[x+.47,right]]){
    line(P(ax,rear,12),P(bx,rear,53),'#607783',2.6);
    line(P(ax,rear,53),P(bx,rear,12),'#465d67',2.6);
   }
   const tiers=[12,31,50];
   for(let tier=0;tier<tiers.length;tier++){
    const z=tiers[tier];
    // Cantilever steel arms actually project forward from the posts.
    for(const xx of [left,x+.47,right]){
     line(P(xx,rear,z),P(xx,front,z),'#566d77',5.1);
     line(P(xx,front,z),P(xx,front,z+4),'#e0a143',2.9);
    }
    line(P(left,rear,z),P(right,rear,z),'#809198',3);
    // Nested dimensional timber courses, separated by narrow dark gaps.
    for(let row=0;row<2;row++){
     const yy=rear+.12+row*.24;
     for(let layer=0;layer<2;layer++){
      const bz=z+2+layer*5;
      const timber=['#cc9c66','#e1b984','#b98d60','#d4a776'][(tier+row+layer)%4];
      poly([P(x-.40,yy-.07,bz+4),P(x+w-.60,yy-.07,bz+4),
       P(x+w-.60,yy+.07,bz+4),P(x-.40,yy+.07,bz+4)],
       timber,'#916d49',.8);
      poly([P(x-.40,yy+.07,bz+4),P(x+w-.60,yy+.07,bz+4),
       P(x+w-.60,yy+.07,bz),P(x-.40,yy+.07,bz)],
       '#b58b5c','#8c6948',.7);
      // Upper layers are raised by their supported course, not floating.
      if(layer===1){
       const ends=[x+.08,x+w-.17];
       for(const ex of ends)
        line(P(ex,yy-.08,bz),P(ex,yy+.08,bz),'#b18458',1.6);
      }
     }
    }
    // Bound timber bundle banding around each shelf's stack.
    for(const xx of [x+.28,x+w-.80])
     line(P(xx,rear+.08,z+11),P(xx,front-.07,z+11),'#385662',2.2);
   }
   // High-visibility end guards indicate an industrial lumber rack.
   for(const xx of [left,right]){
    line(P(xx,front,5),P(xx,front,15),'#d7993f',3.5);
    line(P(xx,front,6),P(xx,front,9),'#394c53',1.4);
   }
  }else if(type==='toolCabinet'){
   // Free-standing, double-wide red steel retail tool rack. Display faces
   // the customer aisle along Y; all shelves, posts and stock share its footprint.
   const front=y+.32,rear=y-.32,left=x-.39,right=x+w-.61;
   for(const xx of [left,x+.50,right]){
    for(const yy of [rear,front]){
     line(P(xx,yy,1),P(xx,yy,54),'#8f302b',5);
     line(P(xx-.015,yy,3),P(xx-.015,yy,52),'#cb5b47',1.7);
    }
   }
   for(const z of [8,23,38,50]){
    solid(x+.03,y+.03,w-.06,.83,z,'#c74735','#752e2b','#a63d31');
    surface(x+.05,y+.05,w-.10,.79,z+.8,'#68727a','#43515c');
    line(P(left,front,z+1),P(right,front,z+1),'#e16f50',3.3);
   }
   // Upright punched steel peg panels behind the upper tool rows.
   poly([P(left,rear,24),P(right,rear,24),P(right,rear,51),P(left,rear,51)],
    '#a44336','#702f2d',1);
   for(let i=0;i<10;i++){
    const xx=x-.25+i*.16;
    for(const z of [30,36,43])
     ellipse(P(xx,rear, z).x,P(xx,rear,z).y,.65,.65,'#533837');
   }
   // Lower shelves: drill boxes, compact tool cases and a toolbox.
   for(let i=0;i<5;i++){
    const xx=x-.29+i*.38;
    miniBox(xx,y+.02,11+i%2,'#3e5359',.29,.35,10);
    line(P(xx,y+.11,22),P(xx+.25,y+.11,22),'#d8ae69',1.6);
   }
   for(let i=0;i<4;i++){
    const xx=x-.23+i*.47;
    miniBox(xx,y+.08,26,'#b9a16d',.28,.27,9);
    line(P(xx+.08,y+.06,36),P(xx+.20,y+.06,36),'#485b60',1.8);
   }
   // Hanging hammer and wrench silhouettes against the back panel.
   for(let i=0;i<5;i++){
    const xx=x-.23+i*.36;
    line(P(xx,rear+.05,46),P(xx,rear+.05,40),'#c5a179',2.4);
    if(i%2===0)
     line(P(xx-.09,rear+.05,41),P(xx+.09,rear+.05,41),'#c5ccd0',3.4);
    else
     ellipse(P(xx,rear+.05,41).x,P(xx,rear+.05,41).y,2.6,1.6,'#8c9da2','#4f6067');
   }
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
   // Real receiving manager workstation, solid drawer pedestals below a
   // continuous laminate worktop, computer, keyboard and delivery paperwork.
   shadow(x,y,w,h,1.02);
   for(const xx of [x+.06,x+1.37]){
    solid(xx,y+.06,.43,.70,22,'#777f81','#4f5b61','#647277');
    for(const z of [6,13,19]){
     line(P(xx-.30,y+.23,z),P(xx-.06,y+.23,z),'#bec7c6',1.8);
     const knob=P(xx-.18,y+.23,z);
     ellipse(knob.x,knob.y,1.2,.8,'#333e46');
    }
   }
   solid(x,y,w,h,26,'#aa805b','#695445','#86674e');
   surface(x+.02,y+.03,w-.04,h-.06,27,'#d9c5a4','#8a785f');
   // Computer screen is mounted on the far edge, facing the office chair.
   line(P(x+.59,y-.20,28),P(x+.59,y-.20,36),'#505f66',3);
   poly([P(x+.31,y-.20,36),P(x+.88,y-.20,36),
    P(x+.88,y-.20,52),P(x+.31,y-.20,52)],'#2d424c','#889ca1',2);
   const screen=P(x+.59,y-.20,44);
   ellipse(screen.x,screen.y,2,1.4,'#7ab4bb');
   surface(x+.32,y+.20,.57,.20,28,'#6c7776','#435156');
   for(let i=0;i<6;i++)
    line(P(x+.37+i*.08,y+.19,28.5),P(x+.37+i*.08,y+.26,28.5),'#c9d1cd',.8);
   // Clipboard and stacked packing slips beside the monitor.
   miniBox(x+1.13,y-.13,27.4,'#e4dfc9',.41,.31,2);
   line(P(x+1.24,y-.13,30),P(x+1.40,y-.13,30),'#4d6270',1.5);
   for(let i=0;i<3;i++)
    line(P(x+1.18,y-.06+i*.045,30),P(x+1.44,y-.06+i*.045,30),'#879693',.8);
  }else if(type==='officeChair'){
   // One-tile cushioned swivel office chair, tucked behind the desk.
   shadow(x,y,1,1,.64);
   for(const [dx,dy] of [[-.19,0],[.19,0],[0,-.19],[0,.19]]){
    line(P(x,y,4),P(x+dx,y+dy,4),'#48575c',2.7);
    const p=P(x+dx,y+dy,3);
    ellipse(p.x,p.y,2.8,2.4,'#273539','#6c7b80');
   }
   line(P(x,y,5),P(x,y,18),'#737e80',3.5);
   solid(x-.25,y-.25,.50,.50,20,'#384957','#242f39','#526572');
   // Back cushion is supported by the rear seat frame, not floating.
   line(P(x,y-.20,18),P(x,y-.20,39),'#485962',3.4);
   poly([P(x-.23,y-.24,22),P(x+.23,y-.24,22),
    P(x+.23,y-.24,43),P(x-.23,y-.24,43)],'#374a59','#1d303c',1.7);
   for(const side of [-.25,.25])
    line(P(x+side,y+.02,23),P(x+side,y+.19,23),'#687a80',2.3);
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
   // Clean forklift silhouette: body first, near-side tires, four guard
   // supports tied to the chassis, then the forward load-lift assembly.
   shadow(x,y,w,h,1.12);
   const cabLeft=x+.76,cabRight=x+1.55,cabRear=y-.22,cabFront=y+.22;
   // One chassis, integrated counterweight and raised rear engine cowling.
   solid(x+.67,y-.22,1.04,.67,18,'#d89439','#85542e','#ba7934');
   solid(x+1.30,y-.17,.34,.57,24,'#e5a347','#905c2d','#ca8535');
   surface(x+.94,y-.12,.56,.43,20,'#bc7b31','#7c542f');
   // Low driver seat and steering inside the guard, not above roof.
   solid(x+1.08,y-.07,.29,.31,29,'#34474a','#233539','#53666a');
   line(P(x+.94,y+.06,20),P(x+.92,y+.06,38),'#596e73',2.8);
   const steering=P(x+.92,y+.06,39);
   ellipse(steering.x,steering.y,5.5,3.5,'#293b40','#a5b6b3');
   // Precisely two visible driver-side tires below chassis line.
   const axleX=[x+.84,x+1.47],driverY=y+.36;
   for(const xx of axleX){
    const p=P(xx,driverY,6);
    ellipse(p.x,p.y,10,8.6,'#263235','#64777a');
    ellipse(p.x,p.y,4.2,3.6,'#b6c3be');
   }
   // All four support legs start at chassis top and meet the same canopy.
   for(const xx of [cabLeft,cabRight]){
    for(const yy of [cabRear,cabFront]){
     line(P(xx,yy,18),P(xx,yy,62),'#455e68',5);
    }
   }
   surface(cabLeft,cabRear,cabRight-cabLeft,cabFront-cabRear,62,
    '#354e56','#798b8b');
   // Forward mast stays outside the cab and carries a single carriage.
   for(const yy of [y-.24,y+.24]){
    line(P(x+.27,yy,7),P(x+.27,yy,77),'#304850',6);
   }
   for(const z of [18,44,75]){
    line(P(x+.27,y-.24,z),P(x+.27,y+.24,z),'#9aafb2',3);
   }
   solid(x+.21,y-.10,.13,.36,44,'#697f88','#39545c','#80979a');
   // Fork blades emerge horizontally from the low carriage to the west.
   for(const yy of [y-.17,y+.16]){
    line(P(x+.22,yy,13),P(x+.22,yy,6),'#61767b',4);
    surface(x-.37,yy,.60,.10,6,'#b1bfbe','#4f666d');
   }
   const beacon=P(x+1.43,y-.19,66);
   ellipse(beacon.x,beacon.y,4.4,2.8,'#e9b14f','#925d2d');
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
   // Staff coffee counter with brewer, glass carafe and cup organizer.
   solid(x,y,w,h,24,'#b18f70','#735b46','#967759');
   surface(x+.04,y+.04,.92,.92,25,'#d5c3a9','#826b54');
   solid(x-.24,y-.25,.42,.40,38,'#303b42','#1f2d36','#51626a');
   const carafe=P(x-.04,y-.04,40);
   ellipse(carafe.x,carafe.y,4.4,3,'#a5b8b7','#455b5d');
   ellipse(carafe.x,carafe.y+3*Z(),3.6,2,'#57433b');
   for(let i=0;i<3;i++){
    const q=P(x+.24,y-.19+i*.18,29);
    ellipse(q.x,q.y,3.9,2.2,'#eeece2','#9aaca7');
    line(P(x+.28,y-.16+i*.18,29),P(x+.33,y-.16+i*.18,32),'#d0d7d3',1.4);
   }
  }else if(type==='coatRack'){
   line(P(x,y,0),P(x,y,47),'#6d5847',3.5);
   for(const d of [[-.22,-.20],[.20,-.15],[-.12,.20],[.22,.19]]){
    line(P(x,y,38),P(x+d[0],y+d[1],42),'#87705c',2);
   }
   solid(x-.24,y-.25,.48,.48,3,'#84684c');
  }else if(type==='flowerBed'||type==='planter'){
   const pot=type==='planter',height=pot?18:8;
   // Staggered wooden edging, dark loamy soil and scattered mulch avoid
   // the old identical-row flowerbed look.
   solid(x,y,w,h,height,pot?'#a8815e':'#937650','#634a38','#876b4c');
   surface(x+.08,y+.08,w-.16,h-.16,height+.8,'#493c2d','#785c44');
   for(let i=0;i<15;i++){
    const xx=x-.30+((i*7)%13)/13*(w-.40);
    const yy=y-.29+((i*5)%11)/11*(h-.43);
    const p=P(xx,yy,height+1);
    line({x:p.x-2*Z(),y:p.y},{x:p.x+2*Z(),y:p.y-1*Z()},
     i%3?'#987553':'#be9a6a',1.5);
   }
   const count=pot?5:Math.max(7,Math.round(w*h*6));
   for(let i=0;i<count;i++){
    const col=i%5,row=Math.floor(i/5);
    const xx=x-.30+(col+.2+(row%2)*.32)*(w-.34)/5;
    const yy=y-.31+(row+.42)*(h-.34)/Math.max(2,Math.ceil(count/5));
    const stalk=9+(i*3)%10,flower=i%4!==1;
    const top=P(xx,yy,height+stalk);
    // Multiple angled leaves give each stem a natural branching silhouette.
    line(P(xx,yy,height+1),top,'#476b3f',1.6);
    for(const zf of [.38,.66]){
     const hz=height+stalk*zf;
     for(const side of [-1,1]){
      const tip=P(xx+side*(.06+(i%3)*.013),yy+(zf-.5)*.07,hz+2);
      const root=P(xx,yy,hz-2);
      line(root,tip,'#4a7846',1.4);
      ellipse(tip.x,tip.y,3.1,1.7,['#477b47','#668b4d','#396846'][i%3]);
     }
    }
    if(flower){
     const colors=['#e4a6a0','#e6cb76','#c4a3cc','#f0d9bd','#b0bfdc'];
     for(let petal=0;petal<5;petal++){
      const angle=petal*Math.PI*2/5;
      ellipse(top.x+Math.cos(angle)*3.1*Z(),top.y+Math.sin(angle)*2.5*Z(),
       2.4,1.6,colors[(i+Math.floor(x))%colors.length]);
     }
     ellipse(top.x,top.y,1.6,1.25,'#e4bc63');
    }else{
     for(let k=0;k<4;k++){
      const q=P(xx+(k%2?-.06:.06),yy+(k<2?-.05:.05),height+stalk-2+k);
      ellipse(q.x,q.y,3.6,2.1,['#487345','#6c9254','#3f714c'][k%3]);
     }
    }
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
   // Working nursery potting bench: four load-bearing legs, slatted bench
   // surface, lower storage shelf, actual basin, hand tools and stacked pots.
   const top=25;
   for(const px of [x-.34,x+w-.66])for(const py of [y-.30,y+.30])
    line(P(px,py,0),P(px,py,top),'#70533e',4);
   solid(x+.06,y+.08,w-.12,h-.16,8,'#826248','#614834','#967553');
   for(let i=0;i<3;i++){
    const bx=x+.18+i*.41;
    miniBox(bx,y+.03,11,['#7a6448','#63704e','#947b5c'][i],.28,.23,8);
   }
   solid(x,y,w,h,top,'#a88260','#70523b','#92704e');
   surface(x+.04,y+.05,w-.08,h-.10,top+.5,'#c6a17a','#77583f');
   for(let yy=y-.25;yy<y+.29;yy+=.18)
    line(P(x-.35,yy,top+.7),P(x+w-.65,yy,top+.7),'#987352',1.2);
   // A low galvanized potting tray contains its visible soil.
   solid(x+.12,y+.06,.62,.42,top+4,'#899a97','#596a68','#a1b2ad');
   surface(x+.16,y+.10,.54,.34,top+4.4,'#4e4537','#777064');
   // Real nursery pots, supported ON the tabletop, never in midair.
   for(let i=0;i<3;i++){
    const xx=x+.93+i*.25,yy=y+.16;
    poly([P(xx-.09,yy-.08,top+.5),P(xx+.09,yy-.08,top+.5),
     P(xx+.10,yy+.08,top+7),P(xx-.10,yy+.08,top+7)],
     '#aa714e','#634937',.8);
    const rim=P(xx,yy,top+7);
    ellipse(rim.x,rim.y,5,2.4,'#c28c65','#6b4c35');
    ellipse(rim.x,rim.y-.6*Z(),3.1,1.35,'#493b2d');
   }
   // Backboard and a continuous tool rail, rooted at tabletop height.
   for(const xx of [x-.31,x+1.29])
    line(P(xx,y-.28,top),P(xx,y-.28,top+27),'#705741',3.5);
   line(P(x-.31,y-.28,top+24),P(x+1.29,y-.28,top+24),'#ac8764',4);
   for(let i=0;i<4;i++){
    const xx=x-.13+i*.39;
    line(P(xx,y-.29,top+24),P(xx,y-.29,top+11),'#94704b',2);
    const q=P(xx,y-.29,top+11);
    ellipse(q.x,q.y,2.4,1.4,'#8d9c9b','#586766');
   }
  }else if(type==='gardenBench'){
   // Two-tile-long timber park bench, running north/south in world Y.
   // Supports are rooted at ground Z=0; slats span the entire bench.
   const xRear=x-.29,xFront=x+.23,ends=[y-.34,y+h-.67];
   for(const yy of ends){
    line(P(xRear,yy,0),P(xRear,yy,31),'#66503c',4.2);
    line(P(xFront,yy,0),P(xFront,yy,17),'#66503c',4.2);
    line(P(xRear,yy,14),P(xFront,yy,14),'#65716b',3);
    line(P(xRear,yy,22),P(xFront,yy,22),'#816347',2.4);
   }
   for(let i=0;i<4;i++){
    const xx=x-.18+i*.105;
    line(P(xx,y-.37,17),P(xx,y+h-.63,17),'#c49a6c',4);
    line(P(xx,y-.37,18),P(xx,y+h-.63,18),'#e0bb88',1);
   }
   // Back support slopes away from the seat; no disconnected backboard.
   for(let i=0;i<3;i++){
    const z=23+i*4.5,xx=xRear-.035-(z-23)*.004;
    line(P(xx,y-.37,z),P(xx,y+h-.63,z),'#b99065',4);
    line(P(xx-.005,y-.37,z+1),P(xx-.005,y+h-.63,z+1),'#dfb484',1);
   }
   for(const yy of ends){
    line(P(xRear,yy,19),P(xRear-.08,yy,35),'#76583e',3.6);
    line(P(xRear-.06,yy,26),P(xFront,yy,26),'#987652',3.6);
    line(P(xFront,yy,26),P(xFront,yy,16),'#78604a',2.4);
   }
  }else if(type==='birdbath'){
   const p=P(x,y,22);
   line(P(x,y,1),p,'#adad9f',5);
   ellipse(p.x,p.y,13,5,'#c2c5b5','#778783');
   ellipse(p.x,p.y-1*Z(),9,3,'#7da9ac','#acb5aa');
   const bird=P(x+.10,y-.03,29);
   ellipse(bird.x,bird.y,3,3,'#788e82');
   line(P(x+.12,y-.04,30),P(x+.25,y-.04,31),'#c8bb86',1);
  }else if(type==='wateringStation'){
   // Compact garden watering utility station, not the indoor sink.
   // Four grounded metal legs, deep wash basin, hose reel and watering can.
   for(const xx of [x-.31,x+.31])for(const yy of [y-.28,y+.28]){
    line(P(xx,yy,0),P(xx,yy,23),'#677b78',3.2);
    const p=P(xx,yy,1);ellipse(p.x,p.y,2.3,1.4,'#4b5e58');
   }
   for(const yy of [y-.25,y+.25])
    line(P(x-.31,yy,7),P(x+.31,yy,7),'#718780',2.8);
   for(const xx of [x-.29,x+.29])
    line(P(xx,y-.25,7),P(xx,y+.25,7),'#718780',2.8);
   // Galvanized countertop and inset water tub share the same footprint.
   solid(x,y,w,h,24,'#9baba6','#657a75','#879b95');
   surface(x+.05,y+.05,w-.10,h-.10,24.5,'#c0cdc8','#687e79');
   const basin=P(x-.07,y+.03,25);
   ellipse(basin.x,basin.y,10,5.8,'#657c78','#bdcac6');
   ellipse(basin.x,basin.y-1*Z(),7.6,4.0,'#7eafb5','#d3dcd7');
   const drain=P(x-.07,y+.03,25.3);
   ellipse(drain.x,drain.y,1.3,1.1,'#536b6c');
   // Upright arched faucet mounted behind the tub.
   line(P(x-.15,y-.27,25),P(x-.15,y-.27,41),'#b8c8c3',2.6);
   line(P(x-.15,y-.27,41),P(x-.01,y-.19,43),'#b8c8c3',2.6);
   line(P(x-.01,y-.19,43),P(x+.03,y-.12,39),'#a8bbb7',2.3);
   const tap=P(x-.29,y-.25,26);
   ellipse(tap.x,tap.y,2.8,1.8,'#cbd5ce','#627874');
   // Reel bolts to the right side of the frame; hose hangs downward.
   const reel=P(x+.34,y-.04,18);
   ellipse(reel.x,reel.y,7.0,5.2,'#607973','#344d48');
   ellipse(reel.x,reel.y,5.4,3.8,'#538362','#324f3d');
   ellipse(reel.x,reel.y,3.7,2.5,'#365b44','#6a9074');
   ellipse(reel.x,reel.y,1.4,1.2,'#d0d3c1');
   line(P(x+.33,y+.05,16),P(x+.28,y+.19,7),'#4e8260',2.6);
   line(P(x+.28,y+.19,7),P(x+.15,y+.24,6),'#4e8260',2.6);
   // Watering can rests on the tabletop instead of floating.
   const can=P(x+.20,y+.22,29);
   ellipse(can.x,can.y,5.4,3,'#7f9a8c','#49675f');
   line(P(x+.16,y+.18,31),P(x+.16,y+.18,36),'#6a9484',2);
   line(P(x+.16,y+.18,36),P(x+.25,y+.18,36),'#6a9484',2);
   line(P(x+.23,y+.22,31),P(x+.35,y+.27,33),'#8baaa0',2.5);
   const spout=P(x+.36,y+.27,33);
   ellipse(spout.x,spout.y,2.6,1.4,'#d3d9cc','#687d73');
  }else{solid(x,y,w,h,20,'#a7b4ad','#6a7c7b')}
  if(o.damaged){const p=P(x+w*.5,y+h*.5,52);ellipse(p.x,p.y,5,4,'#edbb5e')}
 }
 function drawVehicle(v,t){
  if(v.type==='tree'||v.type==='shrub'){drawFoliage(v);return}
  const {x,y}=v,w=v.w||2,h=v.h||(v.emergency&&v.color==='#b9594d'?4:3);
  const body=v.emergency?(v.color==='#b9594d'?'#bf4d43':v.color==='#dfd8be'?'#e0e1d9':'#4a7395'):(v.color||'#81969a');
  // Different parked silhouettes without changing footprints or vehicle IDs.
  const kind=v.emergency?'service':(['sedan','crossover','compact','pickup'][Math.abs(Math.round(x))%4]);
  const roofHeight=kind==='compact'?21:kind==='crossover'||kind==='service'?29:kind==='pickup'?25:24;
  const roofStart=kind==='pickup'?.55:kind==='compact'?.78:.75;
  const roofEnd=kind==='pickup'?1.72:kind==='compact'?h-.53:h-.72;
  shadow(x,y,w,h,1.05);
  const wheel=(xx,yy)=>{
   const p=P(xx,yy,6);
   ellipse(p.x,p.y,7.5,6.2,'#202b30','#0c1619');
   ellipse(p.x,p.y,3.7,3.2,'#b3bdbb','#5e6d71');
   ellipse(p.x,p.y,1.2,1,'#657577');
  };
  // Rear wheel sets sit behind the body; two nearest tires remain exposed.
  for(const yy of [y+.46,y+h-.55])wheel(x+w-.56,yy);
  // Lower rocker/chassis and shaped hood and trunk sections.
  solid(x+.09,y+.08,w-.18,h-.16,12,body,'#475963','#677f84');
  surface(x+.15,y+.11,w-.30,roofStart-.05,13,body,'#4e6269');
  surface(x+.15,y+roofEnd,w-.30,h-roofEnd-.14,13,body,'#586e75');
  // Raised cabin uses sloped glass areas, a solid roof and window pillars.
  solid(x+.25,y+roofStart,w-.50,Math.max(.45,roofEnd-roofStart),roofHeight,
   body,'#50636b','#778b8d');
  const windshield=P(x+.04,y+roofStart+.08,roofHeight-5);
  const wind2=P(x+w-.55,y+roofStart+.08,roofHeight-5);
  poly([P(x+.28,y+roofStart+.16,roofHeight-1),
    P(x+w-.56,y+roofStart+.16,roofHeight-1),
    P(x+w-.55,y+roofStart-.04,14),
    P(x+.07,y+roofStart-.04,14)],'#507987','#c0d4d2',1.1);
  poly([P(x+.29,y+roofEnd-.18,roofHeight-1),
    P(x+w-.56,y+roofEnd-.18,roofHeight-1),
    P(x+w-.55,y+roofEnd+.05,14),
    P(x+.07,y+roofEnd+.05,14)],'#426a79','#a4bfc1',1.1);
  surface(x+.37,y+roofStart+.17,w-.74,Math.max(.20,roofEnd-roofStart-.34),
   roofHeight+.5,body,'#d0d6ce');
  // Near side: separated side windows divided by a clear B pillar.
  const sideX=x-.255,midY=y+(roofStart+roofEnd)/2;
  for(const [ay,by] of [[y+roofStart+.13,midY-.08],[midY+.08,y+roofEnd-.12]]){
   poly([P(sideX,ay,roofHeight-5),P(sideX,by,roofHeight-5),
    P(sideX,by,16),P(sideX,ay,16)],'#436b78','#a9c3c5',.9);
  }
  line(P(sideX,midY,16),P(sideX,midY,roofHeight-3),'#d3d1c5',2.6);
  // Doors, handles, mirror and two near-side rubber tires.
  for(const yy of [y+roofStart+.29,y+roofEnd-.28]){
   line(P(x-.39,yy,13),P(x-.24,yy,13),'#d2d6cc',1.4);
  }
  line(P(x-.39,y+roofStart+.03,12),P(x-.39,y+roofEnd+.01,12),'#5d6c72',1.3);
  const mirror=P(x-.39,y+roofStart+.18,19);
  ellipse(mirror.x,mirror.y,3.4,2.2,'#31434b','#8ba0a3');
  for(const yy of [y+.46,y+h-.55])wheel(x-.22,yy);
  // Bumpers, headlights and rear lamps fitted to the car ends.
  for(const xx of [x-.27,x+w-.73]){
   const head=P(xx,y-.30,12),tail=P(xx,y+h-.55,12);
   ellipse(head.x,head.y,3.7,2.2,'#e6e6ca','#8e9e95');
   ellipse(tail.x,tail.y,3.3,2.1,'#b65751','#803d3d');
  }
  line(P(x-.28,y-.36,9),P(x+w-.73,y-.36,9),'#384f57',3.1);
  line(P(x-.28,y+h-.55,9),P(x+w-.73,y+h-.55,9),'#354a51',3.1);
  if(kind==='pickup'){
   // Open-bed cap and tailgate separate the pickup from sedans.
   surface(x+.21,y+1.80,w-.42,h-2.00,14,'#435158','#77878a');
   for(const xx of [x-.27,x+w-.73])
    line(P(xx,y+1.82,15),P(xx,y+h-.55,15),body,3.1);
  }
  if(v.emergency){
   const beacon=P(x+w/2-.5,y+1.25,roofHeight+3),flash=Math.sin(t*9)>0;
   ellipse(beacon.x-6*Z(),beacon.y,5,3,flash?'#f14e4a':'#8c2930');
   ellipse(beacon.x+6*Z(),beacon.y,5,3,flash?'#3b70bc':'#80b6f0');
   if(v.color==='#b9594d')label(x+1,y+1.8,roofHeight+2,'FIRE','#f7f2dc','#8b3f39',31);
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
  const span=axis==='y'?1.06:Math.max(.72,Math.min(1.62,.40+title.length*.105)),z=70;
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
