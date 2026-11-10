import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const engineSource=readFileSync(new URL('../../public/app/meal-engine.js',import.meta.url),'utf8');
function engine(){const context={window:{},NG:{day:()=> '2030-01-28'},Date};vm.runInNewContext(engineSource,context);return context.window.NGMeals;}
const plain=value=>JSON.parse(JSON.stringify(value));
const sum=(values)=>values.reduce((a,b)=>a+b,0);

test('planner produces seven consecutive dates across month boundary with four complete meal slots',()=>{
 const {buildPlan}=engine();const plan=plain(buildPlan());assert.equal(plan.length,7);
 assert.deepEqual(plan.map(day=>day.date),['2030-01-28','2030-01-29','2030-01-30','2030-01-31','2030-02-01','2030-02-02','2030-02-03']);
 for(const day of plan){assert.deepEqual(day.items.map(r=>r.meal),['Breakfast','Lunch','Snack','Dinner']);for(const r of day.items){assert.ok(r.id&&r.name&&r.why);assert.ok(r.servings>0);assert.ok(Object.keys(r.ingredients).length>0)}assert.ok(Number.isFinite(day.cal)&&Number.isFinite(day.p)&&Number.isFinite(day.cost));}
});
for(const diet of ['vegetarian','vegan','jain'])test(`${diet} plans contain only tagged recipes`,()=>{
 const plan=plain(engine().buildPlan({diet,startDay:'2032-02-27'}));
 for(const day of plan)for(const item of day.items){assert.ok(item.diets.includes(diet),`${item.name} is not tagged ${diet}`);if(diet==='vegan')assert.ok(!Object.keys(item.ingredients).some(name=>/curd|paneer|milk|ghee|butter/i.test(name)));if(diet==='jain')assert.ok(!Object.keys(item.ingredients).some(name=>/onion|garlic|potato|carrot|ginger/i.test(name)));}
 assert.equal(plan[2].date,'2032-02-29');assert.equal(plan[3].date,'2032-03-01');
});
for(const target of [1200,1800,2500,3500])test(`target ${target} kcal scaling stays close and aggregate totals agree`,()=>{
 const plan=plain(engine().buildPlan({target}));
 for(const day of plan){assert.ok(Math.abs(day.cal-target)<=20,`${day.date}: expected near ${target}, got ${day.cal}`);assert.equal(day.cal,Math.round(sum(day.items.map(r=>r.cal*r.servings))));assert.equal(day.p,Math.round(sum(day.items.map(r=>r.p*r.servings))));assert.equal(day.cost,Math.round(sum(day.items.map(r=>r.cost*r.servings))));assert.ok(day.items.every(r=>r.servings>=.6&&r.servings<=3));}
});
test('fixed options reproduce identical plans and do not mutate recipe definitions',()=>{
 const {buildPlan,recipes}=engine();const before=JSON.stringify(recipes);const opts={target:2100,budget:220,diet:'vegan',highProtein:true,startDay:'2030-04-01'};
 assert.deepEqual(plain(buildPlan(opts)),plain(buildPlan(opts)));assert.equal(JSON.stringify(recipes),before);
});
test('nonfinite and out-of-range calorie targets fall within supported range',()=>{
 for(const target of [-100,0,'invalid',NaN,Infinity]){const plan=plain(engine().buildPlan({target}));for(const day of plan)assert.ok(day.cal>=1180&&day.cal<=3520);}
});
test('grocery list sums ingredients across all seven days and household members',()=>{
 const {buildPlan,grocery}=engine();const plan=buildPlan({diet:'vegan',target:2000});
 for(const people of [1,2,4]){const expected={};for(const day of plan)for(const recipe of day.items)for(const [name,grams] of Object.entries(recipe.ingredients))expected[name]=(expected[name]||0)+grams*recipe.servings*people;
  const actual=plain(grocery(plan,people));assert.equal(actual.length,Object.keys(expected).length);for(const row of actual){assert.equal(row.grams,Math.round(expected[row.name]));assert.ok(row.grams>0);}}
});
test('grocery handles an empty plan without adding ingredients',()=>{assert.deepEqual(plain(engine().grocery([])),[])});
test('unknown dietary preference falls back to a usable vegetarian plan',()=>{
 const plan=plain(engine().buildPlan({diet:'not-a-diet'}));for(const day of plan){assert.ok(day.cal>0);assert.ok(day.items.every(item=>item.name&&item.diets.includes('vegetarian')));}
});
test('invalid household size never produces negative or nonfinite grocery amounts',()=>{
 const {buildPlan,grocery}=engine();for(const people of [-1,0,NaN,'invalid']){const rows=plain(grocery(buildPlan(),people));assert.ok(rows.every(row=>Number.isFinite(row.grams)&&row.grams>0));}
});

const storageSource=readFileSync(new URL('../../public/app/storage.js',import.meta.url),'utf8');
function storageFixture(fail=false){const values=new Map(),events=[];const context={window:{dispatchEvent:event=>events.push(event)},document:{getElementById:()=>null},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>{if(fail)throw Error('quota exceeded');values.set(key,value)}}};vm.runInNewContext(storageSource,context);return {NG:context.window.NG,values,events};}
test('escaping helper makes persisted HTML characters inert',()=>{assert.equal(storageFixture().NG.escape('<img src="x" onerror=\'bad\'> &'),'&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt; &amp;')});
test('typed storage read uses fallback for malformed JSON and incorrect container types',()=>{
 const {NG,values}=storageFixture();for(const value of ['not-json','null','42','{}','"[]"']){values.set('items',value);assert.deepEqual(plain(NG.read('items',[])),[]);}values.set('items','[1,2]');assert.deepEqual(plain(NG.read('items',[])),[1,2]);
});
test('storage write emits a change event only after successful storage',()=>{
 const ok=storageFixture();assert.equal(ok.NG.write('meals',[1]),true);assert.deepEqual(JSON.parse(ok.values.get('meals')),[1]);assert.equal(ok.events[0].type,'ng:data-changed');assert.equal(ok.events[0].detail.key,'meals');const failed=storageFixture(true);assert.equal(failed.NG.write('meals',[1]),false);assert.equal(failed.events.length,0);
});
