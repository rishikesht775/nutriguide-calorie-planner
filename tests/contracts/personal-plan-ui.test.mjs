// Contract-level DOM adapter, not a browser/layout substitute. Exercises the real
// personal-plan module with its legacy widget dependencies explicitly stubbed.
import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=name=>readFileSync(new URL(`../../public/app/${name}.js`,import.meta.url),'utf8');
function fixture(initial={}){
 const nodes=new Map(),storage=new Map(Object.entries(initial)),events={},timers=[];
 class Element{
  constructor(id=''){this._id=id;this.dataset={};this._html='';this._value='';this.textContent='';this.style={};this.listeners={};this.hidden=false;if(id)nodes.set(id,this)}
  set id(v){this._id=v;nodes.set(v,this)}get id(){return this._id}
  set value(v){this._value=String(v)}get value(){return this._value}
  set innerHTML(html){this._html=html;for(const m of html.matchAll(/id="([^"]+)"/g))if(!nodes.has(m[1]))new Element(m[1])}get innerHTML(){return this._html}
  setAttribute(){}append(){}prepend(){}insertBefore(){}before(){}focus(){document.activeElement=this}scrollIntoView(){}
  insertAdjacentHTML(_,html){this.innerHTML+=html}
  querySelector(sel){if(sel==='b')return {textContent:'Mon · Strength basics'};return new Element()}
  matches(){return false}checkValidity(){return true}
  addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)}
  requestSubmit(){for(const fn of this.listeners.submit||[])fn({target:this,preventDefault(){}})}
 }
 const byId=id=>nodes.get(id)||new Element(id);
 const classes=new Set(['post-profile']);const document={activeElement:null,createElement:()=>new Element(),getElementById:byId,querySelector:sel=>sel==='.app-nav button.active'?{dataset:{tab:'home'}}:new Element(),querySelectorAll:()=>[],body:{classList:{contains:n=>classes.has(n)}},addEventListener(event,fn){(events['doc:'+event]??=[]).push(fn)}};
 const profile={age:'30',sex:'male',height:'168',weight:'84',activity:'1.375',goal:'loss'};for(const [k,v]of Object.entries(profile))byId(k).value=v;
 const localStorage=new Proxy({getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},{get(target,key){return key in target?target[key]:storage.get(key)}});
 const context={console,document,localStorage,Event,CustomEvent,Date,setTimeout:fn=>timers.push(fn),clearTimeout(){},setInterval(){},nutritionLog:[],proteinItems:[],proteinTarget:100,guides:Array.from({length:6},(_,i)=>['guide',`Guide ${i}`]),renderProtein(){},saveProtein(){},updateWeeklyStrip(){},setTab(){},chooseGuide(){},startTrainerSession(){},finishTrainerSession(){},ngTrainerState:{},addEventListener(name,fn){(events[name]??=[]).push(fn)},dispatchEvent(ev){for(const fn of events[ev.type]||[])fn(ev)}};
 context.window=context;vm.createContext(context);
 for(const file of ['storage','personal-plan-engine','meal-engine','personal-plan'])vm.runInContext(source(file),context,{filename:file+'.js'});
 return {context,nodes,storage,events,profile,submit(){byId('form').requestSubmit()},flush(){for(const fn of timers.splice(0))fn()},click(selector,dataset){const button={dataset,closest:q=>q.includes(selector)?button:null};for(const fn of events['doc:click']||[])fn({target:{closest:q=>q.includes(selector)?button:null}})}};
}
test('real personal module initializes profile targets and seeds a week without diary logs',()=>{
 const f=fixture();assert.equal(f.context.ngPersonalPlan.calories,1950);assert.equal(f.nodes.get('proteinTarget')?.value,'118');assert.equal(f.context.proteinTarget,118);assert.equal(JSON.parse(f.storage.get('ngWeeklyPlans')).length,7);assert.deepEqual(f.context.nutritionLog,[]);assert.equal(f.nodes.get('ngJourneyGuide').hidden,false);
});
test('profile submit updates auto defaults and the shared protein target',()=>{
 const f=fixture();f.nodes.get('weight').value='75';f.nodes.get('goal').value='gain';f.submit();assert.equal(f.context.ngPersonalPlan.protein,120);assert.equal(f.storage.get('proteinTarget'),'120');assert.equal(f.context.ngPersonalPlan.training.goal,'strength');
});
test('existing manual meal plan survives first-load migration and profile submit',()=>{
 const saved=[{date:'2030-01-01',items:[],cal:1600,p:80,cost:100}];const f=fixture({ngWeeklyPlans:JSON.stringify(saved)});f.nodes.get('weight').value='75';f.submit();assert.equal(f.storage.get('ngWeeklyPlans'),JSON.stringify(saved));assert.equal(JSON.parse(f.storage.get('ngPersonalSettings')).food.mode,'custom');
});
test('custom targets apply until Home calculation refreshes protein',()=>{
 const f=fixture();f.nodes.get('ngPersonalCalories').value='2100';f.nodes.get('ngPersonalProtein').value='130';f.click('data-personal-action',{personalAction:'save-targets'});assert.equal(f.context.ngPersonalPlan.calories,2100);assert.equal(f.context.ngPersonalPlan.protein,130);f.nodes.get('weight').value='75';f.submit();assert.equal(f.context.ngPersonalPlan.protein,105);assert.equal(f.context.ngPersonalPlan.proteinSource,'profile');
});
test('low energy changes an automatic recommendation without creating a completed session',()=>{
 const f=fixture();f.click('data-readiness',{readiness:'tired'});assert.equal(f.context.ngPersonalPlan.training.goal,'mobility');assert.equal(f.storage.has('ngTrainerHistory'),false);assert.equal(f.nodes.get('ngTrainerDuration').value,'10');
});
test('custom workout controls persist and are not replaced on profile update',()=>{
 const f=fixture();f.nodes.get('ngTrainerGoal').value='cardio';f.nodes.get('ngTrainerSetting').value='gym';f.nodes.get('ngTrainerDuration').value='30';for(const fn of f.nodes.get('ngTrainerGoal').listeners.change)fn();
 f.nodes.get('goal').value='gain';f.submit();assert.equal(f.nodes.get('ngTrainerGoal').value,'cardio');assert.equal(f.nodes.get('ngTrainerDuration').value,'30');assert.equal(f.context.ngPersonalPlan.trainingSource,'custom');
});
test('real food logging changes next action without generating fake completion',()=>{
 const f=fixture();assert.equal(f.nodes.get('ngGuideNextTitle').textContent,'Start with a food log');
 f.context.nutritionLog.push({date:f.context.NG.day(),cal:116,p:9});f.context.dispatchEvent(new Event('ng:data-changed'));f.flush();assert.equal(f.nodes.get('ngGuideNextTitle').textContent,'Make time for comfortable movement');assert.match(f.nodes.get('ngGuideSteps').innerHTML,/Food logged: completed/);
});

