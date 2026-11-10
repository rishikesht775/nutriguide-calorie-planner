import {test} from 'node:test';
import assert from 'node:assert/strict';
import {devArguments,testServerSettings} from '../../scripts/dev-server-settings.mjs';
test('tests use a dedicated port and bind the matching loopback address',()=>{
 const s=testServerSettings();assert.equal(s.baseURL,'http://127.0.0.1:5187');assert.equal(s.local,true);
 assert.deepEqual(devArguments(s.args,{port:'5174'}),['--port','5187','--hostname','127.0.0.1']);
});
test('explicit test URL sets the actual launched port in both execution profiles',()=>{
 for(const managed of [false,true]){const s=testServerSettings('http://127.0.0.1:5174',managed);assert.deepEqual(devArguments(s.args,{managedLinux:managed,port:'5173'}),['--port','5174',managed?'--host':'--hostname','127.0.0.1']);}
});
test('manual dev honors PORT and CLI overrides without duplicate defaults',()=>{
 assert.deepEqual(devArguments([],{port:'5174'}),['--port','5174']);
 for(const args of [['--port','5190'],['--port=5190'],['-p','5190']])assert.deepEqual(devArguments(args,{port:'5174'}),args);
 assert.deepEqual(devArguments([],{managedLinux:true,port:undefined}),[]);
 assert.throws(()=>devArguments([],{port:'invalid'}));assert.throws(()=>devArguments([],{port:'65536'}));
});
test('remote URLs never launch a local server and deceptive hostnames remain remote',()=>{
 assert.equal(testServerSettings('https://example.com').local,false);
 assert.equal(testServerSettings('http://localhost.evil.example').local,false);
 assert.throws(()=>testServerSettings('file:///tmp/app'));assert.throws(()=>testServerSettings('http://user:secret@localhost'));
});
test('localhost and IPv6 launch arguments match the requested target',()=>{
 assert.deepEqual(testServerSettings('http://localhost:5191').args,['--port','5191','--hostname','localhost']);
 assert.deepEqual(testServerSettings('http://[::1]:5192',true).args,['--port','5192','--host','::1']);
});
