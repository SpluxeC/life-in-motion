// Phase 6: opt-in Web Audio soundscape; zero network dependencies.
// All audio is created after a user gesture and can be silenced immediately.
export function cueProfile(kind='ambient',x=0,listenerX=0){
 const profiles={suspicion:[420,.10],anger:[180,.13],whisper:[280,.09],command:[560,.12],sabotage:[130,.18],hazard:[240,.16],injury:[155,.13],rescue:[650,.11],fire:[125,.13]};
 const [frequency,volume]=profiles[kind]||[210,.06];
 const pan=Math.max(-1,Math.min(1,(x-listenerX)/20));
 return {frequency,volume,pan,duration:kind==='rescue'?.36:.23};
}
export function createGameAudio(getContext=()=>new (window.AudioContext||window.webkitAudioContext)()){
 let context=null,music=[],enabled=false,level=.45;
 function stopMusic(){for(const o of music){try{o.stop()}catch{}}music=[]}
 async function setEnabled(next){
  if(!next){enabled=false;stopMusic();if(context){await context.suspend()}return false}
  try{
   context??=getContext();await context.resume();enabled=true;
   // A deliberately subdued two-voice ambient drone; not tied to render frames.
   if(!music.length)for(const frequency of [110,164.81]){
    const o=context.createOscillator(),gain=context.createGain();
    o.type='sine';o.frequency.value=frequency;gain.gain.value=.009*level;
    o.connect(gain).connect(context.destination);o.start();music.push(o);
   }
   return true;
  }catch{enabled=false;return false}
 }
 function cue(kind,x=0,listenerX=0){
  if(!enabled||!context||context.state!=='running')return false;
  const profile=cueProfile(kind,x,listenerX),now=context.currentTime;
  const oscillator=context.createOscillator(),gain=context.createGain();
  const panner=typeof context.createStereoPanner==='function'?context.createStereoPanner():null;
  oscillator.type=kind==='fire'||kind==='sabotage'?'sawtooth':'sine';
  oscillator.frequency.setValueAtTime(profile.frequency,now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,profile.frequency*.72),now+profile.duration);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0001,profile.volume*level),now+.02);
  gain.gain.exponentialRampToValueAtTime(.0001,now+profile.duration);
  oscillator.connect(gain);if(panner){panner.pan.value=profile.pan;gain.connect(panner);panner.connect(context.destination)}else gain.connect(context.destination);
  oscillator.start(now);oscillator.stop(now+profile.duration+.03);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();panner?.disconnect()};
  return true;
 }
 function setVolume(v){level=Math.max(0,Math.min(1,Number(v)||0))}
 return {setEnabled,cue,setVolume,get enabled(){return enabled},dispose(){stopMusic();context?.close();context=null;enabled=false}};
}
