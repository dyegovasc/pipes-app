const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  frontmatter,
  run,
  validateProjectRecords,
} = require('./validate-project-records.cjs');

const COMMON = ['title', 'description', 'version', 'created', 'status', 'related'];
const AREAS = [
  ['00-notes', 'draft'],
  ['01-intents', 'draft'],
  ['02-specs', 'draft'],
  ['03-missions', 'draft'],
  ['04-plans', 'draft'],
  ['05-decisions', 'draft'],
  ['06-outcomes', 'recorded'],
  ['07-artifacts', 'draft'],
];

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function config(fields, status) {
  return [
    '---',
    'statuses:',
    '  - id: ' + status,
    'fields:',
    ...fields.flatMap((field) => ['  - id: ' + field, '    label: ' + field, '    type: text']),
    '---',
    '',
  ].join('\n');
}

function validMission() {
  return [
    '---',
    'title: Validate Records',
    'description: Validate the fixture.',
    'version: 1.0',
    'created: 2026-07-16',
    'status: draft',
    'related: []',
    'loop: loop-framework-maintenance',
    '---',
    '## Objective',
    'Validate project records.',
    '## Scope',
    'In scope: fixture validation.',
    '## Operating Envelope',
    'Autonomy profile: delegated_until_escalation',
    'Human-intervention level: less',
    'Allowed: read files.',
    '## Roles',
    'Primary: roadmapper.',
    '## Current State',
    'Phase: framed',
    '## Gates',
    'None.',
    '## Validation',
    'Check: validator; Result: pass; Relevance: fixture; Evidence: none.',
    '## Stop',
    'Complete when validated.',
    '## Next Actions',
    '1. Run the validator.',
    '## Journal',
    '### 2026-07-16 10:00:00 — Created',
    'Fixture created.',
    '',
  ].join('\n');
}

function validPlan(status = 'active', outcomes = []) {
  return [
    '---',
    'title: Validate Plan Closure',
    'description: Validate plan and outcome relationships.',
    'version: 1.0',
    'created: 2026-07-30',
    'status: ' + status,
    outcomes.length ? 'related:\n' + outcomes.map((value) => '  - ' + value).join('\n') : 'related: []',
    '---',
    '## Outcome',
    'Validate plan closure.',
    '',
  ].join('\n');
}

function validOutcome(planPath, result = 'succeeded') {
  return [
    '---',
    'title: Validate Plan Outcome',
    'description: Record plan closure.',
    'version: 1.0',
    'created: 2026-07-30',
    'status: recorded',
    'related:',
    '  - ' + planPath,
    'result: ' + result,
    '---',
    '## Summary',
    'Validated closure.',
    '',
  ].join('\n');
}

function missionWithDelivery() {
  return validMission().replace('## Operating Envelope', [
    '## Delivery',
    'Approach: `spec-driven`',
    'Approach rationale: Planning improves coordination.',
    'Loop capabilities:',
    '- Planning: available through `pipeline-plan-new-feature`',
    '- Plan execution: available through `pipeline-execute-plan`',
    'Themes:',
    '1. **Delivery contracts** — `plan-recommended`',
    '   - Outcome: Add readable routing.',
    '   - Depends on: none',
    '   - Affected contract families: missions and loops',
    '   - Route: plan before execution',
    '   - Promotion trigger: material architecture choice',
    'Current theme: Delivery contracts',
    '## Operating Envelope',
  ].join('\n'));
}

function missionWithNonJournalLines(count) {
  const lines = validMission().split('\n');
  const journalIndex = lines.indexOf('## Journal');
  assert.ok(journalIndex >= 0);
  assert.ok(count >= journalIndex);
  lines.splice(journalIndex, 0, ...Array(count - journalIndex).fill('Padding line.'));
  return lines.join('\n');
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-record-validator-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [area, status] of AREAS) {
    const fields = area === '03-missions' ? [...COMMON, 'loop'] : area === '06-outcomes' ? [...COMMON, 'result'] : COMMON;
    write(root, path.join('project', area, 'config.md'), config(fields, status));
  }
  write(root, 'utils/loops/loop-framework-maintenance.md', [
    '# Framework Maintenance Loop',
    '',
    'Mission phases use `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`; status alone owns lifecycle state. Specialized mission phases: none.',
    '',
  ].join('\n'));
  write(root, 'project/03-missions/mission-001-validate-records.md', validMission());
  return root;
}

