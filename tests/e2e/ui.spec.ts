import {test,expect} from '@playwright/test';
import {completeProfile,openTab} from './helpers';

test.describe('@ui @regression responsive geometry',()=>{
 for(const width of [320,360,390,768,1024,1440]){
  test(`${width}px: banner, navigation and every tab fit`,async({page},testInfo)=>{
   await page.setViewportSize({width,height:900});await completeProfile(page);
   for(const tab of [/Home/i,/Food studio/i,/Exercise/i,/Journey/i,/Plan & reports/i]){
    await openTab(page,tab);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    expect(overflow,`horizontal overflow in ${tab}`).toBeLessThanOrEqual(1);
   }
   await openTab(page,/Home/i);
   const hero=page.locator('#ngToday');const heading=hero.locator('h2');
   const h=await hero.boundingBox(),t=await heading.boundingBox();expect(h).not.toBeNull();expect(t).not.toBeNull();
   expect(t!.x).toBeGreaterThanOrEqual(h!.x);expect(t!.y+t!.height).toBeLessThanOrEqual(h!.y+h!.height);
   const nav=await page.locator('.app-nav').boundingBox();expect(nav).not.toBeNull();
   expect(nav!.x+nav!.width<=t!.x || nav!.y>=t!.y+t!.height || nav!.y+nav!.height<=t!.y).toBeTruthy();
   await testInfo.attach(`home-${width}`,{body:await page.screenshot({fullPage:true}),contentType:'image/png'});
  });
 }
 for(const width of [320,390,768]){
  test(`${width}px: login content stays within viewport`,async({page})=>{
   await page.setViewportSize({width,height:844});await page.route('**/api/me',r=>r.fulfill({json:{authenticated:false,user:null}}));await page.goto('/legacy');
   await expect(page.locator('#appAuthGate')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
   for(const sel of ['.auth-gate-art h1','#gateSubmit']){
    const b=await page.locator(sel).boundingBox();expect(b).not.toBeNull();expect(b!.x).toBeGreaterThanOrEqual(0);expect(b!.x+b!.width).toBeLessThanOrEqual(width+1);
   }
  });
 }
 test('labels and text contrast are readable in light cards',async({page})=>{
  await completeProfile(page);
  const contrast=await page.locator('#form label').first().evaluate(el=>{
   const rgb=(v:string)=>v.match(/[\d.]+/g)!.slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});
   const l=(v:number[])=>v[0]*.2126+v[1]*.7152+v[2]*.0722;
   const foreground=l(rgb(getComputedStyle(el).color));return (1.05)/(foreground+.05);
  });
  expect(contrast,'label contrast against white card').toBeGreaterThanOrEqual(4.5);
 });
});
