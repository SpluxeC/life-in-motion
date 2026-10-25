// Finalized Life in Motion god-power rules. All timers are simulation time.
import {walkable,nearestOpen,pathTo} from './world.js';
export const POWER_LIST=[
 {id:'suspicion',name:'Suspicion',cost:4,priceRange:'4–22',targets:['npc']},
 {id:'anger',name:'Frustration',cost:6,targets:['npc']},
 {id:'whisper',name:'Whisper Doubt',cost:0,targets:['npc'],cooldown:12},
 {id:'command',name:'Whisper Command',cost:3,priceRange:'3–20',targets:['npc']},
 {id:'sabotage',name:'Sabotage Equipment',cost:24,targets:['fixture','door','prop','sign']},
 {id:'hazard',name:'Environmental Hazard',cost:18,targets:['tile'],cooldown:10}
];
const SEVERITY=['Minor','Moderate','Serious','Extreme'];
const PRICES={Minor:4,Moderate:8,Serious:14,Extreme:22};
export const SUSPICION_OPTIONS={
 universal:{
  Minor:["The NPC is rude behind people's backs.","The NPC takes advantage of others.","The NPC frequently breaks small promises.","The NPC deliberately ignores people."],
  Moderate:["The NPC steals small items.","The NPC deliberately sabotages other people's work.","The NPC lies to get others in trouble.","The NPC secretly takes credit for others' accomplishments."],
  Serious:["The NPC physically attacked someone.","The NPC deliberately caused a dangerous accident.","The NPC committed a serious theft against another person.","The NPC tampered with safety equipment."],
  Extreme:["The NPC has secretly murdered someone.","The NPC is planning a deadly attack.","The NPC deliberately started a dangerous fire.","The NPC is conspiring to cause a mass-casualty incident."]
 },
 employee:["Deliberately leaves the hardest tasks for coworkers.","Secretly changes coworkers' schedules to get them disciplined.","Knowingly sends coworkers into dangerous working conditions.","Is planning to trap employees inside the store during a deadly incident."],
 customer:["Secretly switches price tags to get discounts.","Fakes damaged merchandise to demand fraudulent refunds.","Deliberately tampers with products that could injure another customer.","Is planning to start a deadly fire inside the store."],
 police:["Frequently intimidates civilians for amusement.","Threatens people into making false statements.","Plants evidence to frame innocent people.","Is planning to deliberately kill an innocent civilian and claim self-defense."],
 firefighter:["Deliberately leaves unpleasant station duties for other firefighters.","Falsifies emergency response reports to conceal mistakes.","Secretly damages firefighting equipment to sabotage coworkers.","Is planning to deliberately delay a rescue operation so someone dies."],
 paramedic:["Deliberately leaves unpleasant medical duties for coworkers.","Falsifies patient treatment records to hide mistakes.","Secretly steals essential medical supplies, leaving patients without proper care.","Is planning to intentionally sabotage a lifesaving medical intervention."]
};
export function accusationsFor(n){
 const result=[];
 for(const severity of SEVERITY){
  SUSPICION_OPTIONS.universal[severity].forEach((label,i)=>result.push({id:'universal-'+severity+'-'+i,label,severity,cost:PRICES[severity]}));
  if(SUSPICION_OPTIONS[n?.role])result.push({id:n.role+'-'+severity,label:SUSPICION_OPTIONS[n.role][SEVERITY.indexOf(severity)],severity,cost:PRICES[severity]});
 }
 return result;
}
export const COMMAND_OPTIONS=[
 {id:'move',name:'Go to a location',cost:3,target:'tile'},
 {id:'approach',name:'Approach NPC',cost:3,target:'npc'},
 {id:'leave',name:'Leave area',cost:3,target:'tile'},
 {id:'interact',name:'Interact with object',cost:4,target:'object'},
 {id:'talk',name:'Start conversation',cost:4,target:'npc'},
 {id:'insult',name:'Insult someone',cost:6,target:'npc'},
 {id:'argue',name:'Start an argument',cost:6,target:'npc'},
 {id:'annoy',name:'Deliberately annoy someone',cost:6,target:'npc'},
 {id:'refuse',name:'Refuse customers',cost:9,target:null,role:'employee'},
 {id:'abandon',name:'Abandon work',cost:9,target:null,role:'employee'},
 {id:'steal',name:'Steal item',cost:10,target:'object'},
 {id:'vandalize',name:'Vandalize property',cost:14,target:'object'},
 {id:'sabotage',name:'Sabotage equipment',cost:16,target:'object'},
 {id:'attack',name:'Attack another NPC',cost:18,target:'npc'},
 {id:'accident',name:'Deliberately cause an accident',cost:20,target:'object'}
];
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
export const powerCost=(id,detail)=>id==='suspicion'?PRICES[detail?.severity]||4:id==='command'?COMMAND_OPTIONS.find(a=>a.id===detail?.action)?.cost||3:POWER_LIST.find(p=>p.id===id)?.cost||0;
const byId=(g,id)=>g.npcs.find(n=>n.id===id);
const objById=(g,id)=>[...g.world.fixtures,...g.world.props,...g.world.doors].find(o=>o.id===id);
const isObjectFree=(g,x,y)=>walkable(g.world,x,y)&&
 !g.world.doors.some(d=>x>=d.x&&x<d.x+(d.w||1)&&y>=d.y&&y<d.y+(d.h||1))&&
 !g.world.props.some(o=>x>=Math.round(o.x)&&x<Math.round(o.x)+(o.w||1)&&y>=Math.round(o.y)&&y<Math.round(o.y)+(o.h||1))&&
 !g.npcs.some(n=>n.alive&&!n.medicalUntil&&Math.round(n.x)===x&&Math.round(n.y)===y)&&
 !g.world.hazards.some(h=>h.life>0&&h.x===x&&h.y===y);