test('report mode finds valid records without mutation and strict mode agrees', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  const before = fs.readFileSync(mission, 'utf8');
  const report = run({ root });
  assert.equal(report.failed, false);
  assert.deepEqual(report.findings.map((item) => item.level), ['info']);
  assert.equal(fs.readFileSync(mission, 'utf8'), before);
  assert.equal(run({ root, strict: true }).failed, false);
});

test('default mode reports record defects while strict mode fails them', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  const invalid = validMission()
    .replace('related: []', 'related:\n  - .pipes/project/03-missions/missing.md')
    .replace('loop: loop-framework-maintenance', 'loop: loop-missing\noutcome: null')
    .replace('2026-07-16 10:00:00', '2026-07-16');
  fs.writeFileSync(mission, invalid, 'utf8');
  const findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'field-unsupported'));
  assert.ok(findings.some((item) => item.code === 'related-missing'));
  assert.ok(findings.some((item) => item.code === 'mission-loop'));
  assert.ok(findings.some((item) => item.code === 'journal-timestamp'));
  assert.equal(run({ root }).failed, false);
  assert.equal(run({ root, strict: true }).failed, true);
});

test('mission line quota counts only physical lines before Journal', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  fs.writeFileSync(mission, missionWithNonJournalLines(300), 'utf8');
  assert.ok(!validateProjectRecords(root).some((item) => item.code === 'mission-line-limit'));

  fs.writeFileSync(mission, missionWithNonJournalLines(300).replace(/\n/g, '\r\n'), 'utf8');
  assert.ok(!validateProjectRecords(root).some((item) => item.code === 'mission-line-limit'));

  fs.writeFileSync(mission, missionWithNonJournalLines(301), 'utf8');
  assert.ok(validateProjectRecords(root).some((item) => item.code === 'mission-line-limit'));

  const largeJournal = missionWithNonJournalLines(300).replace('Fixture created.', 'Fixture created.\n' + Array(500).fill('Journal history.').join('\n'));
  fs.writeFileSync(mission, largeJournal, 'utf8');
  assert.ok(!validateProjectRecords(root).some((item) => item.code === 'mission-line-limit'));

  fs.writeFileSync(mission, validMission().replace('## Journal\n', ''), 'utf8');
  const missingJournal = validateProjectRecords(root);
  assert.ok(missingJournal.some((item) => item.code === 'mission-section' && item.message.includes('Journal')));
});

test('mission Journal headings must remain ascending and Created uses a real time', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  fs.writeFileSync(mission, validMission().replace('Fixture created.', 'Fixture created.\n\n### 2026-07-16 10:00:01 — Updated\nUpdated.'), 'utf8');
  assert.ok(!validateProjectRecords(root).some((item) => item.code === 'journal-order'));
  fs.writeFileSync(mission, validMission().replace('10:00:00', '00:00:00'), 'utf8');
  assert.ok(validateProjectRecords(root).some((item) => item.code === 'journal-created-time'));
  fs.writeFileSync(mission, validMission().replace('Fixture created.', 'Fixture created.\n\n### 2026-07-16 09:59:59 — Updated\nUpdated.'), 'utf8');
  assert.ok(validateProjectRecords(root).some((item) => item.code === 'journal-order'));
});

