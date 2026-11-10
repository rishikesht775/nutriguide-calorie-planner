import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import Reporter from '../reporters/text-reporter.mjs';

test('TXT preserves errors, retry evidence, summaries and timestamp copy',()=>{
 const directory=mkdtempSync(join(tmpdir(),'ng-report-'));
 try{
  const r=new Reporter({directory});const item={titlePath:()=>['chromium','Trainer','pause'],location:{file:'trainer.spec.ts',line:9},expectedStatus:'passed',outcome:()=> 'flaky'};
  r.onBegin({workers:1,projects:[{name:'chromium'}]},{allTests:()=>[item]});
  r.onTestEnd(item,{status:'failed',retry:0,duration:120,errors:[{stack:'\x1b[31mExpected 1, received 2\x1b[0m'}],stdout:[Buffer.from('debug output')],stderr:[],attachments:[{name:'screenshot',contentType:'image/png',path:'test-results/failure.png'}]});
  r.onTestEnd(item,{status:'passed',retry:1,duration:90,errors:[],attachments:[]});r.onEnd({status:'passed',duration:210});
  const text=readFileSync(join(directory,'playwright-latest.txt'),'utf8');assert.match(text,/Expected 1, received 2/);assert.doesNotMatch(text,/\x1b/);assert.match(text,/Attempt: 2/);assert.match(text,/Flaky \(passed on retry\): 1/);assert.match(text,/test-results\/failure.png/);assert.match(text,/FINAL SUMMARY/);assert.equal(readdirSync(directory).length,2);
 }finally{rmSync(directory,{recursive:true,force:true})}
});
test('startup failure produces TXT even before onBegin',()=>{
 const directory=mkdtempSync(join(tmpdir(),'ng-report-'));
 try{const r=new Reporter({directory});r.onError({message:'Server failed to start'});r.onEnd({status:'failed',duration:0});assert.match(readFileSync(join(directory,'playwright-latest.txt'),'utf8'),/Server failed to start/)}finally{rmSync(directory,{recursive:true,force:true})}
});
