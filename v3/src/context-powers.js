// Compact, target-first God Powers UI. No hover is required on touch devices.
import {POWER_LIST,accusationsFor,COMMAND_OPTIONS} from './god-powers.js?v=god-powers-v41-20261025';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const POWER_FLOOR_AREAS=new Set(['store','employee','garden','loading']);
// Only playable interior/covered floor tiles offer tile-based God Powers.
// Parking, roads, sidewalks, grass, landscape and unmapped ground stay inert.
export function canOfferTileGodPowers(world,x,y){
 if(!Number.isInteger(x)||!Number.isInteger(y))return false;
 return !!world?.ground?.some(tile=>tile.x===x&&tile.y===y&&POWER_FLOOR_AREAS.has(tile.area));
}

export function createContextPowers({element,stage,getGame,apply,onMessage}){
 let target=null,position={x:0,y:0},mode=null,pick=null;
 const game=()=>getGame();
 const typeOf=t=>{
  const g=game();if(!t||!g)return null;
  if(g.npcs.some(n=>n.id===t.id))return 'npc';
  if(g.world.fixtures.some(f=>f.id===t.id))return 'fixture';
  if(t.id?.startsWith('door-'))return 'door';
  if(g.world.props.some(f=>f.id===t.id))return 'prop';
  if(t.type==='departmentSign')return 'sign';
  return t.type==='tile'&&canOfferTileGodPowers(g.world,t.x,t.y)?'tile':null;
 };
 function hide(){target=null;mode=null;element.classList.add('hidden');element.innerHTML=''}
 function action(id,detail=null){
  if(!target)return;
  const result=apply(id,target,detail);
  onMessage(result.message);
  hide();
 }
 function draw(){
  const g=game(),kind=typeOf(target);if(!g||!kind){hide();return}
  const npc=g.npcs.find(n=>n.id===target.id);
  const back='<button class="contextBack" data-back="1">← God Powers</button>';
  if(!mode){
   const powers=POWER_LIST.filter(p=>p.targets.includes(kind)&&(!npc||npc.alive));
   if(!powers.length){hide();return}
   element.innerHTML='<div class="contextHeading">God Powers</div>'+powers.map(p=>
    '<button data-power="'+p.id+'" '+(g.paused||g.energy<p.cost||(g.cooldowns[p.id]||0)>g.elapsed?'disabled':'')+
    '><span>'+escape(p.name)+'</span><small>'+escape(p.priceRange??p.cost)+(p.cost?' ✦':' Free')+'</small></button>').join('');
  }else if(mode==='suspicion'&&npc){
   element.innerHTML=back+'<div class="contextHeading">Select accusation</div><div class="contextOptions">'+
    accusationsFor(npc).map(a=>'<button data-accusation="'+a.id+'" '+(g.energy<a.cost?'disabled':'')+
     '><span>'+escape(a.severity+': '+a.label)+'</span><small>'+a.cost+' ✦</small></button>').join('')+'</div>';
  }else if(mode==='command'&&npc){
   element.innerHTML=back+'<div class="contextHeading">Choose command</div><div class="contextOptions">'+
    COMMAND_OPTIONS.filter(a=>!a.role||a.role===npc.role).map(a=>
     '<button data-command="'+a.id+'" '+(g.energy<a.cost||npc.command||(npc.commandCooldownUntil||0)>g.elapsed?'disabled':'')+
     '><span>'+escape(a.name)+'</span><small>'+a.cost+' ✦</small></button>').join('')+'</div>';
  }else if(mode==='hazard'&&kind==='tile'){
   element.innerHTML=back+'<div class="contextHeading">Choose hazard</div><div class="contextOptions">'+
    [['fire','Fire'],['spill','Water Spill'],['electric','Hanging Live Wire']].map(([id,label])=>
     '<button data-hazard="'+id+'" '+(g.energy<18?'disabled':'')+'><span>'+label+'</span><small>18 ✦</small></button>').join('')+'</div>';
  }else{mode=null;draw();return}
  element.classList.remove('hidden');
  const x=Math.max(5,Math.min(stage.clientWidth-element.offsetWidth-5,position.x+12));
  const y=Math.max(5,Math.min(stage.clientHeight-element.offsetHeight-5,position.y-16));
  element.style.left=x+'px';element.style.top=y+'px';
  element.querySelector('[data-back]')?.addEventListener('click',()=>{mode=null;draw()});
  element.querySelectorAll('[data-power]').forEach(b=>b.addEventListener('click',()=>{
   mode=b.dataset.power;
   if(['suspicion','command','hazard'].includes(mode))draw();else action(mode);
  }));
  element.querySelectorAll('[data-accusation]').forEach(b=>b.addEventListener('click',()=>{
   const a=accusationsFor(npc).find(v=>v.id===b.dataset.accusation);
   if(a)action('suspicion',{accusation:a.id,severity:a.severity});
  }));
  element.querySelectorAll('[data-hazard]').forEach(b=>b.addEventListener('click',()=>action('hazard',{kind:b.dataset.hazard})));
  element.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{
   const command=COMMAND_OPTIONS.find(a=>a.id===b.dataset.command);
   if(!command)return;
   if(!command.target){action('command',{action:command.id});return}
   pick={actorId:npc.id,command:command.id,target:command.target};
   hide();
   onMessage('Whisper Command: tap a '+(command.target==='npc'?'living NPC':command.target==='tile'?'ground tile':'suitable object')+' on the map.');
  }));
 }
 return {
  hide,
  show(t,x,y,power=null){target=t;position={x:x??stage.clientWidth*.48,y:y??stage.clientHeight*.25};mode=power;if(power&&!['suspicion','command','hazard'].includes(power)){action(power);return}draw()},
  waitingForTarget(){return !!pick},
  consumeClick(selected,tile){
   if(!pick)return false;
   const actor=game()?.npcs.find(n=>n.id===pick.actorId);
   const chosen=pick.target==='tile'?tile:selected;
   // Command destinations may still be outdoor, walkable ground; filtering
   // floor-power popups must not prevent NPC movement to those destinations.
   const kind=pick.target==='tile'&&chosen?.type==='tile'?'tile':typeOf(chosen);
   if(!actor||pick.target==='npc'&&kind!=='npc'||pick.target==='object'&&!['fixture','door','prop'].includes(kind)||pick.target==='tile'&&kind!=='tile'){
    onMessage('Select a valid '+pick.target+' target.');return true;
   }
   const result=apply('command',actor,{action:pick.command,targetId:chosen.id,x:chosen.x,y:chosen.y});
   onMessage(result.message);
   if(result.ok)pick=null;
   return true;
  },
  reset(){pick=null;hide()}
 };
}