test('mission intervention mapping preserves legacy records but rejects incomplete or incompatible values', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  for (const [level, profile] of [
    ['less', 'delegated_until_escalation'],
    ['more', 'user_mediated'],
    ['context-dependent', 'mixed'],
  ]) {
    const mapped = validMission()
      .replace('Autonomy profile: delegated_until_escalation', 'Autonomy profile: ' + profile)
      .replace('Human-intervention level: less', 'Human-intervention level: ' + level);
    fs.writeFileSync(mission, mapped, 'utf8');
    assert.ok(!validateProjectRecords(root).some((item) => item.code.startsWith('mission-intervention')));
  }
  const legacy = validMission()
    .replace('Autonomy profile: delegated_until_escalation\n', '')
    .replace('Human-intervention level: less\n', '');
  fs.writeFileSync(mission, legacy, 'utf8');
  let findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.level === 'warning' && item.code === 'mission-intervention-legacy'));
  assert.ok(!findings.some((item) => item.level === 'error' && item.code.startsWith('mission-intervention')));

  fs.writeFileSync(mission, validMission().replace('Human-intervention level: less\n', ''), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'mission-intervention-incomplete'));

  fs.writeFileSync(mission, validMission().replace('Autonomy profile: delegated_until_escalation', 'Autonomy profile: user_mediated'), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'mission-intervention-mapping'));
});

test('active mission awaiting execution approval remains record-valid without an approval receipt', (t) => {
  const root = fixture(t);
  const configPath = path.join(root, 'project/03-missions/config.md');
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  fs.writeFileSync(configPath, fs.readFileSync(configPath, 'utf8').replace('  - id: draft', '  - id: draft\n  - id: active'), 'utf8');
  const activeAwaitingApproval = validMission()
    .replace('status: draft', 'status: active')
    .replace('Phase: framed', [
      'Phase: framed',
      'Active workflow: none',
      'Pending gate: mission execution; human_mandatory; user; pending',
      'Resume trigger: explicit execution approval; activate the mission and run the first Next Action',
      'Last result: Mission created; execution has not started.',
    ].join('\n'));
  fs.writeFileSync(mission, activeAwaitingApproval, 'utf8');
  const findings = validateProjectRecords(root);
  assert.ok(!findings.some((item) => item.level === 'error' || item.level === 'blocked'));
});

test('delivery-aware missions validate present routing while legacy missions remain readable', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');

  fs.writeFileSync(mission, missionWithDelivery(), 'utf8');
  let findings = validateProjectRecords(root);
  assert.ok(!findings.some((item) => item.code.startsWith('mission-delivery')));
  assert.ok(!findings.some((item) => item.code === 'mission-plan-evidence'));

  fs.writeFileSync(mission, missionWithDelivery().replace('Approach: `spec-driven`', 'Approach: `invented`'), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'mission-delivery-approach'));

  fs.writeFileSync(mission, missionWithDelivery().replace('Current theme: Delivery contracts', 'Current theme: Missing theme'), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'mission-delivery-current-theme'));

  fs.writeFileSync(mission, validMission(), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(!findings.some((item) => item.code.startsWith('mission-delivery')));
});

test('active mission relationships must be reciprocal and spec-driven execution keeps plan receipts readable', (t) => {
  const root = fixture(t);
  const missionPath = '.pipes/project/03-missions/mission-001-validate-records.md';
  const planPath = '.pipes/project/04-plans/plan-001-validate-closure.md';
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  const plan = path.join(root, 'project/04-plans/plan-001-validate-closure.md');
  const missionConfig = path.join(root, 'project/03-missions/config.md');
  fs.writeFileSync(missionConfig, fs.readFileSync(missionConfig, 'utf8').replace('  - id: draft', '  - id: draft\n  - id: active'), 'utf8');
  write(root, 'project/04-plans/plan-001-validate-closure.md', validPlan('active', [missionPath]));
  fs.writeFileSync(mission, missionWithDelivery()
    .replace('status: draft', 'status: active')
    .replace('related: []', 'related:\n  - ' + planPath)
    .replace('Phase: framed', [
      'Phase: acting',
      'Active workflow: pipeline-execute-plan',
      'Plan evidence: ' + planPath + ' version `1.0`; plan-content approval receipt pass; final-validation receipt pass.',
    ].join('\n')), 'utf8');
  let findings = validateProjectRecords(root);
  assert.ok(!findings.some((item) => item.code === 'mission-related-reciprocal'));
  assert.ok(!findings.some((item) => item.code === 'mission-plan-evidence'));

  fs.writeFileSync(plan, validPlan('active'), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'mission-related-reciprocal'));

  fs.writeFileSync(plan, validPlan('active', [missionPath]), 'utf8');
  fs.writeFileSync(mission, fs.readFileSync(mission, 'utf8').replace('plan-content approval receipt pass; ', ''), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'mission-plan-evidence'));
});

