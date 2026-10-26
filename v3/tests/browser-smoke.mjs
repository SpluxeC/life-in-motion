import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
async function scenario(viewport,isMobile){
 const page=await browser.newPage({viewport,hasTouch:isMobile,isMobile});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8765/v3/',{waitUntil:'networkidle'});
  await page.locator('#startGame').click();
  await page.locator('#mapHardware').click();
  await page.locator('#setupLaunch').click();
  await page.waitForTimeout(450);
  const canvas=page.locator('canvas#game');
  const rect=await canvas.boundingBox();
  assert.ok(rect&&rect.width>0&&rect.height>0,'canvas must be visible');
  await page.locator('#pause').click();
  assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
  // Paused camera adjustments must remain available without advancing simulation.
  const angle=page.locator('#cameraAngle');
  await angle.fill('55');
  assert.equal(await page.locator('#cameraAngleValue').textContent(),'55°');
  await page.locator('#pause').click();
  assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'false');
  await page.waitForTimeout(180);
  const expression=await page.evaluate(async()=>{const {npcExpression}=await import('./src/npc-expression.js');return npcExpression({alive:true,emotion:{fear:90}}).kind});
  assert.equal(expression,'terrified','phase 2 expressions unavailable in browser');
  assert.deepEqual(errors,[],'browser page errors');
  console.log('PASS: '+(isMobile?'mobile':'desktop')+' start, render, pause, camera, resume');
 }finally{await page.close();}
}
try{
 await scenario({width:1280,height:780},false);
 await scenario({width:844,height:390},true);
}finally{await browser.close();}
