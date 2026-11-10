import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const plain = value => String(value ?? '').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
export default class TextReporter {
  constructor(options = {}) {
    this.directory = resolve(options.directory || 'test-reports');
    this.started = new Date();
    this.archive = resolve(this.directory, `playwright-${this.started.toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0,8)}.txt`);
    this.latest = resolve(this.directory, 'playwright-latest.txt');
    this.lines = []; this.suite = null;
  }
  printsToStdio() { return false; }
  save() {
    mkdirSync(this.directory, { recursive: true });
    const text = plain(this.lines.join('\n')) + '\n';
    writeFileSync(this.archive, text, 'utf8');
    writeFileSync(this.latest, text, 'utf8');
  }
  header() {
    if (this.lines.length) return;
    let commit = 'unavailable';
    try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim(); } catch {}
    this.lines.push('NUTRIGUIDE PLAYWRIGHT TEST REPORT', `Started: ${this.started.toISOString()}`, `Commit: ${commit}`, `Runtime: ${process.version} / ${process.platform}`, '');
  }
  onBegin(config, suite) {
    this.header(); this.suite = suite;
    this.lines.push(`Planned executions: ${suite.allTests().length}`, `Workers: ${config.workers}`, `Projects: ${config.projects.map(p => p.name).join(', ')}`, 'Status: RUNNING — partial report until the final summary appears.', '');
    this.save();
  }
  onTestEnd(test, result) {
    this.header();
    this.lines.push(`[${result.status.toUpperCase()}] ${test.titlePath().filter(Boolean).join(' > ')}`, `File: ${test.location.file}:${test.location.line}`, `Attempt: ${result.retry + 1} | Duration: ${result.duration} ms | Expected: ${test.expectedStatus}`);
    for (const error of result.errors || []) this.lines.push('ERROR:', plain(error.stack || error.message || error.value || 'Unknown error'));
    for (const [name, chunks] of [['STDOUT', result.stdout], ['STDERR', result.stderr]]) {
      if (chunks?.length) this.lines.push(`${name}:`, ...chunks.map(plain));
    }
    for (const attachment of result.attachments || []) this.lines.push(`Evidence: ${attachment.name} (${attachment.contentType}) ${attachment.path || '[inline attachment in HTML/JSON report]'}`);
    this.lines.push(''); this.save();
  }
  onStdErr(chunk, test) {
    if (!test) { this.header(); this.lines.push('RUNNER STDERR:', plain(chunk)); this.save(); }
  }
  onStdOut(chunk, test) {
    if (!test) { this.header(); this.lines.push('RUNNER STDOUT:', plain(chunk)); this.save(); }
  }
  onError(error) {
    this.header(); this.lines.push('RUNNER / STARTUP ERROR:', plain(error.stack || error.message || error.value), ''); this.save();
  }
  onEnd(result) {
    this.header();
    const counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
    for (const test of this.suite?.allTests() || []) counts[test.outcome()]++;
    if (!this.suite) this.lines.push('No test suite began. Check runner/startup errors above.');
    this.lines.push('FINAL SUMMARY', `Run status: ${result.status}`, `Finished: ${new Date().toISOString()}`, `Duration: ${result.duration} ms`,
      `Expected outcomes: ${counts.expected}`, `Unexpected outcomes: ${counts.unexpected}`, `Flaky (passed on retry): ${counts.flaky}`, `Skipped / not run: ${counts.skipped}`,
      'Expected outcomes include intentional expected failures, if any. Use each test attempt above for raw passed/failed status.',
      `HTML: ${resolve('playwright-report/index.html')}`, `JSON: ${resolve('test-results/results.json')}`,
      'Send this TXT file for diagnosis. For visual defects, also send the referenced screenshots or trace ZIP.',
      'A report without FINAL SUMMARY is incomplete (for example, a forcibly terminated process).');
    this.save();
  }
}
