// Life in Motion v3 — resolution-independent, built-in isometric environment artwork.
// Nothing in this module downloads external images. Every object uses the same
// world-tile footprint and screen projection as collision/pathfinding.
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
  poly([topPts[2],topPts[3],base[3],base[2]],sideX,'#35474a',.7);
  poly([topPts[1],topPts[2],base[2],base[1]],sideY,'#35474a',.7);
  poly(topPts,top,'#405354',.8);return topPts;
 }
 function shadow(x,y,w,h,scale=1){
  const p=P(x+w*.5,y+h*.5);ellipse(p.x+4*Z(),p.y+6*Z(),Math.max(8,(w+h)*11*scale),Math.max(3,(w+h)*4*scale),'#111e203b')
 }
 function label(x,y,z,text,ink='#f4eee2',bg='#344951',width=46){
  const p=P(x,y,z),s=Z();ctx.fillStyle=bg;ctx.fillRect(p.x-width*s*.5,p.y-7*s,width*s,11*s);
  ctx.font=`bold ${Math.max(6,8*s)}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink;
  ctx.fillText(text,p.x,p.y-1*s,width*s-3*s)
 }
 function miniBox(x,y,z,c='#ad865b',w=.34,h=.37,t=6){
  const corners=[P(x-.5,y-.5,z),P(x+w-.5,y-.5,z),P(x+w-.5,y+h-.5,z),P(x-.5,y+h-.5,z)];
  const top=[P(x-.5,y-.5,z+t),P(x+w-.5,y-.5,z+t),P(x+w-.5,y+h-.5,z+t),P(x-.5,y+h-.5,z+t)];
  poly([top[2],top[3],corners[3],corners[2]],'#7b6a58');
  poly([top[1],top[2],corners[2],corners[1]],'#9b8065');
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
  const palette={road:['#38444b','#3b464c','#414b50'],parking:['#555f62','#576064','#60696a'],store:['#b4b5aa','#aeafa5','#a9aaa1'],employee:['#8f9b94','#95a097','#89948d'],garden:['#9b9981','#a6a48a','#a2a48c'],landscape:['#56704f','#5b7554','#617955'],grass:['#6a7f5c','#718360','#637856']};
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
 function drawWall(o,world){
  let axis=o.axis;if(!axis){const onY=world.walls.has((o.x)+','+(o.y+1))||world.walls.has((o.x)+','+(o.y-1));axis=onY?'y':'x'}
  const p=P(o.x-.5,o.y-.5),q=axis==='y'?P(o.x-.5,o.y+.5):P(o.x+.5,o.y-.5),height=o.section==='staff'?55:53,z=height*Z();
  const top={x:p.x,y:p.y-z},end={x:q.x,y:q.y-z},shade=axis==='y'?'#a6b7b0':'#c0c6ba';
  poly([{x:p.x+3*Z(),y:p.y+5*Z()},{x:q.x+3*Z(),y:q.y+5*Z()},{x:q.x+4*Z(),y:q.y-20*Z()},{x:p.x+4*Z(),y:p.y-20*Z()}],'#1a252a27');
  poly([p,q,end,top],shade,'#536563',1);
  line(top,end,o.section==='staff'?'#ede9dc':'#e7e5d5',3);
  line(P(o.x-.5,o.y-.5,6),axis==='y'?P(o.x-.5,o.y+.5,6):P(o.x+.5,o.y-.5,6),'#657773',1);
  if((o.x*7+o.y)%5===0){line({x:p.x,y:p.y-z*.45},{x:q.x,y:q.y-z*.45},'#d4d5c949',.8)}
  // Tall glazed storefront panels, aligned with the wall's actual X axis.
  if(o.y===10&&o.section==='exterior'&&axis==='x'&&[7,8,9,26,27,32,33].includes(o.x)){
   const a=P(o.x-.35,o.y-.5,43),b=P(o.x+.33,o.y-.5,43),c=P(o.x+.33,o.y-.5,13),d=P(o.x-.35,o.y-.5,13);
   poly([a,b,c,d],'#5b849091','#344f59',1.4);
   line(P(o.x-.35,o.y-.5,27),P(o.x+.33,o.y-.5,27),'#cbdad3',1);
   line(P(o.x-.24,o.y-.5,39),P(o.x+.16,o.y-.5,16),'#d9edf044',2)
  }
  if(o.y===10&&o.x===13&&axis==='x')label(o.x+.1,o.y-.49,46,'NORTHLINE','#f3ecdc','#a3453a',64)
 }
 function drawDoor(d){
  const axis=d.axis||([36,38].includes(d.x)?'y':'x'),open=Math.max(0,Math.min(1,d.open||0));
  const start={x:d.x-.5,y:d.y-.5};
  const end=axis==='x'?{x:start.x+1,y:start.y}:{x:start.x,y:start.y+1};
  const h=d.type==='rollup'?53:48;
  const a=P(start.x,start.y),b=P(end.x,end.y),at=P(start.x,start.y,h),bt=P(end.x,end.y,h);
  // Rigid frame: ground threshold, twin jambs, lintel; opening stays empty.
  line(a,b,d.type==='sliding'?'#b6d0d1':'#4f6665',3);
  line(a,at,'#3e5659',3.7);line(b,bt,'#3e5659',3.7);line(at,bt,'#d2d7c9',3.5);
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
   const len=(1-open)*.91,fromX=d.x===20?1-len:0;
   const x1=start.x+(axis==='x'?fromX:0),y1=start.y+(axis==='y'?fromX:0);
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
  if(d.label.includes('Restroom'))label((start.x+ex)/2,(start.y+ey)/2,39,'WC','#eff5e8','#43636c',16)
 }
 function rack(x,y,w,h,dept,stock){
  shadow(x,y,w,h,1.15);
  solid(x,y,w,h,4,'#434e4c','#374240','#505d58');
  // Four open metal shelves, anchored to the exact y-axis floor footprint.
  for(const height of [12,23,34,42]){
   surface(x,y,w,h,height,'#b7c1b8','#536464');
  }
  for(let pos=0;pos<=h;pos+=h){for(let xx of [.04,w-.08]){
   const a=P(x+xx,y+pos,0),b=P(x+xx,y+pos,47);
   line(a,b,'#607479',2.2)
  }}
  for(let tier=0;tier<3;tier++){
   for(let i=0;i<Math.min(9,Math.ceil(h*2));i++){
    // Different merchandise silhouettes per department, not randomly floating blocks.
    const py=y+.12+i*(h-.34)/Math.min(9,Math.ceil(h*2)),px=x+.20+(i%2)*.33,z=14+tier*11;
    if(dept==='PAINT')miniCan(px,py,z,['#b75544','#e3c67b','#7292a6'][i%3],2.3);
    else if(dept==='TOOLS'){miniBox(px,py,z,['#ab543d','#343f49','#a78d5d'][i%3],.27,.35,5)}
    else if(dept==='PLUMBING'){bolt(px,py,z,i%2?'#91a7a7':'#d5c8a1')}
    else if(dept==='ELECTRICAL'){miniBox(px,py,z,i%2?'#547b90':'#c8b989',.28,.32,6)}
    else miniBox(px,py,z,i%2?'#b8ae93':'#697b78',.29,.33,5);
   }
  }
  label(x+.5,y+h-.6,49,dept||'HARDWARE','#f4e9da','#46595d',51)
 }
 function checkout(o){
  shadow(o.x,o.y,o.w,o.h);
  solid(o.x,o.y,o.w,o.h,18,'#afa48b','#675e50','#8b7b64');
  surface(o.x+.12,o.y+.14,o.w*.46,o.h*.6,18.3,'#2b3034','#111c20');
  // Till, monitor, barcode scanner, receipt spool & card machine.
  solid(o.x+1.05,o.y+.15,.42,.37,7,'#a5b1ab','#66787b');
  const screen=P(o.x+1.28,o.y+.23,36);
  ctx.fillStyle='#263f44';ctx.fillRect(screen.x-8*Z(),screen.y-9*Z(),16*Z(),12*Z());
  ctx.fillStyle='#77c8a3';ctx.fillRect(screen.x-5*Z(),screen.y-6*Z(),10*Z(),2.5*Z());
  miniBox(o.x+1.48,o.y+.49,21,'#d8dbcf',.19,.23,3);
  label(o.x+o.w*.5,o.y+.17,24,'CHECKOUT','#fff5e8','#a64d3e',43);
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
  if(type==='shelf'){rack(x,y,w,h,o.department,o.stock);return}
  if(type==='checkout'){checkout(o);return}
  if(type==='serviceDesk'){
   solid(x,y,w,h,22,'#b1bcbc','#6d7778','#8f9b9a');
   surface(x+.1,y+.1,w-.2,h-.2,23,'#d5cec0','#8e9994');label(x+1,y,31,'CUSTOMER SERVICE','#fff8e9','#456b73',77);
   miniBox(x+.3,y+.28,27,'#354e59',.45,.33,7);miniBox(x+1.15,y+.33,27,'#e8dec7',.25,.32,3)
  }else if(type==='paintMixer'){
   solid(x,y,1,1,18,'#bdc5c0','#737e80');miniCan(x+.35,y+.4,24,'#bd4e3c',5);
   miniBox(x+.25,y+.23,31,'#4d6973',.48,.28,13);label(x+.5,y+.55,47,'COLOR MIX','#f4f4e3','#546e74',49)
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
   if(type==='office'){miniBox(x+.4,y+.3,26,'#465860',.63,.3,8);miniBox(x+1.35,y+.3,23,'#d7d7ca',.24,.28,2)}
   else{for(let i=0;i<4;i++)drawItem(['hammer','wrench','flashlight','gloves'][i],x+.3+i*.37,y+.4,24)}
  }else if(type==='lockers'){
   solid(x,y,w,h,48,'#91a5ac','#667b80','#81979a');
   for(let i=0;i<4;i++){const k=P(x+i*.47,y+.16,31);ctx.fillStyle='#54696d';ctx.fillRect(k.x-4*Z(),k.y-8*Z(),8*Z(),14*Z());
    line({x:k.x+2*Z(),y:k.y},{x:k.x+2*Z(),y:k.y+5*Z()},'#d9e3e0',1.5)}
  }else if(type==='vending'||type==='drinkCooler'){
   solid(x,y,w,h,49,type==='vending'?'#aa4b40':'#d2dad6','#56686d','#859395');
   const a=P(x+.1,y+.07,40),b=P(x+.82,y+.07,40),c=P(x+.82,y+.07,11),d=P(x+.1,y+.07,11);
   poly([a,b,c,d],'#254753','#819a99',1.5);
   for(let row=0;row<4;row++)for(let col=0;col<3;col++)miniCan(x+.22+col*.23,y+.08,17+row*6,['#d2b774','#e5e5d5','#8ab8c9'][col],1.3);
   label(x+.49,y+.15,50,type==='vending'?'SNACKS':'DRINKS','#eee5d2',type==='vending'?'#943e38':'#51818b',38)
  }else if(type==='table'){
   solid(x,y,w,h,17,'#aa8968','#6b5949');for(let i=0;i<2;i++)miniCan(x+.4+i*.8,y+.4,21,'#d5d8cb',3);
   for(let i=0;i<2;i++)solid(x+i*1.3,y+.85,.44,.39,10,'#5b6e71')
  }else if(type==='sink'){
   solid(x,y,w,h,27,'#c9d0c8','#8c9a95');const p=P(x+.5,y+.4,29);ellipse(p.x,p.y,10,5,'#8ca7a9','#e4eee8');
   line(P(x+.47,y+.32,34),P(x+.47,y+.32,44),'#bfcac8',2);line(P(x+.47,y+.32,44),P(x+.57,y+.43,44),'#bcc8c7',2)
  }else if(type==='restroom'){
   solid(x,y,1,1,11,'#e9e7db','#b7bdb8');ellipse(P(x+.45,y+.5,15).x,P(x+.45,y+.5,15).y,9,5,'#ecefe9','#819a9b');
   solid(x+.1,y+.7,.8,.2,25,'#ecf0e9')
  }else if(type==='plants'||type==='gardenDesk'){
   solid(x,y,w,h,type==='plants'?9:19,type==='plants'?'#a38b68':'#829784','#615c48');
   plants(x+.17,y+.18,type==='plants'?13:23,Math.min(9,Math.round(w*h*2)+2))
  }else if(type==='endcap'||type==='hardwareBins'){
   solid(x,y,w,h,36,'#65757a','#3d555a');for(let i=0;i<7;i++){
    miniBox(x+.12+(i%2)*.37,y+.1+Math.floor(i/2)*.32,40-(i%3)*9,
      ['#d6b66c','#6d9da4','#d17b59'][i%3],.32,.26,6)}
   label(x+.5,y+.4,44,o.department||'HARDWARE','#eceddb','#455f64',47)
  }else if(type==='bucketStack'){
   for(let i=0;i<4;i++)miniCan(x+.18+i%2*.45,y+.18+Math.floor(i/2)*.4,8,'#dadbd0',7)
  }else if(type==='lumberRack'){
   solid(x,y,w,h,8,'#837866','#565447');for(let i=0;i<6;i++){
    solid(x+.12,y+.1+i*.13,w-.25,.12,12+i*3,'#c09e6c','#8a684c')}
  }else if(type==='toolCabinet'){
   solid(x,y,w,h,33,'#a34438','#733c37','#974a3e');
   for(let i=0;i<3;i++)line(P(x+.13,y+.1+i*.26,22),P(x+1.75,y+.1+i*.26,22),'#d0cbb4',1.5)
   ;label(x+1,y+.15,39,'TOOLS','#e5e6d8','#6b3331',47)
  }else if(type==='safetyStation'){
   solid(x,y,w,h,28,'#e6e9dc','#b8c5c0');label(x+.5,y+.3,35,'FIRST AID','#ebfff5','#51866c',42);
   miniCan(x+.52,y+.55,28,'#c94940',4)
  }else if(type==='utilityCart'){
   solid(x,y,w,h,13,'#60878d','#49636a');miniBox(x+.1,y+.12,18,'#b8ae90',.32,.44,5);
   const p=P(x+.7,y+.7);ellipse(p.x,p.y,4,4,'#26373d')
  }else{solid(x,y,w,h,20,'#a7b4ad','#6a7c7b')}
  if(o.damaged){const p=P(x+w*.5,y+h*.5,52);ellipse(p.x,p.y,5,4,'#edbb5e')}
 }
 function drawVehicle(v,t){
  if(v.type==='tree'||v.type==='shrub'){drawFoliage(v);return}
  let {x,y}=v,w=2,h=v.emergency&&v.color==='#b9594d'?4:3;
  shadow(x,y,w,h,1.15);
  // Tire locations, bumpers and roof use the same physical world footprint.
  for(const pos of [[.12,.36],[1.72,.36],[.12,h-.7],[1.72,h-.7]]){
   const p=P(x+pos[0],y+pos[1]);ellipse(p.x,p.y,7,4,'#1b292c','#101a1d');
  }
  const body=v.emergency?(v.color==='#b9594d'?'#bf4d43':v.color==='#dfd8be'?'#e0e1d9':'#4a7395'):(v.color||'#81969a');
  solid(x,y,w,h,13,body,'#465f66','#70838a');
  solid(x+.23,y+.55,1.53,Math.max(1.4,h-1.45),22,body,'#4e646a','#6c8790');
  surface(x+.35,y+.63,1.3,.55,22,'#33545b','#6d8990');
  surface(x+.35,y+h-1.25,1.3,.5,22,'#375d66','#5c7980');
  for(let side=0;side<2;side++){
   const head=P(x+side*1.65,y+.08,13);
   ellipse(head.x,head.y,4,2,'#ede1bb','#928f7d');
   const rear=P(x+side*1.65,y+h-.1,13);ellipse(rear.x,rear.y,3,2,'#b14e44');
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
  const z=68,a=P(x-.95,y-.12,z),b=P(x+.95,y-.12,z);
  const c=P(x+.95,y-.12,z-18),d=P(x-.95,y-.12,z-18);
  const leftTop=P(x-.6,y-.12,z+17),rightTop=P(x+.6,y-.12,z+17);
  line(leftTop,P(x-.6,y-.12,z),'#b7c3b8',1.7);
  line(rightTop,P(x+.6,y-.12,z),'#b7c3b8',1.7);
  poly([a,b,c,d],'#e8e8dc','#4b6669',1.8);
  line(P(x-.91,y-.12,z-3),P(x+.91,y-.12,z-3),accent,3);
  const mid=P(x,y-.12,z-10);
  ctx.font=`bold ${Math.max(8,10*Z())}px system-ui,sans-serif`;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#2d4549';
  ctx.fillText(name,mid.x,mid.y,86*Z())
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
