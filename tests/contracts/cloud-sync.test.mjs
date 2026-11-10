import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../../public/cloud-sync.js',import.meta.url),'utf8');
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve));};
function fixture({initial={},remote={},identity={id:'alice',email:'a@example.test'},save,load}={}){
 const storage=new Map(Object.entries({_ngCloudOwner:'alice',...initial}));const nodes=new Map();const listeners={};const intervals=[];const timeouts=[];const writes=[];
 const element=()=>({id:'',textContent:'',style:{},setAttribute(){},append(...items){for(const item of items)if(item.id)nodes.set(item.id,item)}});
 const document={getElementById:id=>nodes.get(id)||null,createElement:element,body:{prepend(node){nodes.set(node.id,node)}},addEventListener(){},visibilityState:'visible'};
 const localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
 const context={localStorage,document,Event,console,setInterval:fn=>intervals.push(fn),setTimeout:fn=>timeouts.push(fn),window:{addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn)},dispatchEvent(event){for(const fn of listeners[event.type]||[])fn(event)}},fetch:async(url,options={})=>{
  if(url==='/api/me')return {ok:true,json:async()=>({user:identity})};
  if(options.method==='POST'){const payload=JSON.parse(options.body);writes.push(payload.state);return save?save(payload.state):{ok:true};}
  return load?load():{ok:true,json:async()=>({state:remote})};
 }};
 vm.runInNewContext(source,context);
 return {storage,nodes,writes,intervals,timeouts,trigger(name){context.window.dispatchEvent(new Event(name))},status(){return nodes.get('cloud-sync-status')?.textContent},async tick(){for(const fn of intervals)fn();await flush()},async timers(){for(const fn of timeouts.splice(0))fn();await flush()}};
}
test('new feature keys participate in cloud saves without arbitrary auth storage',async()=>{
 const f=fixture({initial:{ngMeals:'[{"name":"Dal"}]',ngGroceries:'["Oats"]',ngTrainerHistory:'[]',password:'never upload'}});await flush();
 assert.equal(f.writes.length,1);assert.equal(f.writes[0].ngMeals[0].name,'Dal');assert.deepEqual(f.writes[0].ngGroceries,['Oats']);assert.ok(!('password' in f.writes[0]));assert.equal(f.status(),'Cloud synced');
});
test('pending write is not acknowledged before server success and overlapping changes are serialized',async()=>{
 let release;const f=fixture({initial:{water:'1'},save:()=>new Promise(resolve=>{release=resolve})});await flush();assert.equal(f.writes.length,1);assert.equal(f.status(),'Saving to cloud…');
 f.storage.set('water','2');await f.tick();assert.equal(f.writes.length,1);
 release({ok:true});await flush();await f.timers();assert.equal(f.writes.length,2);assert.equal(f.writes[1].water,2);
 release({ok:true});await flush();assert.equal(f.status(),'Cloud synced');
});
test('failed save is retried and local changes remain on device',async()=>{
 let fail=true;const f=fixture({initial:{water:'1'},save:async()=>({ok:!fail})});await flush();assert.equal(f.status(),'Cloud sync waiting');assert.equal(f.storage.get('water'),'1');
 fail=false;await f.tick();assert.equal(f.writes.length,2);assert.equal(f.status(),'Cloud synced');
});
test('dirty local values survive hydration while clean remote fields refresh',async()=>{
 const ack=JSON.stringify({water:1,steps:100});const f=fixture({initial:{_ngCloudOwner:'alice','_ngCloudState:alice':JSON.stringify({acknowledged:ack}),water:'2',steps:'100'},remote:{water:1,steps:200}});await flush();assert.equal(f.storage.get('water'),'2');assert.equal(f.storage.get('steps'),'200');assert.equal(f.writes[0].water,2);
});
test('switching accounts cannot upload previous account state',async()=>{
 const f=fixture({identity:{id:'bob',email:'b@example.test'},initial:{_ngCloudOwner:'alice',water:'7',ngMeals:'[{"name":"private"}]'},remote:{water:1}});await flush();assert.equal(f.storage.get('water'),'1');assert.equal(f.storage.get('ngMeals'),undefined);assert.ok(f.writes.every(state=>!state.ngMeals));assert.match(f.storage.get('_ngCloudState:alice'),/private/);
});
test('GET failure never blindly uploads stale data over unread cloud state',async()=>{
 let fail=true;const f=fixture({initial:{water:'2'},load:async()=>fail?{ok:false}:{ok:true,json:async()=>({state:{water:1}})}});await flush();assert.equal(f.writes.length,0);assert.match(f.status(),/Cloud unavailable/);fail=false;await f.tick();assert.equal(f.storage.get('water'),'2');assert.equal(f.writes[0].water,2);
});

test('unowned browser data is quarantined and never adopted by a newly registered account',async()=>{
 const f=fixture({identity:{id:'new-user',email:'new@example.test'},initial:{_ngCloudOwner:'',profile:JSON.stringify({weight:'84'}),proteinTarget:'125',ngMeals:JSON.stringify([{name:'Other account meal'}])},remote:{}});await flush();
 assert.equal(f.storage.get('profile'),undefined);assert.equal(f.storage.get('proteinTarget'),undefined);assert.equal(f.storage.get('ngMeals'),undefined);assert.equal(f.writes.length,0);assert.match(f.storage.get('_ngUnassignedState'),/Other account meal/);assert.equal(f.storage.get('_ngCloudOwner'),'new-user');
});
test('new second account with empty cloud starts empty while first account pending data stays owned',async()=>{
 const f=fixture({identity:{id:'bob',email:'b@example.test'},initial:{_ngCloudOwner:'alice',profile:JSON.stringify({weight:'84'}),nutritionLog:JSON.stringify([{name:'Alice food'}]),selectedGuide:'5',water:'7'},remote:{}});await flush();
 assert.equal(f.storage.get('profile'),undefined);assert.equal(f.storage.get('nutritionLog'),undefined);assert.equal(f.storage.get('selectedGuide'),undefined);assert.equal(f.writes.length,0);assert.match(f.storage.get('_ngCloudState:alice'),/Alice food/);
});
test('returning account restores only its own pending snapshot',async()=>{
 const f=fixture({identity:{id:'bob',email:'b@example.test'},initial:{_ngCloudOwner:'alice',water:'7','_ngCloudState:bob':JSON.stringify({pending:{water:2}})},remote:{}});await flush();assert.equal(f.storage.get('water'),'2');assert.ok(f.writes.every(x=>x.water===2));assert.match(f.storage.get('_ngCloudState:alice'),/7/);
});
