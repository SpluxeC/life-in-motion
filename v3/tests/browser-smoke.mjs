import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:780}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:8765/v3/',{waitUntil:'networkidle'});
 await page.locator('#startGame').click();
 await page.locator('#mapHardware').click();
 await page.locator('#setupLaunch').click();
 await page.waitForTimeout(800);
 assert.equal(await page.locator('canvas#game').count(),1,'game canvas missing');
 const before=await page.locator('#game').evaluate(el=>({width:el.width,height:el.height}));
 assert.ok(before.width>0&&before.height>0,'canvas not sized');
 await page.locator('#pause').click();
 await page.waitForTimeout(100);
 assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true','pause did not engage');
 await page.locator('#pause').click();
 await page.waitForTimeout(200);
 assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'false','resume did not engage');
 assert.deepEqual(errors,[],'browser script errors');
 console.log('PASS: game launches, canvas renders, pause/resume works, no page errors');
}finally{await browser.close();}
