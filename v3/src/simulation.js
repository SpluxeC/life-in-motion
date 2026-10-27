import {assignPrimaryJobs,assignCoverage,effectiveDuty} from './employee-jobs.js?v=jobs-20261027-1';
import {tickDamageRecovery,debrisBlocksMovement} from './damage-recovery.js';
import {nearestOpen,pathTo,doorAt,fixtureAt,walkable,key} from './world.js?v=landscape-sidewalk-road-20261027-1';
import {initializeRoutine,chooseRoutine,updateRoutine} from './routines.js?v=seven-phase-release-20261026-1';
import {POWER_LIST,godPowerApply,tickGodPowers,spreadSuspicion,autoSabotage} from './god-powers.js?v=seven-phase-release-20261026-1';
import {updateElectricalZones} from './scene-lighting.js?v=seven-phase-release-20261026-1';
export {POWER_LIST} from './god-powers.js?v=seven-phase-release-20261026-1';
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export const ITEMS=[
 {id:'hammer',name:'Hammer',kind:'tool',damage:15},{id:'wrench',name:'Wrench',kind:'tool',damage:12},{id:'broom',name:'Broom',kind:'tool',damage:7},
 {id:'flashlight',name:'Flashlight',kind:'tool',damage:5},{id:'paint',name:'Paint Can',kind:'material',damage:4},
 {id:'bandage',name:'Bandage',kind:'medical',heal:16},{id:'water',name:'Water Bottle',kind:'consumable',heal:4},
 {id:'phone',name:'Phone',kind:'communication'},{id:'gloves',name:'Work Gloves',kind:'clothing'}
];
const FIRST=['Mason','Jordan','Taylor','Casey','Avery','Jamie','Robin','Morgan','Alex','Riley','Sam','Quinn','Ellis','Drew','Harper','Cameron'];
const LAST=['Reed','Parker','Jones','Moore','Cruz','Bennett','West','Stone','Gray','Price','Hall','Brooks'];
export function rngFor(seed){let state=seed>>>0;const random=()=>{state=(state+0x6D2B79F5)|0;let t=Math.imul(state^(state>>>15),1|state);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296};random.state=()=>state>>>0;random.restore=s=>{state=s|0};return random}
export function makeGame(world,options={}){
 const seed=options.seed||Math.floor(Math.random()*2147483647),random=rngFor(seed);
 const game={world,seed,random,elapsed:0,clockStartMinutes:Number.isFinite(+options.clockStartMinutes)?+options.clockStartMinutes:480,minutesPerSecond:1,speed:1,paused:false,energy:35,energyEarned:0,npcs:[],respondersRemaining:{police:3,fire:3,medic:3},pending:[],dispatchCooldown:0,log:[],stats:{deaths:0,injuries:0,incidents:0,powers:0,chains:0},winner:false,freeplay:false,completed:false,nextId:0,cooldowns:{},selected:null};
 const countStaff=clamp(+(options.staff??8),1,16),countCustomers=clamp(+(options.customers??12),1,20);
 for(let i=0;i<countStaff+countCustomers;i++)spawnNPC(game,i<countStaff?'employee':'customer');
 assignPrimaryJobs(game.npcs.filter(n=>n.role==='employee'));
 for(const n of game.npcs.filter(n=>n.role==='employee'))n.duty=effectiveDuty(n);
 for(let n of game.npcs){n.relationships={};for(let o of game.npcs)if(o!==n)n.relationships[o.id]=Math.round(random()*120-40)}
 log(game,'Hardware Store opened. '+game.npcs.length+' NPCs are active.');
 return game;
}
export function log(g,text){g.log.unshift({time:Math.floor(g.elapsed),text});g.log.length=Math.min(g.log.length,100)}
export function spawnNPC(g,role='customer'){
 const r=g.random,i=g.nextId++;
 const coworkerCount=g.npcs.filter(o=>o.role==='employee').length;
 const shopperCount=g.npcs.filter(o=>o.role==='customer').length;
 const lotStops=[10,18,26,34,42,50,58];
 const lotX=lotStops[shopperCount%lotStops.length];
 const pos=role==='customer'?nearestOpen(g.world,lotX,8):
  nearestOpen(g.world,role==='employee'?12+Math.floor(r()*19):4,role==='employee'?15+Math.floor(r()*11):5);
 const traits={aggression:Math.round(r()*100),bravery:Math.round(r()*100),compassion:Math.round(r()*100),suspicion:Math.round(r()*100),loyalty:Math.round(r()*100)};
 const hairColors=['#211a17','#37271f','#573829','#76503a','#9b704a','#b18c60','#d3b178','#e2cf9d','#934b31','#a7a39a','#e5e1d7'];
 const hairStyles=['short','sidePart','curly','wavy','bob','ponytail','buzz','bun','long','messy'];
 const hairColor=hairColors[Math.floor(r()*hairColors.length)],hairStyle=hairStyles[Math.floor(r()*hairStyles.length)];
 // Three RNG samples, as before: select a starting mood and vary its
 // intensity without changing the deterministic sequence for the rest of the round.
 const moodRoll=r(),moodStrength=r(),moodVariation=r();
 let emotion;
 if(moodRoll<.18)emotion={anger:4+moodStrength*13,fear:3+moodVariation*13,stress:4+moodStrength*15}; // Calm
 else if(moodRoll<.38)emotion={anger:6+moodStrength*17,fear:35+moodVariation*21,stress:17+moodStrength*14}; // Nervous
 else if(moodRoll<.58)emotion={anger:38+moodStrength*20,fear:4+moodVariation*16,stress:12+moodVariation*17}; // Irritated
 else if(moodRoll<.78)emotion={anger:7+moodStrength*19,fear:10+moodVariation*19,stress:35+moodStrength*20}; // Uneasy
 else if(moodRoll<.9)emotion={anger:13+moodStrength*15,fear:14+moodVariation*15,stress:63+moodStrength*16}; // Stressed
 else if(moodRoll<.95)emotion={anger:66+moodStrength*16,fear:4+moodVariation*15,stress:30+moodVariation*18}; // Furious
 else emotion={anger:5+moodVariation*17,fear:65+moodStrength*16,stress:39+moodVariation*17}; // Terrified
 const n={hairColor,hairStyle,facing:'right',walkDistance:0,id:'npc-'+i,name:FIRST[Math.floor(r()*FIRST.length)]+' '+LAST[Math.floor(r()*LAST.length)],role,x:pos.x,y:pos.y,rx:pos.x,ry:pos.y,health:100,bleeding:0,pain:0,unconscious:0,alive:true,arrested:false,detention:0,emotion,traits,relationships:{},memory:[],inventory:r()<.6?[ITEMS[Math.floor(r()*ITEMS.length)].id]:[],path:[],target:null,activity:role==='employee'?'Working':'Browsing',think:1+r()*3,callCooldown:0,recovery:0,panic:0};
 if(role==='employee'||role==='customer')initializeRoutine(n,role==='employee'?coworkerCount:shopperCount);
 g.npcs.push(n);return n;
}
function memory(n,type,subject,text,strength=1){n.memory.unshift({type,subject,text,strength,age:0});n.memory.length=Math.min(n.memory.length,22)}
function reward(g,amount,reason){if(g.completed)return;g.energy=clamp(g.energy+amount,0,250);g.energyEarned+=amount;if(reason)log(g,'+'+amount+' God Energy · '+reason)}
function nearest(g,n,filter=()=>true){let candidates=g.npcs.filter(o=>o!==n&&o.alive&&filter(o)).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y));return candidates[0]}
function goto(g,n,dest){let target=nearestOpen(g.world,dest.x,dest.y);n.path=pathTo(g.world,n,target);n.target=target}
function clearCleanup(g,n){
 const old=(g.world.hazards||[]).find(h=>h.id===n.cleaningTarget);
 if(old&&old.cleanerId===n.id)old.cleanerId=null;
 n.cleaningTarget=null;n.cleaning=false;n.cleaningPhase=0;
}
function assignSpillCleanup(g,n){
 if(n.role!=='employee')return false;
 const w=g.world;
 const existing=w.hazards.find(h=>h.id===n.cleaningTarget&&h.kind==='spill'&&h.life>0);
 if(existing){n.activity=n.cleaning?'Mopping spill':'Going to clean spill';return true}
 if(n.cleaningTarget)clearCleanup(g,n);
 const candidate=w.hazards.filter(h=>h.kind==='spill'&&h.life>0&&
  (!h.cleanerId||h.cleanerId===n.id||!g.npcs.some(o=>o.id===h.cleanerId&&o.alive&&!o.arrested&&o.unconscious<=0)))
  .sort((a,b)=>Math.hypot(a.x-n.rx,a.y-n.ry)-Math.hypot(b.x-n.rx,b.y-n.ry))[0];
 if(!candidate)return false;
 const spots=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]
  .map(([dx,dy])=>({x:candidate.x+dx,y:candidate.y+dy}))
  .filter(p=>walkable(w,p.x,p.y));
 const routes=spots.map(p=>({p,path:pathTo(w,n,p)}))
  .filter(o=>o.path.length>0||Math.hypot(n.rx-o.p.x,n.ry-o.p.y)<.8)
  .sort((a,b)=>a.path.length-b.path.length);
 if(!routes.length)return false;
 candidate.cleanerId=n.id;n.cleaningTarget=candidate.id;n.cleaningPhase=0;n.cleaning=false;
 n.path=routes[0].path;n.target=routes[0].p;n.activity='Going to clean spill';
 return true;
}
function choose(g,n){
 const r=g.random,w=g.world;
 if(n.command)return;
 if(!n.alive||n.unconscious>0||n.arrested)return;
 const danger=w.hazards.filter(h=>h.life>0&&(n.role!=='employee'||h.kind!=='spill')&&Math.hypot(n.x-h.x,n.y-h.y)<5).sort((a,b)=>Math.hypot(n.x-a.x,n.y-a.y)-Math.hypot(n.x-b.x,n.y-b.y))[0];
 if(danger&&n.traits.bravery<55+n.emotion.fear*.25){n.task=null;n.action='panic';if(n.cleaningTarget)clearCleanup(g,n);n.emotion.fear=clamp(n.emotion.fear+24);n.panic=10;let flee=nearestOpen(w,n.x+(n.x-danger.x>0?7:-7),n.y+(n.y-danger.y>0?7:-7));goto(g,n,flee);n.activity='Fleeing '+danger.kind;return}
 if(n.role==='employee'&&n.frustration>75&&n.emotion.anger>65&&r()<.3){n.activity='Refusing to help customers';return}
 if(n.role==='employee'&&assignSpillCleanup(g,n))return;
 if(autoSabotage(g,n,godContext))return;
 if(n.health<45&&n.inventory.includes('bandage')){n.health=clamp(n.health+16);n.bleeding=Math.max(0,n.bleeding-1);n.inventory.splice(n.inventory.indexOf('bandage'),1);n.activity='Treating injury';return}
 if(n.emotion.anger>64&&n.traits.aggression>35){let victim=nearest(g,n,o=>!o.arrested);if(victim&&Math.hypot(victim.x-n.x,victim.y-n.y)<5){goto(g,n,victim);n.activity='Confronting '+victim.name;return}}
 if(n.role==='police'){let suspect=g.npcs.find(o=>o.alive&&!o.arrested&&o!==n&&o.emotion.anger>72);if(suspect){goto(g,n,suspect);n.activity='Responding to suspect';return}}
 if(n.role==='firefighter'){let fire=w.hazards.find(h=>h.kind==='fire'&&h.life>0);if(fire){goto(g,n,nearestOpen(w,fire.x+2,fire.y));n.activity='Responding to fire';return}}
 if(n.role==='paramedic'){let patient=g.npcs.find(o=>o.alive&&o.health<62&&o!==n);if(patient){goto(g,n,patient);n.activity='Responding to injury';return}}
 if(n.emotion.fear>60){n.task=null;goto(g,n,nearestOpen(w,7+Math.floor(r()*27),5+Math.floor(r()*4)));n.activity='Seeking safety';return}
 if(chooseRoutine(g,n))return;
 if(r()<.22){let friend=nearest(g,n);if(friend){goto(g,n,friend);n.activity='Socializing';return}}
 if(w.drops.length&&r()<.24){let drop=w.drops[Math.floor(r()*w.drops.length)];goto(g,n,drop);n.activity='Picking up item';return}
 if(r()<.3){let o=w.fixtures[Math.floor(r()*w.fixtures.length)];goto(g,n,{x:o.x+2,y:o.y+1});n.activity=r()<.15?'Looking for something to steal':'Using '+o.type;return}
 goto(g,n,{x:4+Math.floor(r()*31),y:12+Math.floor(r()*24)});n.activity=n.role==='employee'?'Working':'Browsing';
}
function injury(g,n,amount,kind,attacker=null){if(!n||!n.alive)return;n.health=clamp(n.health-amount);n.pain=clamp(n.pain+amount*.6);n.hitReactionUntil=g.elapsed+.5;n.hitReactionAt=g.elapsed;n.bleeding=clamp(n.bleeding+(kind==='fire'?amount*.05:amount*.1),0,15);n.emotion.fear=clamp(n.emotion.fear+amount);memory(n,'injury',attacker?.id||kind,'Injured by '+kind,2);g.stats.injuries++;reward(g,Math.min(6,Math.ceil(amount/8)),'injury');if(n.health<=0)kill(g,n,kind);else if(n.health<24)n.unconscious=20+g.random()*28}
function kill(g,n,cause){if(!n.alive)return;n.alive=false;n.health=0;n.unconscious=0;n.path=[];n.activity='Deceased';g.stats.deaths++;reward(g,18,'death');log(g,n.name+' died ('+cause+').');for(let o of g.npcs)if(o.alive&&o!==n&&Math.hypot(o.x-n.x,o.y-n.y)<9){o.emotion.fear=clamp(o.emotion.fear+15);memory(o,'death',n.id,'Witnessed death of '+n.name,3)}}
function incident(g,kind,source){if(g.completed)return;g.stats.incidents++;if(g.dispatchCooldown>0)return;
 const service=kind==='fire'?'fire':kind==='injury'?'medic':'police';if(g.respondersRemaining[service]>0&&!g.pending.some(p=>p.service===service)){g.pending.push({service,time:8+g.random()*7});g.dispatchCooldown=12;log(g,'Emergency call placed: '+service+' response requested.')}
}
function dispatch(g,service){if(g.respondersRemaining[service]<=0)return;g.respondersRemaining[service]--;const role={fire:'firefighter',medic:'paramedic',police:'police'}[service];let n=spawnNPC(g,role);n.x=n.rx=4;n.y=n.ry=5;g.world.props.push({id:'response-'+n.id,type:'car',x:1,y:5,targetX:5+(g.nextId%4)*3,targetY:5,emergency:true,color:service==='fire'?'#b9594d':service==='police'?'#668ba9':'#dfd8be'});n.inventory=service==='medic'?['bandage']:service==='police'?['flashlight']:['water'];n.relationships={};const incidentSite=(g.world.damage||[]).find(d=>d.phase!=='repaired'&&['fallenSign','fallenBox'].includes(d.kind));if(incidentSite){const approach=nearestOpen(g.world,incidentSite.x+1,incidentSite.y);n.path=pathTo(g.world,n,approach);n.target=approach;n.activity='Responding to collapsed debris';n.action='walk'}log(g,role+' '+n.name+' arrived. '+g.respondersRemaining[service]+' reserve teams remain.')}
export function addHazard(g,x,y,kind='fire',source='god',root=null){
 const w=g.world;x=Math.round(x);y=Math.round(y);
 if(!walkable(w,x,y)||w.hazards.some(h=>h.x===x&&h.y===y&&h.life>0))return false;
 if(source==='god'&&(g.npcs.some(n=>n.alive&&Math.round(n.x)===x&&Math.round(n.y)===y)||w.props.some(o=>Math.round(o.x)===x&&Math.round(o.y)===y)||w.doors.some(d=>d.x===x&&d.y===y)))return false;
 const life=kind==='fire'?30+g.random()*60:60+g.random()*30;
 w.hazards.push({id:'haz-'+g.elapsed.toFixed(3)+'-'+(w.hazards.length+1),x,y,kind,life,tick:0,source,
  originX:root?.x??x,originY:root?.y??y,rootSource:root?.source||source,spread:0});
 if(source!=='chain'){log(g,'A '+kind+' hazard appeared.');incident(g,kind==='fire'?'fire':'injury')}
 return true;
}
const godContext={addHazard,injury,incident,memory,log,reward};
export function applyPower(g,id,target,secondary=null){return godPowerApply(g,id,target,secondary,godContext)}
function interact(g,n,other){if(!other||!other.alive)return;
 spreadSuspicion(g,n,other,godContext);spreadSuspicion(g,other,n,godContext);
 if(n.traits.compassion>55&&other.doubt>8)other.doubt=Math.max(0,other.doubt-1.6);
 if(other.traits.compassion>55&&n.doubt>8)n.doubt=Math.max(0,n.doubt-1.6);
 if(n.role==='police'&&other.emotion.anger>65&&!other.arrested){other.arrested=true;other.detention=60;other.path=[];other.activity='Detained by police';memory(other,'arrest',n.id,'Arrested',3);log(g,other.name+' was detained.');return}
 if(n.role==='paramedic'&&other.health<90){other.health=clamp(other.health+20);other.bleeding=Math.max(0,other.bleeding-3);other.unconscious=Math.max(0,other.unconscious-20);other.activity='Receiving medical care';log(g,other.name+' received treatment.');return}
 if(n.emotion.anger>55&&n.traits.aggression>35&&!other.arrested){let item=ITEMS.find(i=>i.id===n.inventory[0]);let damage=5+(item?.damage||0)+n.traits.aggression*.12;n.attackReactionUntil=g.elapsed+.4;n.attackReactionAt=g.elapsed;injury(g,other,damage,'fight',n);other.emotion.anger=clamp(other.emotion.anger+30);memory(other,'attack',n.id,'Attacked by '+n.name,3);n.emotion.anger=clamp(n.emotion.anger-8);reward(g,5,'fight');incident(g,'crime');return}
 let delta=(n.traits.compassion-(n.frustration||0)*.65)>40?3:-2;n.relationships[other.id]=clamp((n.relationships[other.id]||0)+delta,-100,100);n.emotion.anger=clamp(n.emotion.anger-2);if(g.random()<.07){memory(other,'conversation',n.id,'Talked to '+n.name);log(g,n.name+' spoke with '+other.name+'.')}
}
export function updateGame(g,dt){if(g.paused||g.completed&&!g.freeplay)return;
 g.elapsed+=dt;g.dispatchCooldown=Math.max(0,g.dispatchCooldown-dt);
 tickGodPowers(g,dt,godContext);
 tickDamageRecovery(g,dt);
 for(let k of Object.keys(g.cooldowns))if(g.cooldowns[k]<g.elapsed)delete g.cooldowns[k];
 for(let d of g.world.doors){
  // A door begins opening as the character approaches its planned doorway,
  // stays open while the opening is occupied and closes after a short clear period.
  // A double-width opening is one door with one animation and two
  // accessible grid tiles. Characters nearing either half trigger it.
  // Both halves of an automatic double slider react to the same approach.
  // Each leaf remains a selectable / passable tile, but they move in sync.
  const joined=d.pairId?g.world.doors.filter(other=>other.pairId===d.pairId):[d];
  const cells=[];
  for(const leaf of joined)for(let ix=0;ix<(leaf.w||1);ix++)
   for(let iy=0;iy<(leaf.h||1);iy++)cells.push({x:leaf.x+ix,y:leaf.y+iy});
  const approaching=g.npcs.some(n=>n.alive&&!n.arrested&&n.unconscious<=0&&
    cells.some(c=>Math.hypot(n.rx-c.x,n.ry-c.y)<2.4||
       (n.path||[]).slice(0,4).some(p=>p.x===c.x&&p.y===c.y&&Math.hypot(n.rx-c.x,n.ry-c.y)<4.8)));
  if(approaching&&!d.locked)d.forceUntil=Math.max(d.forceUntil||0,g.elapsed+1.7);
  d.target=d.locked?0:(approaching||(d.forceUntil||0)>g.elapsed?1:0);
  d.open=clamp(d.open+(d.target-d.open)*Math.min(1,dt*(d.target?3.7:2.2)),0,1);
}
 for(const f of g.world.fixtures)if(f.powerOutUntil&&f.powerOutUntil<=g.elapsed)f.powerOutUntil=0;
 for(let v of g.world.props){if(v.targetX!==undefined){let dx=v.targetX-v.x,dy=v.targetY-v.y,dist=Math.hypot(dx,dy);if(dist>.04){v.x+=dx/dist*Math.min(dist,dt*2);v.y+=dy/dist*Math.min(dist,dt*2)}}}
 for(let p of [...g.pending]){p.time-=dt;if(p.time<=0){dispatch(g,p.service);g.pending.splice(g.pending.indexOf(p),1)}}
 // Fire crews target active fires and reduce their remaining duration in-place.
 // Work is deterministic and advances only on simulation ticks.
 for(const crew of g.npcs){
  if(!crew.alive||crew.role!=='firefighter'||crew.unconscious>0)continue;
  const fire=g.world.hazards.filter(h=>h.kind==='fire'&&h.life>0)
   .sort((a,b)=>Math.hypot(crew.rx-a.x,crew.ry-a.y)-Math.hypot(crew.rx-b.x,crew.ry-b.y))[0];
  if(!fire)continue;
  const distance=Math.hypot(crew.rx-fire.x,crew.ry-fire.y);
  if(distance<2.2){crew.activity='Extinguishing fire';crew.action='offerHelp';crew.path=[]}
  else if(!crew.path?.length){const to=nearestOpen(g.world,fire.x+1,fire.y);crew.path=pathTo(g.world,crew,to);crew.target=to;crew.activity='Responding to fire';crew.action='walk'}
 }
 for(const h of [...g.world.hazards]){
  h.beingCleaned=false;h.life-=dt;h.tick+=dt;
  if(h.life<=0)continue;
  // Wire outages and light flicker are handled by shared local electrical zones.
  if(h.kind==='fire'){
   for(const electric of g.world.hazards)if(electric.kind==='electric'&&Math.hypot(electric.x-h.x,electric.y-h.y)<2&&g.random()<dt*.35)electric.life=0;
   for(const v of [...g.world.props,...g.world.fixtures])if(Math.hypot(v.x-h.x,v.y-h.y)<1.6&&g.random()<dt*.17){v.damaged=true;v.destroyed=v.destroyed||g.random()<.04;v.repairUntil=Math.max(v.repairUntil||0,g.elapsed+(v.destroyed?55:25))}
  }
  if(h.tick>=1){
   h.tick=0;
   for(const n of g.npcs)if(n.alive&&!n.medicalUntil&&!(h.kind==='spill'&&n.cleaningTarget===h.id)){
    const distance=Math.hypot(n.x-h.x,n.y-h.y);
    if(distance<(h.kind==='fire'?1.35:.85)&&g.random()<(h.kind==='fire'?.75:h.kind==='spill'?.38:.6)){
     injury(g,n,h.kind==='fire'?9:h.kind==='electric'?18:6,h.kind);
    }
   }
   if(h.kind==='fire'&&g.random()<.16){
    const delta=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(g.random()*4)];
    const nx=h.x+delta[0],ny=h.y+delta[1],ox=h.originX??h.x,oy=h.originY??h.y;
    const source=h.rootSource||h.source,max=source==='god'?1:2;
    if(Math.max(Math.abs(nx-ox),Math.abs(ny-oy))<=max&&
       !g.world.hazards.some(z=>z.life>0&&z.x===nx&&z.y===ny)&&
       addHazard(g,nx,ny,'fire','chain',{x:ox,y:oy,source})){
      const fresh=g.world.hazards[g.world.hazards.length-1];
      fresh.life=Math.min(fresh.life,h.life);g.stats.chains++;reward(g,3,'localized fire');
    }
   }
  }
 }
 g.world.hazards=g.world.hazards.filter(h=>h.life>0);
 updateElectricalZones(g);
 g.world.props=g.world.props.filter(o=>o.type!=='wetFloorSign'||o.expires>g.elapsed);
 for(let n of g.npcs){if(!n.alive){if(n.cleaningTarget)clearCleanup(g,n);continue}if(n.medicalUntil>g.elapsed)continue;n.callCooldown=Math.max(0,n.callCooldown-dt);
 n.emotion.fear=clamp(n.emotion.fear-dt*.55);n.emotion.anger=clamp(n.emotion.anger-dt*.3);n.emotion.stress=clamp(n.emotion.stress-dt*.2);
 if(n.bleeding>0){n.health-=n.bleeding*dt*.09;if(n.health<=0){kill(g,n,'untreated injury');continue}}n.pain=clamp(n.pain-dt*.13);if(n.unconscious>0){if(n.cleaningTarget)clearCleanup(g,n);n.unconscious-=dt;continue}
 if(n.arrested){if(n.cleaningTarget)clearCleanup(g,n);n.detention-=dt;if(n.detention<=0){n.arrested=false;n.activity='Released from detention'}continue}
 n.think-=dt;if(n.think<=0){n.think=1.5+g.random()*2;if(!n.command)choose(g,n)}
 if(n.trappedBy){n.path=[];continue}
 if(n.path.length){let next=n.path[0];if(debrisBlocksMovement(g.world,next.x,next.y)){n.path=[];n.think=0;continue}let entry=doorAt(g.world,next.x,next.y);if(entry&&entry.open<.65){if(!entry.locked)entry.forceUntil=g.elapsed+2;else{n.emotion.anger=clamp(n.emotion.anger+dt*6);n.emotion.stress=clamp(n.emotion.stress+dt*3);n.activity='Frustrated by locked door'}continue}let p=n.path[0],beforeX=n.rx,beforeY=n.ry,dx=p.x-n.rx,dy=p.y-n.ry,dist=Math.hypot(dx,dy),speed=(n.panic?3.6:1.65)*(n.health<50?.7:1);if(dist>.001&&Math.abs(dx-dy)>.025)n.facing=dx-dy>0?'right':'left';if(dist<=dt*speed){n.rx=p.x;n.ry=p.y;n.x=p.x;n.y=p.y;n.path.shift()}else{n.rx+=dx/dist*dt*speed;n.ry+=dy/dist*dt*speed}
 // Stride phase follows distance covered, not frame time. A slow/injured
 // walker therefore swings arms more slowly than a panicking runner.
 n.walkDistance=(n.walkDistance||0)+Math.hypot(n.rx-beforeX,n.ry-beforeY);
 let d=doorAt(g.world,Math.round(n.rx),Math.round(n.ry));if(d)d.forceUntil=g.elapsed+2;
 }else{
 if(n.activity==='Picking up item'&&n.inventory.length<4){let idx=g.world.drops.findIndex(d=>Math.hypot(d.x-n.x,d.y-n.y)<2);if(idx>=0){let item=g.world.drops.splice(idx,1)[0];n.inventory.push(item.item);n.activity='Carrying '+(ITEMS.find(i=>i.id===item.item)?.name||'item')}}
 if((n.activity==='Looking for something to steal'||n.activity.startsWith('Using '))&&n.inventory.length<4){let o=g.world.fixtures.find(o=>Math.hypot(o.x-n.x,o.y-n.y)<4&&o.stock!==0);if(o&&g.random()<dt*.5){let id=ITEMS[Math.floor(g.random()*ITEMS.length)].id;n.inventory.push(id);if(o.stock>0)o.stock--;let theft=n.activity==='Looking for something to steal';n.activity=(theft?'Stole ':'Picked up ')+(ITEMS.find(i=>i.id===id)?.name||'item');if(theft){log(g,n.name+' stole an item.');let witness=nearest(g,n,c=>Math.hypot(c.x-n.x,c.y-n.y)<4);if(witness){memory(witness,'theft',n.id,'Saw '+n.name+' stealing');witness.relationships[n.id]=clamp((witness.relationships[n.id]||0)-16,-100,100);if(witness.traits.suspicion>45)incident(g,'crime')}}}}
 const other=nearest(g,n,o=>Math.hypot(o.x-n.x,o.y-n.y)<2);if(other&&g.random()<dt*.6)interact(g,n,other)}
 // Cleaning uses the same autonomous navigation and fixed-step simulation as other jobs.
 if(n.cleaningTarget){
  const spill=g.world.hazards.find(h=>h.id===n.cleaningTarget&&h.kind==='spill'&&h.life>0);
  if(!spill){clearCleanup(g,n);n.activity='Back to work'}
  else if(Math.hypot(n.rx-spill.x,n.ry-spill.y)<1.9&&!n.path.length){
   n.cleaning=true;n.activity='Mopping spill';n.cleaningPhase=(n.cleaningPhase||0)+dt;
   spill.beingCleaned=true;spill.cleanerId=n.id;spill.life-=dt*17;
   if(spill.life<=0){
    spill.life=0;
    g.world.props.push({id:'wet-sign-'+spill.id,type:'wetFloorSign',x:spill.x,y:spill.y,expires:g.elapsed+13});
    log(g,n.name+' cleaned a spill.');
    clearCleanup(g,n);n.activity='Back to work';n.think=.2;
   }
  }else{n.cleaning=false}
 }
 if(n.role==='employee'&&n.primaryJob){n.duty=effectiveDuty(n)}
 if(!n.command)updateRoutine(g,n,dt);
 if(n.panic>0)n.panic=Math.max(0,n.panic-dt);
 if(n.role==='firefighter'){for(const fire of g.world.hazards.filter(h=>h.kind==='fire'&&h.life>0&&Math.hypot(n.x-h.x,n.y-h.y)<3)){fire.life-=dt*24;if(fire.life<=0)log(g,n.name+' extinguished a fire.')}}
 if(n.role==='paramedic'){let patient=nearest(g,n,o=>o.health<85&&Math.hypot(o.x-n.x,o.y-n.y)<3);if(patient&&g.random()<dt*.65)interact(g,n,patient)}
 if(n.role==='police'){let suspect=nearest(g,n,o=>o.emotion.anger>65&&Math.hypot(o.x-n.x,o.y-n.y)<2);if(suspect&&g.random()<dt*.5)interact(g,n,suspect)}
 for(let m of n.memory){m.age+=dt;if(m.age>120&&m.strength<2)m.strength=0}n.memory=n.memory.filter(m=>m.strength>0);
 }
 if(!g.completed&&g.npcs.length&&!g.npcs.some(n=>n.alive)){g.winner=true;g.completed=true;log(g,'TOTAL ELIMINATION — victory!')}
}
