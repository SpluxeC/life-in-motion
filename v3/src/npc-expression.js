// Phase 2: derive expressive states from existing, saved NPC gameplay values.
// Presentation-only; never manufacture an injury, emotion or interaction.
const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
export function npcExpression(n={}){
 const emotion=n.emotion||{},fear=finite(emotion.fear),anger=finite(emotion.anger),stress=finite(emotion.stress);
 if(n.alive===false)return {kind:'deceased',eyes:'closed',mouth:'flat',intensity:1};
 if(finite(n.unconscious)>0)return {kind:'unconscious',eyes:'closed',mouth:'flat',intensity:1};
 if(finite(n.health,100)<35||finite(n.pain)>65)return {kind:'hurt',eyes:'squint',mouth:'grimace',intensity:1};
 if(fear>=60)return {kind:'terrified',eyes:'wide',mouth:'open',intensity:Math.min(1,fear/100)};
 if(anger>=65)return {kind:'furious',eyes:'narrow',mouth:'frown',intensity:Math.min(1,anger/100)};
 if(stress>=60)return {kind:'stressed',eyes:'narrow',mouth:'flat',intensity:Math.min(1,stress/100)};
 if(fear>=32)return {kind:'nervous',eyes:'wide',mouth:'flat',intensity:fear/100};
 if(anger>=35)return {kind:'irritated',eyes:'narrow',mouth:'frown',intensity:anger/100};
 if(n.action==='talk'||n.task?.kind==='help')return {kind:'engaged',eyes:'normal',mouth:'smile',intensity:.6};
 return {kind:'calm',eyes:'normal',mouth:'smile',intensity:.2};
}
export function npcReactionPose(n={}){
 const face=npcExpression(n);
 // Active path locomotion outranks secondary body language.
 if(n.alive===false||finite(n.unconscious)>0)return {face,lean:0,guard:0};
 if((n.path?.length||0)>0)return {face,lean:0,guard:0};
 const pain=finite(n.pain),fear=finite(n.emotion?.fear),anger=finite(n.emotion?.anger);
 return {face,lean:pain>55?.13:fear>60?-.1:anger>65?.07:0,guard:Math.max(pain, fear*.65)/100};
}
