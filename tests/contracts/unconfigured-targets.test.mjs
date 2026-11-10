import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context={window:{}};
vm.runInNewContext(readFileSync('public/app/personal-plan-engine.js','utf8'),context);
const core=context.window.NGPersonalCore;
const profile={age:'30',sex:'male',height:'168',weight:'84',activity:'1.375',goal:'loss'};
test('missing profile cannot use a stale plan as personal targets',()=>{
 const target=core.targets(null,{calories:1800,protein:100});
 assert.equal(target.ready,false);assert.equal(target.cal,0);assert.equal(target.p,0);
});
test('incomplete profile and missing plan have no personal targets',()=>{
 assert.equal(core.targets({...profile,weight:''},core.derive(profile)).ready,false);
 assert.equal(core.targets(profile,null).ready,false);
});
test('completed profile shares calculated targets rather than generic defaults',()=>{
 const target=core.targets(profile,core.derive(profile));
 assert.equal(target.ready,true);assert.equal(target.cal,1950);assert.equal(target.p,118);
});
test('intentional custom targets including 1800 remain valid after setup',()=>{
 const target=core.targets(profile,core.derive(profile,{targets:{calories:1800,protein:100}}));
 assert.equal(target.ready,true);assert.equal(target.cal,1800);assert.equal(target.p,100);
});
