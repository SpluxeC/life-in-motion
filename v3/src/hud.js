// Presentation-only helpers. All time and moods come from the saved game,
// so a paused game cannot advance its clock or animation frame.
export function formatGameTime(game){
 const start=Number.isFinite(game?.clockStartMinutes)?game.clockStartMinutes:480;
 const rate=Number.isFinite(game?.minutesPerSecond)?game.minutesPerSecond:1;
 const minutes=((Math.floor(start+(game?.elapsed||0)*rate)%1440)+1440)%1440;
 const h24=Math.floor(minutes/60),minute=minutes%60;
 return (h24%12||12)+':'+String(minute).padStart(2,'0')+' '+(h24<12?'AM':'PM');
}
export function emotionState(n){
 if(!n.alive)return 'Deceased';
 if(n.arrested)return 'Detained';
 if(n.unconscious>0)return 'Unconscious';
 if(n.emotion?.fear>=60)return 'Terrified';
 if(n.emotion?.anger>=65)return 'Furious';
 if(n.emotion?.stress>=60)return 'Stressed';
 if(n.emotion?.fear>=32)return 'Nervous';
 if(n.emotion?.anger>=35)return 'Irritated';
 if(n.emotion?.stress>=32)return 'Uneasy';
 return 'Calm';
}
export const POWER_HELP={
 whisper:['Plant an unsettling thought, causing some anger.','Choose Use Power, then tap a living NPC. Free, with a cooldown.'],
 anger:['Strongly increase a character\'s anger and the risk of conflict.','Choose Use Power, then tap a living NPC.'],
 fear:['Make an NPC afraid and more likely to panic or flee.','Choose Use Power, then tap a living NPC.'],
 suspicion:['Heighten someone\'s distrust and suspicion.','Choose Use Power, then tap a living NPC.'],
 trust:['Reduce the target\'s trust in another person.','Choose Use Power, then tap an NPC. The game chooses a nearby person.'],
 rumor:['Spread a troubling rumor that may lead to conflict.','Choose Use Power, then tap a living NPC.'],
 item:['Influence someone to seek an item, or create an item at a fixture.','Choose Use Power, then tap an NPC or a store fixture.'],
 sabotage:['Damage a fixture and trigger an environmental problem.','Choose Use Power, then tap a machine, counter, shelf, or other fixture.'],
 hazard:['Start a random fire, spill, electrical, or falling hazard.','Choose Use Power, then tap an open floor tile or a fixture with open space nearby.'],
 lightning:['Strike an NPC with deadly lightning.','Choose Use Power, then tap a living NPC. High energy cost.']
};

export const HAIR_COLORS=['#211a17','#37271f','#573829','#76503a','#9b704a','#b18c60','#d3b178','#e2cf9d','#934b31','#a7a39a','#e5e1d7'];
export const HAIR_STYLES=['short','sidePart','curly','wavy','bob','ponytail','buzz','bun','long','messy'];
export function hairAppearance(n){
 const num=Number(String(n.id||'0').replace(/[^0-9]/g,''))||0;
 return {color:n.hairColor||HAIR_COLORS[num%HAIR_COLORS.length],style:n.hairStyle||HAIR_STYLES[num%HAIR_STYLES.length]};
}
export function npcWeakness(n){
 const t=n.traits||{};
 const ranked=[
  {value:t.bravery??50,label:'Fearful'},
  {value:t.loyalty??50,label:'Disloyal'},
  {value:t.compassion??50,label:'Low compassion'},
  {value:t.suspicion??50,label:'Too trusting'},
  {value:100-(t.aggression??50),label:'Quick temper'}
 ];
 ranked.sort((a,b)=>a.value-b.value);
 return ranked[0].label;
}
