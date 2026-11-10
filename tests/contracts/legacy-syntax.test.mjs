import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('public/legacy.html','utf8');
test('every inline application script parses before release',()=>{
 let checked=0;
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=/.test(match[1]) || /type\s*=\s*["'](?:module|application\/[^"']+)["']/.test(match[1]))continue;
  const line=html.slice(0,match.index).split('\n').length;
  assert.doesNotThrow(()=>new vm.Script(match[2],{filename:`legacy.html-inline-at-line-${line}`}),`Inline script at HTML line ${line} must parse`);
  checked++;
 }
 assert.ok(checked>=15,'The legacy application scripts must be present, not removed to pass syntax checks.');
});
