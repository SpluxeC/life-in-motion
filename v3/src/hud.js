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
 if(n.medicalUntil>0)return 'Recovering';
 if(n.doubt>=75)return 'In Crisis';
 if(n.doubt>=52)return 'Withdrawn';
 if(n.doubt>=20)return 'Self-Doubt';
 if(n.doubt>0)return 'Recovering';
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
 suspicion:['Spread accusations about targets through nearby witnesses and ordinary conversations.','Choose a severity and accusation for a living NPC. Minor 4, Moderate 8, Serious 14, Extreme 22 energy.'],
 anger:['Increase frustration in targets, raising stress and the risk of arguments or fights.','Select a living NPC. 6 energy; effects stack temporarily and fade.'],
 whisper:['Undermine confidence in targets, potentially causing withdrawal or psychological crisis.','Free, 12-second global cooldown and escalating cooldown for each target. Recovery and support are possible.'],
 command:['Strongly influence targets to act; they may refuse or reconsider as circumstances change.','Choose a command and its required target. Cost depends on the action (3–20 energy).'],
 sabotage:['Sabotage suitable objects and fixtures; triggered accidents can cause damage and injuries.','Select machinery, shelves, signs, doors, or other suitable objects. 24 energy.'],
 hazard:['Create a localized fire, slippery spill or overhead live wire on an empty tile.','Select fire, water or electrical hazard. 18 energy with a shared 10-second cooldown.']
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