test('stale legacy 125g cache is replaced by the individual profile estimate',()=>{
 const f=fixture({proteinTarget:'125'});assert.equal(f.context.ngPersonalPlan.protein,118);assert.equal(f.context.ngPersonalPlan.proteinSource,'profile');assert.equal(f.storage.get('proteinTarget'),'118');
});
test('different Home weights update the target in shared context rather than retaining 125g',()=>{
 const f=fixture({proteinTarget:'125'});for(const [weight,expected]of [['70',98],['84',118],['90',126]]){f.nodes.get('weight').value=weight;f.submit();assert.equal(f.context.ngPersonalPlan.protein,expected);assert.equal(f.storage.get('proteinTarget'),String(expected));assert.match(f.nodes.get('ngSharedTargets').innerHTML,new RegExp(expected+' g protein'));}
});
test('explicit 125g shared custom target remains editable and reset restores profile estimate',()=>{
 const f=fixture({proteinTarget:'125',ngPersonalSettings:JSON.stringify({version:1,targets:{protein:125}})});assert.equal(f.context.ngPersonalPlan.protein,125);assert.equal(f.context.ngPersonalPlan.proteinSource,'custom');f.click('data-personal-action',{personalAction:'reset-targets'});assert.equal(f.context.ngPersonalPlan.protein,118);assert.equal(f.context.ngPersonalPlan.proteinSource,'profile');
});

test('Home recalculation replaces an existing shared 125g override on the results card and all-tab target',()=>{
 const f=fixture({proteinTarget:'125',ngPersonalSettings:JSON.stringify({version:1,targets:{protein:125}})});assert.equal(f.nodes.get('protein').textContent,'125 g');
 f.nodes.get('weight').value='70';f.submit();assert.equal(f.nodes.get('protein').textContent,'98 g');assert.equal(f.context.proteinTarget,98);assert.equal(f.storage.get('proteinTarget'),'98');assert.match(f.nodes.get('ngSharedTargets').innerHTML,/98 g protein/);assert.equal(f.context.ngPersonalPlan.proteinSource,'profile');
 f.nodes.get('goal').value='gain';f.submit();assert.equal(f.nodes.get('protein').textContent,'112 g');
});

test('automatic profile hydration preserves explicit targets while a deliberate Home calculation refreshes protein',()=>{
 const f=fixture({ngPersonalSettings:JSON.stringify({version:1,targets:{calories:2100,protein:125}})});
 f.context.ngRestoringProfile=true;f.submit();f.context.ngRestoringProfile=false;
 assert.equal(f.context.ngPersonalPlan.calories,2100);assert.equal(f.context.ngPersonalPlan.protein,125);
 f.submit();assert.equal(f.context.ngPersonalPlan.calories,2100);assert.equal(f.context.ngPersonalPlan.protein,118);
});
