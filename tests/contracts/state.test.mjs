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
 const exports={};const context={exports,Response,JSON,Date,TextDecoder,console:{error(){}},require(name){if(name==='cloudflare:workers')return {env};if(name==='../../chatgpt-auth')return {getChatGPTUser:async()=>identity};throw Error('Unexpected dependency '+name)}};
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

test('authenticated and anonymous state responses cannot be cached',async()=>{const f=fixture();for(const identity of [{userId:'alice',email:'a@example.test',fullName:null,displayName:'A'},null]){f.user(identity);for(const r of [await f.api.GET(),await f.api.POST(post({state:{}}))])assert.match(r.headers.get('cache-control'),/no-store/)}f.sql.close()});
test('stored JSON arrays are treated as corrupt state',async()=>{const f=fixture();f.sql.prepare('INSERT INTO user_state(user_id,state_json,created_at,updated_at) VALUES (?,?,?,?)').run('alice','[]','now','now');assert.equal((await f.api.GET()).status,503);f.sql.close()});

const requestByteLimit=1_048_576;
test('oversized declared content length is rejected before reading body',async()=>{const f=fixture();let touched=false;const request={headers:new Headers({'content-length':String(requestByteLimit+1)}),get body(){touched=true;throw Error('must not read')}};assert.equal((await f.api.POST(request)).status,413);assert.equal(touched,false);f.sql.close()});
test('authentication is checked before request headers or stream are inspected',async()=>{const f=fixture();f.user(null);const request={get headers(){throw Error('must not inspect')},get body(){throw Error('must not read')}};assert.equal((await f.api.POST(request)).status,401);f.sql.close()});
test('chunked request over byte cap is rejected without content-length and stream is cancelled',async()=>{const f=fixture();let cancelled=false;let chunks=0;const stream=new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(65536));chunks++;if(chunks>20)controller.close()},cancel(){cancelled=true}});const req=new Request('http://localhost/api/state',{method:'POST',body:stream,duplex:'half'});assert.equal(req.headers.get('content-length'),null);assert.equal((await f.api.POST(req)).status,413);assert.equal(cancelled,true);assert.equal(f.sql.prepare('SELECT count(*) AS n FROM user_state').get().n,0);f.sql.close()});
test('exact request byte cap permits a small valid state despite ignored wrapper padding',async()=>{const f=fixture();const fixed=JSON.stringify({state:{},padding:''});const raw=JSON.stringify({state:{},padding:'x'.repeat(requestByteLimit-fixed.length)});assert.equal(Buffer.byteLength(raw),requestByteLimit);assert.equal((await f.api.POST(post(raw))).status,200);f.sql.close()});
test('one byte over cap is rejected even with a misleading smaller content-length',async()=>{const f=fixture();const raw=' '.repeat(requestByteLimit+1);const req=new Request('http://localhost/api/state',{method:'POST',headers:{'content-length':'1'},body:raw});assert.equal((await f.api.POST(req)).status,413);f.sql.close()});
test('UTF-8 code points split across chunks decode and round-trip correctly',async()=>{const f=fixture();const state={text:'ऋषिकेश 🥗 界'};const bytes=new TextEncoder().encode(JSON.stringify({state}));let i=0;const stream=new ReadableStream({pull(controller){if(i<bytes.length)controller.enqueue(bytes.slice(i,i+=1));else controller.close()}});const req=new Request('http://localhost/api/state',{method:'POST',body:stream,duplex:'half'});assert.equal((await f.api.POST(req)).status,200);assert.deepEqual((await (await f.api.GET()).json()).state,state);f.sql.close()});
test('large Unicode state retains the 250k character limit rather than incorrectly using bytes',async()=>{const f=fixture();const state={text:'界'.repeat(200000)};assert.ok(Buffer.byteLength(JSON.stringify({state}))<requestByteLimit);assert.equal((await f.api.POST(post({state}))).status,200);assert.deepEqual((await (await f.api.GET()).json()).state,state);f.sql.close()});
test('invalid UTF-8 under byte cap returns controlled malformed input response',async()=>{const f=fixture();const req=new Request('http://localhost/api/state',{method:'POST',body:new Uint8Array([0xff,0xfe])});assert.equal((await f.api.POST(req)).status,400);f.sql.close()});
