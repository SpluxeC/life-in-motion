import test from 'node:test';
import assert from 'node:assert/strict';
import {cueProfile,createGameAudio} from '../src/game-audio.js';
test('spatial cues are clamped and deterministic',()=>{
 assert.deepEqual(cueProfile('rescue',30,0),cueProfile('rescue',30,0));
 assert.equal(cueProfile('fire',100,0).pan,1);
 assert.equal(cueProfile('injury',-100,0).pan,-1);
 assert.equal(cueProfile('whisper',2,2).pan,0);
});
test('sound defaults off and does not allocate a context before opt-in',()=>{
 let created=false;
 const audio=createGameAudio(()=>{created=true;throw Error('not expected')});
 assert.equal(audio.enabled,false);
 assert.equal(audio.cue('anger'),false);
 assert.equal(created,false);
});
test('opt-in and mute safely stop both soundtrack voices',async()=>{
 const voices=[];
 const mock={state:'suspended',destination:{},createOscillator(){const o={type:'',frequency:{value:0},connect(){return this},start(){},stop(){this.stopped=true}};voices.push(o);return o},createGain(){return {gain:{value:0},connect(){return this}}},async resume(){this.state='running'},async suspend(){this.state='suspended'}};
 const audio=createGameAudio(()=>mock);
 assert.equal(await audio.setEnabled(true),true);
 assert.equal(audio.enabled,true);
 assert.equal(voices.length,2);
 await audio.setEnabled(false);
 assert.equal(audio.enabled,false);
 assert.equal(voices.every(v=>v.stopped),true);
});