test('plan outcome relationships validate reciprocity and uniqueness without requiring historical backfill', (t) => {
  const root = fixture(t);
  const planPath = '.pipes/project/04-plans/plan-001-validate-closure.md';
  const outcomeOne = '.pipes/project/06-outcomes/outcome-001-validate-closure.md';
  const outcomeTwo = '.pipes/project/06-outcomes/outcome-002-validate-closure.md';
  const plan = path.join(root, 'project/04-plans/plan-001-validate-closure.md');
  const planConfig = path.join(root, 'project/04-plans/config.md');
  fs.writeFileSync(planConfig, fs.readFileSync(planConfig, 'utf8').replace('  - id: draft', '  - id: draft\n  - id: active\n  - id: done'), 'utf8');

  write(root, 'project/04-plans/plan-001-validate-closure.md', validPlan('active', [outcomeOne]));
  write(root, 'project/06-outcomes/outcome-001-validate-closure.md', validOutcome(planPath));
  let findings = validateProjectRecords(root);
  assert.ok(!findings.some((item) => item.code.startsWith('plan-outcome')));

  fs.writeFileSync(plan, validPlan('active'), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.level === 'error' && item.code === 'plan-outcome-reciprocal'));

  fs.writeFileSync(plan, validPlan('active', [outcomeOne, outcomeTwo]), 'utf8');
  write(root, 'project/06-outcomes/outcome-002-validate-closure.md', validOutcome(planPath, 'failed'));
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.level === 'error' && item.code === 'plan-outcome-duplicate'));

  fs.writeFileSync(plan, validPlan('done', [outcomeOne, outcomeTwo]), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.level === 'warning' && item.code === 'plan-outcome-duplicate'));
  assert.equal(run({ root, strict: true }).failed, false);

  fs.writeFileSync(plan, validPlan('done'), 'utf8');
  fs.rmSync(path.join(root, 'project/06-outcomes/outcome-001-validate-closure.md'));
  fs.rmSync(path.join(root, 'project/06-outcomes/outcome-002-validate-closure.md'));
  findings = validateProjectRecords(root);
  assert.ok(!findings.some((item) => item.code.startsWith('plan-outcome')));
});

function chainRecord(title, related, body) {
  return [
    '---',
    'title: ' + title,
    'description: Fixture record.',
    'version: 1.0',
    'created: 2026-11-11',
    'status: draft',
    related.length ? 'related:\n' + related.map((value) => '  - ' + value).join('\n') : 'related: []',
    '---',
    ...body,
    '',
  ].join('\n');
}