export function sabotageObject(g,target,ctx){
 const doors=target?.id?.startsWith('door-group-')?g.world.doors.filter(d=>d.pairId===target.id.slice('door-group-'.length)):g.world.doors.filter(d=>d.id===target?.id);
 if(doors.length){
  if(doors.some(d=>d.lockUntil>g.elapsed))return false;
  for(const d of doors){d.lockUntil=g.elapsed+15;d.locked=true;d.open=0;d.target=0;d.forceUntil=0}
  ctx.log(g,'A door locked for 15 seconds.');return true;
 }
 const obj=objById(g,target?.id),id=obj?.id||(target?.type==='departmentSign'?target.id:null);
 if(!id)return false;
 g.world.sabotages??=[];
 if(g.world.sabotages.some(s=>s.id===id)||obj?.damaged||obj?.destroyed||obj?.repairUntil>g.elapsed)return false;
 g.world.sabotages.push({id,x:target.x,y:target.y,type:target.type||obj?.type,armedAt:g.elapsed});
 ctx.log(g,'An object was sabotaged.');return true;
}
export function godPowerApply(g,id,target,detail,ctx){
 const p=POWER_LIST.find(o=>o.id===id);if(!p)return{ok:false,message:'Unknown power'};
 if(g.paused||g.completed&&!g.freeplay)return{ok:false,message:'Resume the game before using God Powers'};
 const n=byId(g,target?.id),f=g.world.fixtures.find(o=>o.id===target?.id),d=g.world.doors.find(o=>o.id===target?.id),prop=g.world.props.find(o=>o.id===target?.id);
 const type=n?'npc':f?'fixture':d||target?.id?.startsWith('door-group-')?'door':prop?'prop':target?.type==='departmentSign'?'sign':'tile';
 if(!p.targets.includes(type)||n&&!n.alive)return{ok:false,message:'Invalid target'};
 if((g.cooldowns[id]||0)>g.elapsed)return{ok:false,message:'Power is cooling down'};
 let option,accusation;
 if(id==='suspicion')accusation=accusationsFor(n).find(a=>a.id===detail?.accusation)||accusationsFor(n)[0];
 if(id==='command'){
  option=COMMAND_OPTIONS.find(a=>a.id===detail?.action)||COMMAND_OPTIONS[0];
  if(option.role&&n.role!==option.role)return{ok:false,message:'That command requires an employee'};
  if(n.command)return{ok:false,message:'NPC already has a Whisper Command'};
  if((n.commandCooldownUntil||0)>g.elapsed)return{ok:false,message:'Command target is cooling down'};
  if(option.target==='npc'&&(!byId(g,detail?.targetId)?.alive||detail.targetId===n.id))return{ok:false,message:'Choose another living NPC'};
  if(option.target==='object'&&!objById(g,detail?.targetId))return{ok:false,message:'Choose a valid object'};
  if(option.target==='tile'&&(!Number.isInteger(detail?.x)||!Number.isInteger(detail?.y)||!walkable(g.world,detail.x,detail.y)))return{ok:false,message:'Choose open ground'};
 }
 if(id==='whisper'&&(n.doubtCooldownUntil||0)>g.elapsed)return{ok:false,message:'This NPC is temporarily resistant to Whisper Doubt'};
 if(id==='hazard'){
  if(!Number.isInteger(target?.x)||!Number.isInteger(target?.y)||!isObjectFree(g,target.x,target.y))return{ok:false,message:'Choose an empty, unoccupied tile'};
  if(!['fire','spill','electric'].includes(detail?.kind))return{ok:false,message:'Choose a hazard type'};
  const floor=g.world.ground.find(t=>t.x===target.x&&t.y===target.y);
  if(detail.kind==='electric'&&!['store','employee','garden','loading'].includes(floor?.area))return{ok:false,message:'A hanging wire requires an overhead structure'};
 }
 if(id==='sabotage'&&g.world.sabotages?.some(s=>s.id===target?.id))return{ok:false,message:'Object already sabotaged'};
 const cost=id==='suspicion'?accusation.cost:id==='command'?option.cost:p.cost;
 if(g.energy<cost)return{ok:false,message:'Not enough God Energy ('+cost+' required)'};
 if(id==='sabotage'&&!sabotageObject(g,target,ctx))return{ok:false,message:'That object cannot be sabotaged now'};
 if(id==='hazard'&&!ctx.addHazard(g,target.x,target.y,detail.kind,'god'))return{ok:false,message:'Cannot create hazard there'};
 g.energy-=cost;g.stats.powers++;
 if(p.cooldown)g.cooldowns[id]=g.elapsed+p.cooldown;
 if(id==='anger'){
  n.frustration=clamp((n.frustration||0)+25);
  n.emotion.anger=clamp(n.emotion.anger+30);n.emotion.stress=clamp(n.emotion.stress+25);n.emotion.fear=clamp(n.emotion.fear-12);
  ctx.memory(n,'emotion',null,'Felt intensely frustrated');ctx.reward(g,2,'emotional influence');
 }
 if(id==='whisper'){
  n.doubtStacks=clamp((n.doubtStacks||0)+1,0,8);
  n.doubt=clamp((n.doubt||0)+30/(1+n.doubtStacks*.16));
  n.emotion.stress=clamp(n.emotion.stress+8);
  n.doubtCooldownUntil=g.elapsed+12+n.doubtStacks*6;
  ctx.memory(n,'emotion',null,'Experienced an unsettling loss of confidence');
  ctx.reward(g,2,'whispered doubt');
 }
 if(id==='suspicion'){
  const rumorId=n.id+':'+accusation.id;
  const closest=g.npcs.filter(o=>o.alive&&o.id!==n.id).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y)).slice(0,4);
  for(const listener of closest){
   listener.suspicions??=[];
   const existing=listener.suspicions.find(s=>s.id===rumorId);
   if(existing)existing.until=g.elapsed+100;
   else listener.suspicions.push({id:rumorId,subject:n.id,label:accusation.label,severity:accusation.severity,source:'god',until:g.elapsed+100});
   ctx.memory(listener,'rumor',n.id,'Heard an accusation about '+n.name+': '+accusation.label,2);
  }
  ctx.log(g,'An accusation about '+n.name+' reached '+closest.length+' nearby people.');
 }
 if(id==='command'){
  const dangerous=['steal','vandalize','sabotage','attack','accident'].includes(option.id);
  const resistance=clamp((dangerous?26:8)+(dangerous?n.traits.compassion*.3:0)+n.emotion.fear*.17-(dangerous?n.traits.aggression*.18:0),4,90);
  if(g.random()*100<resistance){
   const refund=Math.floor(cost/2);g.energy+=refund;
   n.commandCooldownUntil=g.elapsed+(dangerous?25:8);
   ctx.log(g,n.name+' resisted a Whisper Command.');
   return{ok:true,message:n.name+' immediately refused. '+refund+' energy refunded.'};
  }
  const duration=dangerous?90:option.target==='tile'?45:option.target==='object'?45:option.target==='npc'?30:25;
  n.command={action:option.id,targetId:detail?.targetId||null,x:detail?.x,y:detail?.y,dangerous,until:g.elapsed+duration,readyAt:g.elapsed+2,status:'Waiting'};
  n.task=null;n.think=3;
  ctx.memory(n,'command',null,'Felt an unusual impulse to '+option.name.toLowerCase());
 }
 ctx.log(g,'God Power: '+p.name+' ('+cost+' energy)');
 return{ok:true,message:p.name+' activated ('+cost+' energy)'};
}
export function spreadSuspicion(g,speaker,listener,ctx){
 for(const suspicion of speaker.suspicions||[]){
  if(suspicion.until<=g.elapsed||listener.id===suspicion.subject)continue;
  listener.suspicions??=[];
  const existing=listener.suspicions.find(s=>s.id===suspicion.id);
  if(existing){existing.until=Math.max(existing.until,g.elapsed+35);continue}
  const odds=clamp(30+(listener.relationships[speaker.id]||0)*.18+(listener.traits.suspicion-40)*.3,8,82)/100;
  if(g.random()<odds){
   listener.suspicions.push({...suspicion,source:speaker.id,until:g.elapsed+85});
   const accused=byId(g,suspicion.subject);
   if(accused){const impact={Minor:4,Moderate:9,Serious:15,Extreme:22}[suspicion.severity]||4;listener.relationships[accused.id]=clamp((listener.relationships[accused.id]||0)-impact,-100,100);ctx.memory(listener,'rumor',accused.id,'Heard accusation about '+accused.name)}
  }
 }
}
function destination(g,c){
 const npc=byId(g,c.targetId),obj=objById(g,c.targetId);
 return npc?{x:npc.x,y:npc.y}:obj?{x:obj.x+1,y:obj.y+1}:Number.isInteger(c.x)?{x:c.x,y:c.y}:null;
}
function runCommand(g,n,c,ctx){
 const victim=byId(g,c.targetId),obj=objById(g,c.targetId);
 if(c.action==='attack'&&victim){ctx.injury(g,victim,16+n.traits.aggression*.22,'assault',n);ctx.incident(g,'crime')}
 if(['insult','argue','annoy'].includes(c.action)&&victim){victim.emotion.anger=clamp(victim.emotion.anger+22);victim.relationships[n.id]=clamp((victim.relationships[n.id]||0)-24,-100,100)}
 if(c.action==='steal'){n.inventory.push('hammer');n.inventory=n.inventory.slice(-4);ctx.incident(g,'crime')}
 if(['vandalize','accident'].includes(c.action)&&obj){obj.damaged=true;obj.repairUntil=g.elapsed+25;ctx.incident(g,'crime')}
 if(c.action==='sabotage'&&obj)sabotageObject(g,obj,ctx);
 if(c.action==='refuse'||c.action==='abandon')n.activity=c.action==='refuse'?'Refusing customers':'Abandoning work';
 if(['steal','vandalize','sabotage','attack','accident'].includes(c.action))ctx.incident(g,'crime');
 ctx.memory(n,'command',c.targetId||null,'Remembers performing '+c.action,2);
 if(victim)ctx.memory(victim,'conversation',n.id,'Encountered '+n.name+' during '+c.action,2);
 n.command=null;n.commandCooldownUntil=g.elapsed+(c.dangerous?25:8);
 ctx.log(g,n.name+' completed '+c.action+' under an unusual impulse.');
}
export function tickGodPowers(g,dt,ctx){
 g.world.sabotages??=[];
 for(const d of g.world.doors)if(d.lockUntil>g.elapsed){d.locked=true;d.open=0;d.target=0;d.forceUntil=0}else if(d.lockUntil){d.lockUntil=0;d.locked=false}
 for(const o of [...g.world.fixtures,...g.world.props])if(o.repairUntil&&g.elapsed>=o.repairUntil){o.damaged=false;o.destroyed=false;o.repairUntil=0}
 for(const s of [...g.world.sabotages]){
  const near=g.npcs.find(n=>n.alive&&!n.medicalUntil&&Math.hypot(n.x-s.x,n.y-s.y)<1.5);
  if(!near)continue;
  const obj=objById(g,s.id),explosive=/saw|mixer|cutter|mower|forklift|machine|car|vehicle|generator|electric/i.test(s.type);
  const falling=/sign|shelf|rack|pallet|stack|cabinet/i.test(s.type);
  if(explosive&&!/Using|Working|Operating/i.test(near.activity||''))continue;
  for(const n of g.npcs)if(n.alive&&Math.hypot(n.x-s.x,n.y-s.y)<(explosive?2.3:1.25))
   ctx.injury(g,n,(explosive?42:falling?29:15)*(.6+g.random()*.9),'sabotaged '+s.type);
  if(explosive){const at=nearestOpen(g.world,s.x+1,s.y);ctx.addHazard(g,at.x,at.y,'fire','sabotage');ctx.incident(g,'fire')}else ctx.incident(g,'injury');
  if(obj){obj.damaged=true;obj.destroyed=explosive&&g.random()<.5;obj.repairUntil=g.elapsed+(obj.destroyed?55:26)}
  g.world.sabotages.splice(g.world.sabotages.indexOf(s),1);
  ctx.log(g,'Sabotage triggered: '+s.id);
 }
 for(const n of g.npcs){
  if(!n.alive)continue;
  n.frustration=Math.max(0,(n.frustration||0)-dt*.7);
  n.doubt=Math.max(0,(n.doubt||0)-dt*(n.medicalUntil?1.3:.1));
  n.suspicions=(n.suspicions||[]).filter(s=>s.until>g.elapsed);
  if(n.doubt>40)n.emotion.stress=clamp(n.emotion.stress+dt*.22);
  if(n.doubt>74&&!n.medicalUntil&&g.npcs.some(o=>o.alive&&o.role==='paramedic'&&Math.hypot(o.x-n.x,o.y-n.y)<3)&&g.random()<dt*.035){
   n.medicalUntil=g.elapsed+30+g.random()*30;n.command=null;n.path=[];n.activity='On medical leave';
   ctx.incident(g,'injury');ctx.log(g,n.name+' left for crisis care.');
  }
  if(n.medicalUntil){if(n.medicalUntil>g.elapsed)continue;n.medicalUntil=0;n.doubt=Math.min(n.doubt,35);n.doubtCooldownUntil=Math.max(n.doubtCooldownUntil||0,g.elapsed+30);n.activity='Recovering from treatment'}
  const c=n.command;
  if(!c)continue;
  if(g.elapsed>=c.until){n.command=null;n.commandCooldownUntil=g.elapsed+(c.dangerous?25:8);n.path=[];n.activity='Returning to routine';ctx.log(g,n.name+"'s command expired.");continue}
  const dest=destination(g,c);
  const danger=g.world.hazards.some(h=>h.life>0&&Math.hypot(n.x-h.x,n.y-h.y)<.9);
  if(danger&&n.traits.bravery<70){c.status='Hesitating';continue}
  if(c.dangerous&&g.random()<dt*.008*(1+n.traits.compassion/80+n.emotion.fear/50)){
   n.command=null;n.commandCooldownUntil=g.elapsed+25;n.path=[];n.activity='Resisted an impulse';continue
  }
  if(dest&&Math.hypot(n.rx-dest.x,n.ry-dest.y)>1.7){
   if(!n.path.length||!n.target||Math.hypot(n.target.x-dest.x,n.target.y-dest.y)>2){const p=nearestOpen(g.world,dest.x,dest.y);n.path=pathTo(g.world,n,p);n.target=p}
   c.status='Moving';n.activity='Following an impulse';continue;
  }
  c.status=g.elapsed<c.readyAt?'Waiting':'Acting';
  if(g.elapsed>=c.readyAt)runCommand(g,n,c,ctx);
 }
}
export function autoSabotage(g,n,ctx){
 if(n.role==='paramedic'||n.role==='firefighter')return false;
 if(n.traits.aggression<68||n.emotion.anger<72||g.random()>.018)return false;
 const nearby=g.world.fixtures.filter(f=>Math.hypot(n.x-f.x,n.y-f.y)<5&&!f.damaged&&!f.destroyed&&!g.world.sabotages?.some(s=>s.id===f.id));
 const f=nearby[Math.floor(g.random()*nearby.length)];
 if(f&&sabotageObject(g,f,ctx)){ctx.memory(n,'sabotage',f.id,'Secretly sabotaged '+f.type);ctx.incident(g,'crime');return true}
 return false;
}
