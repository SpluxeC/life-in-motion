import {mkdir} from 'node:fs/promises';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
await mkdir('qa-screenshots',{recursive:true});
async function scenario(viewport,isMobile){
 const page=await browser.newPage({viewport,hasTouch:isMobile,isMobile});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8765/v3/?qa=phase4',{waitUntil:'networkidle'});
  await page.locator('#startGame').click();
  await page.locator('#mapHardware').click();
  await page.locator('#setupLaunch').click();
  await page.waitForTimeout(450);
  const canvas=page.locator('canvas#game');
  const rect=await canvas.boundingBox();
  assert.ok(rect&&rect.width>0&&rect.height>0,'canvas must be visible');
  await canvas.screenshot({path:'qa-screenshots/'+(isMobile?'mobile':'desktop')+'-running.png'});
  await page.locator('#pause').click();
  assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
  const untouched=await canvas.evaluate(el=>Array.from(el.getContext('2d').getImageData(0,0,el.width,el.height).data).reduce((a,v)=>(a+v)%4294967291,0));
  assert.equal(await page.evaluate(()=>window.__phase4QA?.()),true,'phase 4 QA fixture missing');
  await page.waitForTimeout(80);
  await canvas.screenshot({path:'qa-screenshots/'+(isMobile?'mobile':'desktop')+'-phase4-debris.png'});
  const changed=await canvas.evaluate(el=>Array.from(el.getContext('2d').getImageData(0,0,el.width,el.height).data).reduce((a,v)=>(a+v)%4294967291,0));
  assert.notEqual(changed,untouched,'falling debris had no visible effect on canvas');
  const pausedPixels=await canvas.evaluate(el=>Array.from(el.getContext('2d').getImageData(0,0,32,32).data));
  await page.waitForTimeout(150);
  const pausedPixelsLater=await canvas.evaluate(el=>Array.from(el.getContext('2d').getImageData(0,0,32,32).data));
  assert.deepEqual(pausedPixels,pausedPixelsLater,'paused world visual frame changed');
  // Paused camera adjustments must remain available without advancing simulation.
  const angle=page.locator('#cameraAngle');
  await angle.fill('55');
  assert.equal(await page.locator('#cameraAngleValue').textContent(),'55°');
  await canvas.screenshot({path:'qa-screenshots/'+(isMobile?'mobile':'desktop')+'-camera-paused.png'});
  await page.locator('#pause').click();
  assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'false');
  await page.waitForTimeout(180);
  await page.locator('[data-tab="settings"]').click();
  const sound=page.locator('#toggleSound');
  assert.equal(await sound.getAttribute('aria-pressed'),'false','sound must default off');
  await sound.click();
  assert.equal(await sound.getAttribute('aria-pressed'),'true','audio opt-in failed');
  await sound.click();
  assert.equal(await sound.getAttribute('aria-pressed'),'false','audio mute failed');
  const expression=await page.evaluate(async()=>{const {npcExpression}=await import('./src/npc-expression.js');return npcExpression({alive:true,emotion:{fear:90}}).kind});
  assert.equal(expression,'terrified','phase 2 expressions unavailable in browser');
  const hazard=await page.evaluate(async()=>{const {environmentCue}=await import('./src/environment-effects.js');return environmentCue({kind:'electric',life:5,x:3,y:4},10)?.kind});
  assert.equal(hazard,'electric','phase 3 hazard effects unavailable in browser');
  assert.deepEqual(errors,[],'browser page errors');
  console.log('PASS: '+(isMobile?'mobile':'desktop')+' start, render, pause, camera, resume');
 }finally{await page.close();}
}
try{
 await scenario({width:1280,height:780},false);
 await scenario({width:844,height:390},true);
}finally{await browser.close();}