test('intent, spec, and plan chain validates requirement IDs and plan traceability', (t) => {
  const root = fixture(t);
  const intentPath = '.pipes/project/01-intents/intent-001-faster-search.md';
  const specPath = '.pipes/project/02-specs/spec-001-faster-search.md';
  const planFile = 'project/04-plans/plan-001-faster-search.md';
  const specFile = 'project/02-specs/spec-001-faster-search.md';
  const planPath = '.pipes/' + planFile;
  const spec = (requirements, related = [intentPath, planPath]) => chainRecord('Faster Search', related, [
    '## Intent', intentPath, '', '## Requirements', ...requirements, '', '## Design', 'Cache results.',
  ]);
  const plan = (traceability) => chainRecord('Faster Search Plan', [specPath], [
    '## Outcome', 'Search is faster.', '', ...traceability, '', '## Implementation', '1. Add cache.',
  ]);
  const codes = () => validateProjectRecords(root).map((item) => item.level + ':' + item.code);

  write(root, 'project/01-intents/intent-001-faster-search.md', chainRecord('Faster Search', [specPath], ['## Problem', 'Search is slow.']));
  write(root, specFile, spec(['- **R1** Search answers within 300 ms.', '- **R2** Results stay fresh for 5 minutes.']));
  write(root, planFile, plan(['## Spec Traceability', '', '| Requirement | Steps | Proof |', '| --- | --- | --- |', '| R1 | 1 | load test |', '| R2 | 1 | cache test |']));
  assert.deepEqual(codes(), ['info:records-valid']);

  write(root, planFile, plan(['## Spec Traceability', '', '| R1 | 1 | load test |', '| R9 | 1 | none |']));
  assert.ok(codes().includes('error:plan-requirement-unknown'));

  write(root, planFile, plan([]));
  assert.ok(codes().includes('error:plan-traceability-missing'));

  write(root, planFile, plan(['## Spec Traceability', '', '| R1 | 1 | load test |']));
  write(root, specFile, spec(['- **R1** Search answers within 300 ms.', '- **R1** Duplicate.']));
  assert.ok(codes().includes('error:spec-requirement-duplicate'));

  write(root, specFile, spec(['No numbered requirements.'], [planPath]));
  const found = codes();
  assert.ok(found.includes('warning:spec-requirements-missing'));
  assert.ok(found.includes('warning:spec-intent-missing'));
  assert.ok(found.includes('error:plan-requirement-unknown'));
});

test('related parsing accepts the canonical block list and never misreads other forms', () => {
  const parse = (entry) => frontmatter('---\ntitle: X\n' + entry + 'status: draft\n---\nBody\n');
  const empty = parse('related: []\n');
  assert.deepEqual([empty.related, empty.relatedStyle], [[], 'block']);
  const block = parse('related:\n  - .pipes/a.md\n  - ".pipes/b c.md"\n');
  assert.deepEqual([block.related, block.relatedStyle], [['.pipes/a.md', '.pipes/b c.md'], 'block']);
  const crlf = frontmatter('---\r\nrelated:\r\n  - .pipes/a.md\r\nstatus: draft\r\n---\r\n');
  assert.deepEqual([crlf.related, crlf.relatedStyle], [['.pipes/a.md'], 'block']);
  const flow = parse('related: [".pipes/a.md"]\n');
  assert.deepEqual([flow.related, flow.relatedStyle], [['.pipes/a.md'], 'flow']);
  for (const invalid of ['related:\n  [".pipes/a.md"]\n', 'related: .pipes/a.md\n', 'related:\n', 'related: [.pipes/a.md]\n', 'related:\n  - .pipes/a.md\n    nested: true\n']) {
    assert.equal(parse(invalid).related, null, invalid);
  }
  assert.equal(frontmatter('---\ntitle: X\n---\n').related, null);
});

test('one-line related lists warn as noncanonical while unreadable forms fail format', (t) => {
  const root = fixture(t);
  const mission = path.join(root, 'project/03-missions/mission-001-validate-records.md');
  fs.writeFileSync(mission, validMission().replace('related: []', 'related: [ ]'), 'utf8');
  let findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'related-noncanonical' && item.level === 'warning'));
  assert.ok(!findings.some((item) => item.code === 'related-format'));
  fs.writeFileSync(mission, validMission().replace('related: []', 'related:\n  []'), 'utf8');
  findings = validateProjectRecords(root);
  assert.ok(findings.some((item) => item.code === 'related-format' && item.level === 'error'));
  assert.ok(!findings.some((item) => item.code === 'related-noncanonical'));
});
