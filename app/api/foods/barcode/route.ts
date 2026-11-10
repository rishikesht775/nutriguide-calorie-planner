import { getChatGPTUser } from '../../../chatgpt-auth';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({error:'Sign in to look up packaged foods.'},{status:401});
  const code = new URL(request.url).searchParams.get('code') || '';
  if (!/^\d{8,14}$/.test(code)) return Response.json({error:'Enter an 8–14 digit barcode.'},{status:400});
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,nutriments,brands,code`, {
      headers:{'User-Agent':'NutriGuide/1.0 (nutrition planner; https://nutriguide-calorie-planner.rishikesht775.chatgpt.site)'},
      signal: AbortSignal.timeout(7000),
    });
    if (response.status===404) return Response.json({error:'Product not found. Enter its label nutrition manually.'},{status:404});
    if (!response.ok) return Response.json({error:'Food lookup is unavailable. You can still enter nutrition manually.'},{status:502});
    const data = await response.json() as {status?:number;product?:{product_name?:string;brands?:string;nutriments?:Record<string,unknown>}};
    const p=data.product,n=p?.nutriments;
    const calories=n?.['energy-kcal_100g'];
    const validCalories=(typeof calories==='number'||(typeof calories==='string'&&calories.trim()!==''))&&Number.isFinite(Number(calories))&&Number(calories)>=0;
    if (!p||data.status===0||!n||!validCalories) return Response.json({error:'No complete nutrition label found. Use manual entry.'},{status:404});
    const value=(key:string)=>{const num=Number(n[key]);return Number.isFinite(num)&&num>=0?num:0};
    return Response.json({code,name:String(p.product_name||p.brands||'Packaged food').slice(0,160),cal:value('energy-kcal_100g'),p:value('proteins_100g'),c:value('carbohydrates_100g'),fat:value('fat_100g'),f:value('fiber_100g'),source:'Open Food Facts',sourceUrl:`https://world.openfoodfacts.org/product/${code}`,basis:'per 100 g. Verify against the package label.'},{headers:{'Cache-Control':'private, max-age=300'}});
  } catch {return Response.json({error:'Lookup timed out or could not connect. Use manual entry.'},{status:503});}
}
