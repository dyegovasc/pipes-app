const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { computeMetrics, render } = require('./report-metrics.cjs');

function write(root, rel, content) {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), content);
}

function record(status, created, related, extra = '', body = '') {
  return '---\ntitle: T\ndescription: ' + (extra || 'D') + '\nversion: ' + (status === 'revised' ? '1.1' : '1.0') + '\ncreated: ' + created + '\nstatus: ' + (status === 'revised' ? 'accepted' : status) + '\nrelated:\n' + related.map((item) => '  - ' + item).join('\n') + '\n---\n' + body + '\n';
}

test('metrics are computed from records, reviews, corrections, and eval runs', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-metrics-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const I1 = '.pipes/project/01-intents/intent-001-a.md';
  const S1 = '.pipes/project/02-specs/spec-001-a.md';
  const P1 = '.pipes/project/04-plans/plan-001-a.md';
  const O1 = '.pipes/project/06-outcomes/outcome-001-a.md';
  const R1 = '.pipes/project/07-artifacts/reviews/artifact-001-review-x-pr-1.md';
  write(root, I1.slice(7), record('done', '2026-11-01', [S1]));
  write(root, 'project/01-intents/intent-002-b.md', record('rejected', '2026-11-02', []));
  write(root, 'project/01-intents/intent-003-c.md', record('draft', '2026-11-03', []));
  write(root, S1.slice(7), record('revised', '2026-11-04', [I1, P1]));
  write(root, P1.slice(7), record('done', '2026-11-06', [S1, O1, R1]));
  write(root, O1.slice(7), '---\ntitle: O\ndescription: D\nversion: 1.0\ncreated: 2026-11-10\nstatus: recorded\nrelated:\n  - ' + P1 + '\nresult: succeeded\n---\n');
  write(root, R1.slice(7), record('final', '2026-11-09', [P1], 'ready with findings: 1 blocking, 0 major, 0 minor.', '## Verification\n\n| Acceptance criterion or requirement | Result | Evidence |\n| --- | --- | --- |\n| R1 | proved | test |\n| R2 | not proved | none |\n\n## Findings\n\n| Severity | Location | Rule or requirement | Finding | Correction |\n| --- | --- | --- | --- | --- |\n| blocking | `a.java:1` | rule-money-and-time | double | Money |\n'));
  write(root, 'ai-instructions/corrections.md', '## Things\n\n- Use the :service: prefix.\n');
  write(root, 'utils/state/evals/2026-11-11T00.json', JSON.stringify({ results: [{ passed: true }, { passed: false }] }));

  const metrics = computeMetrics(root);
  assert.deepEqual(metrics.intents.byStatus, { done: 1, rejected: 1, draft: 1 });
  assert.equal(metrics.intents.survivalRatePercent, 50);
  assert.deepEqual(metrics.intentToFirstSpecDays, { n: 1, median: 3 });
  assert.deepEqual(metrics.specToFirstPlanDays, { n: 1, median: 2 });
  assert.deepEqual(metrics.specsRevisedAfterPlan, { revised: 1, withPlans: 1 });
  assert.equal(metrics.plans.firstPassSuccessPercent, 100);
  assert.deepEqual(metrics.plans.planToOutcomeDays, { n: 1, median: 4 });
  assert.deepEqual(metrics.reviews.verdicts, { 'ready with findings': 1 });
  assert.equal(metrics.reviews.blockingFindings, 1);
  assert.equal(metrics.reviews.policyRuleFindings, 1);
  assert.equal(metrics.reviews.verifierProvedPercent, 50);
  assert.equal(metrics.corrections, 1);
  assert.deepEqual(metrics.evals.lastRun, { run: '2026-11-11T00', cases: 2, passed: 1 });
  assert.match(render(metrics), /\| Intent survival rate \| 50% \|/);
});

test('an empty project reports n/a instead of failing', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-metrics-empty-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const metrics = computeMetrics(root);
  assert.equal(metrics.intents.total, 0);
  assert.match(render(metrics), /\| Intent survival rate \| n\/a \|/);
});
