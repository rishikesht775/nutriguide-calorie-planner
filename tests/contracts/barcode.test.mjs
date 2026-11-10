import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source=readFileSync(new URL('../../app/api/foods/barcode/route.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const goodProduct={status:1,product:{product_name:'Test oats',nutriments:{'energy-kcal_100g':380,proteins_100g:13,carbohydrates_100g:60,fat_100g:7,fiber_100g:10}}};
function fixture({user={userId:'alice'},body=goodProduct,status=200,networkError,jsonError}={}){
 const calls=[];const exports={};
 const context={exports,Response,URL,Number,String,AbortSignal:{timeout:ms=>({timeout:ms})},require(name){if(name==='../../../chatgpt-auth')return {getChatGPTUser:async()=>user};throw Error('Unexpected import '+name)},fetch:async(url,options)=>{calls.push({url,options});if(networkError)throw networkError;return {ok:status>=200&&status<300,status,json:async()=>{if(jsonError)throw jsonError;return body}}}};
 vm.runInNewContext(compiled,context,{filename:'barcode-route.cjs'});
 return {calls,lookup:(code='8901234567890')=>exports.GET(new Request('http://localhost/api/foods/barcode?code='+encodeURIComponent(code)))};
}

test('anonymous barcode lookup is rejected before provider access',async()=>{const f=fixture({user:null});const r=await f.lookup();assert.equal(r.status,401);assert.equal(f.calls.length,0)});
for(const code of ['', '1234567','123456789012345','8901abcdef90','https://other.test','12345678/../',' 12345678'])test(`invalid barcode ${JSON.stringify(code)} is rejected before provider access`,async()=>{const f=fixture();assert.equal((await f.lookup(code)).status,400);assert.equal(f.calls.length,0)});
for(const code of ['12345678','12345678901234'])test(`supported barcode length ${code.length} uses fixed provider origin`,async()=>{const f=fixture();const r=await f.lookup(code);assert.equal(r.status,200);const url=new URL(f.calls[0].url);assert.equal(url.origin,'https://world.openfoodfacts.org');assert.equal(url.pathname,`/api/v2/product/${code}.json`);assert.equal(f.calls[0].options.signal.timeout,7000);assert.match(f.calls[0].options.headers['User-Agent'],/NutriGuide/)});
test('successful provider label normalizes nutrition fields and attribution',async()=>{const f=fixture();const r=await f.lookup();assert.equal(r.status,200);assert.deepEqual(await r.json(),{code:'8901234567890',name:'Test oats',cal:380,p:13,c:60,fat:7,f:10,source:'Open Food Facts',sourceUrl:'https://world.openfoodfacts.org/product/8901234567890',basis:'per 100 g. Verify against the package label.'});assert.match(r.headers.get('cache-control'),/private/)});
test('numeric strings normalize and missing noncalorie nutrients use zero',async()=>{const f=fixture({body:{status:1,product:{product_name:'Label strings',nutriments:{'energy-kcal_100g':'250',proteins_100g:'12.5',carbohydrates_100g:'bad',fat_100g:-1}}}});const r=await f.lookup();assert.equal(r.status,200);const n=await r.json();assert.equal(n.cal,250);assert.equal(n.p,12.5);assert.equal(n.c,0);assert.equal(n.fat,0);assert.equal(n.f,0)});
for(const body of [{status:0},{status:1},{status:1,product:{}},{status:1,product:{nutriments:{}}},{status:1,product:{nutriments:{'energy-kcal_100g':'invalid'}}}])test(`missing or invalid calorie label ${JSON.stringify(body)} is not logged as complete`,async()=>{const f=fixture({body});assert.equal((await f.lookup()).status,404)});
for(const value of [null,'','   ',-1,false,[],{}])test(`invalid calorie value ${JSON.stringify(value)} cannot silently become zero`,async()=>{const f=fixture({body:{status:1,product:{product_name:'Incomplete',nutriments:{'energy-kcal_100g':value}}}});assert.equal((await f.lookup()).status,404)});
test('provider 404 preserves a manual-entry fallback',async()=>{const f=fixture({status:404});const r=await f.lookup();assert.equal(r.status,404);assert.match((await r.json()).error,/manually/)});
for(const status of [429,500])test(`provider HTTP ${status} maps to controlled gateway error`,async()=>{const f=fixture({status});const r=await f.lookup();assert.equal(r.status,502);assert.match((await r.json()).error,/manually/)});
for(const error of [new Error('provider DNS secret'),new DOMException('connection timeout','TimeoutError')])test(`${error.name} is contained without leaking provider internals`,async()=>{const f=fixture({networkError:error});const r=await f.lookup();assert.equal(r.status,503);const text=await r.text();assert.match(text,/manual entry/);assert.doesNotMatch(text,/DNS secret|stack|node_modules/)});
test('malformed provider JSON yields controlled manual-entry fallback',async()=>{const f=fixture({jsonError:new SyntaxError('unexpected token')});assert.equal((await f.lookup()).status,503)});
test('untrusted product names remain JSON strings with bounded length',async()=>{const input='<img src=x onerror="alert(1)">'+ 'A'.repeat(500);const f=fixture({body:{status:1,product:{product_name:input,nutriments:{'energy-kcal_100g':100}}}});const r=await f.lookup();assert.match(r.headers.get('content-type'),/application\/json/);const result=await r.json();assert.equal(result.name,input.slice(0,160));assert.equal(result.name.length,160)});
test('brand and generic names are safe fallbacks when product name is absent',async()=>{for(const [product,name] of [[{brands:'Sample brand'},'Sample brand'],[{},'Packaged food']]){const f=fixture({body:{status:1,product:{...product,nutriments:{'energy-kcal_100g':0}}}});const r=await f.lookup();assert.equal(r.status,200);assert.equal((await r.json()).name,name)}});
