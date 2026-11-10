import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the actual route exports. Replace only platform bindings with an
// in-memory SQLite adapter and a controllable authenticated identity.
const source=readFileSync(new URL('../../app/api/state/route.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const migration=readFileSync(new URL('../../drizzle/0000_nutriguide.sql',import.meta.url),'utf8');
function fixture(){
 const sql=new DatabaseSync(':memory:');sql.exec(migration);
 let identity={userId:'alice',email:'alice@example.test',fullName:'Alice',displayName:'Alice'};
 const env={DB:{prepare(query){return {bind(...values){return {async first(){return sql.prepare(query).get(...values)},async run(){return sql.prepare(query).run(...values)}}}}}}};
 const exports={};const context={exports,Response,JSON,Date,console:{error(){}},require(name){if(name==='cloudflare:workers')return {env};if(name==='../../chatgpt-auth')return {getChatGPTUser:async()=>identity};throw Error('Unexpected dependency '+name)}};
 vm.runInNewContext(compiled,context,{filename:'state-route.cjs'});
 return {api:exports,sql,env,user(value){identity=value}};
}
const post=body=>new Request('http://localhost/api/state',{method:'POST',headers:{'content-type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});

test('anonymous GET and POST are denied before database access',async()=>{const f=fixture();f.user(null);delete f.env.DB;assert.equal((await f.api.GET()).status,401);assert.equal((await f.api.POST(post({state:{}}))).status,401);f.sql.close()});
test('new authenticated user receives empty state',async()=>{const f=fixture();assert.deepEqual(await (await f.api.GET()).json(),{authenticated:true,state:{}});f.sql.close()});
test('authenticated save and read round trip preserves nested Unicode values',async()=>{const f=fixture();const state={profile:{name:'ऋषिकेश'},nutritionLog:[{name:'दल',cal:116}],water:0};assert.equal((await f.api.POST(post({state}))).status,200);assert.deepEqual((await (await f.api.GET()).json()).state,state);f.sql.close()});
for(const value of [null,[],42,'state'])test(`invalid state ${JSON.stringify(value)} is rejected`,async()=>{const f=fixture();assert.equal((await f.api.POST(post({state:value}))).status,400);assert.equal(f.sql.prepare('SELECT count(*) AS n FROM user_state').get().n,0);f.sql.close()});
test('malformed JSON is rejected without internal error text',async()=>{const f=fixture();const r=await f.api.POST(post('{invalid'));assert.equal(r.status,400);assert.deepEqual(await r.json(),{error:'Invalid JSON'});f.sql.close()});
test('missing state is rejected',async()=>{const f=fixture();assert.equal((await f.api.POST(post({}))).status,400);f.sql.close()});
for(const length of [249992,249993])test(`serialized state length ${length+8} has correct size boundary`,async()=>{const f=fixture();const r=await f.api.POST(post({state:{x:'x'.repeat(length)}}));assert.equal(r.status,length+8>250000?413:200);f.sql.close()});
test('same user upsert replaces state without creating duplicate rows',async()=>{const f=fixture();await f.api.POST(post({state:{water:1}}));await f.api.POST(post({state:{water:2}}));assert.equal(f.sql.prepare('SELECT count(*) AS n FROM user_state').get().n,1);assert.equal((await (await f.api.GET()).json()).state.water,2);f.sql.close()});
test('Alice and Bob cannot read or overwrite each other through route identity',async()=>{const f=fixture();await f.api.POST(post({state:{private:'alice'}}));f.user({userId:'bob',email:'bob@example.test',fullName:null,displayName:'Bob'});assert.deepEqual((await (await f.api.GET()).json()).state,{});await f.api.POST(post({state:{private:'bob'}}));f.user({userId:'alice',email:'alice@example.test',fullName:'Alice',displayName:'Alice'});assert.equal((await (await f.api.GET()).json()).state.private,'alice');assert.equal(f.sql.prepare('SELECT count(*) AS n FROM user_state').get().n,2);f.sql.close()});
test('SQL injection text is stored as data',async()=>{const f=fixture();const value="'); DROP TABLE user_state; --";await f.api.POST(post({state:{note:value}}));assert.equal((await (await f.api.GET()).json()).state.note,value);assert.equal(f.sql.prepare('SELECT count(*) AS n FROM user_state').get().n,1);f.sql.close()});
test('database outage returns controlled 503 on read and write',async()=>{const f=fixture();delete f.env.DB;for(const r of [await f.api.GET(),await f.api.POST(post({state:{}}))]){assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/SELECT|stack|node_modules/)}f.sql.close()});
test('corrupt database state returns controlled error',async()=>{const f=fixture();f.sql.prepare('INSERT INTO user_state(user_id,state_json,created_at,updated_at) VALUES (?,?,?,?)').run('alice','bad-json','now','now');assert.equal((await f.api.GET()).status,503);f.sql.close()});
test('migration can be safely applied twice and enforces primary key',()=>{const f=fixture();f.sql.exec(migration);f.sql.prepare('INSERT INTO user_state(user_id,created_at,updated_at) VALUES (?,?,?)').run('alice','now','now');assert.throws(()=>f.sql.prepare('INSERT INTO user_state(user_id,created_at,updated_at) VALUES (?,?,?)').run('alice','now','now'));f.sql.close()});
