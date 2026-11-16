const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ADAPTERS, CHECKS, createWorkspace, evaluate, globToRegExp, loadCases, parseArgs } = require('./run-evals.cjs');

// The install folder: `.pipes` when installed, `.pipes.example` when the starter is checked in starter mode.
const PIPES = path.basename(path.resolve(__dirname, '..', '..'));

test('every eval case is well formed and uses known check types', () => {
  const cases = loadCases();
  assert.ok(cases.length >= 10);
  const walk = (checks) => checks.forEach((check) => {
    assert.ok(CHECKS[check.type], check.type + ' is a known check');
    if (check.type === 'any') walk(check.checks);
  });
  for (const evalCase of cases) walk(evalCase.checks);
});

test('glob patterns match project-relative paths', () => {
  assert.ok(globToRegExp('.pipes/project/02-specs/spec-*.md').test('.pipes/project/02-specs/spec-001-x.md'));
  assert.ok(!globToRegExp('.pipes/project/02-specs/spec-*.md').test('.pipes/project/02-specs/sub/spec-001.md'));
  assert.ok(globToRegExp('.pipes/utils/state/**').test('.pipes/utils/state/evals/run.json'));
  assert.ok(globToRegExp('CLAUDE.md').test('CLAUDE.md'));
});

test('claude adapter runs headless with project settings, a budget cap, and no session persistence', () => {
  const { bin, args } = ADAPTERS.claude.command({ prompt: 'do it' }, parseArgs(['node', 'x', '--budget', '0.5']));
  assert.equal(bin, 'claude');
  for (const flag of ['-p', '--no-session-persistence']) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf('--setting-sources') + 1], 'project');
  assert.equal(args[args.indexOf('--max-budget-usd') + 1], '0.5');
  assert.equal(args[args.indexOf('--output-format') + 1], 'stream-json');
});

test('stream-json parsing collects tool uses, tool results, and the final result', () => {
  const lines = [
    { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Read', input: { file_path: '.pipes/ai-instructions/core-workflows.md' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', content: [{ type: 'text', text: 'Direct pushes to main are not allowed' }], is_error: true }] } },
    { type: 'result', result: 'Done. Journal is required.', total_cost_usd: 0.12, is_error: false },
  ].map((item) => JSON.stringify(item)).join('\n');
  const trace = ADAPTERS.claude.parse(lines);
  assert.equal(trace.toolUses[0].name, 'Read');
  assert.match(trace.toolResults[0].text, /Direct pushes/);
  assert.equal(trace.cost, 0.12);
});

test('disposable workspace applies setup files and checks evaluate its changes', (t) => {
  const evalCase = {
    id: 'unit',
    setup: { [PIPES + '/project/02-specs/spec-001-x.md']: '---\ntitle: X\nstatus: draft\n---\n- **R1** Do it.\n' },
    may_change: [PIPES + '/project/02-specs/**'],
    checks: [
      { type: 'frontmatter', glob: PIPES + '/project/02-specs/spec-*.md', field: 'status', equals: 'draft' },
      { type: 'file_matches', glob: PIPES + '/project/02-specs/spec-*.md', pattern: '^- \\*\\*R1\\*\\* ' },
      { type: 'unchanged', glob: PIPES + '/manifest.json' },
      { type: 'only_changed' },
      { type: 'tool_called', pattern: 'core-workflows\\.md' },
      { type: 'any', checks: [{ type: 'result_matches', pattern: 'nope' }, { type: 'tool_result_matches', pattern: 'not allowed' }] },
    ],
  };
  const root = createWorkspace(evalCase);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.ok(fs.existsSync(path.join(root, PIPES + '/manifest.json')), 'tracked files are copied');
  const copied = require('node:child_process').execSync('git ls-files', { cwd: root, encoding: 'utf8' }).trim();
  const ignored = require('node:child_process').spawnSync('git', ['check-ignore', '--no-index', '--stdin'], { cwd: path.resolve(__dirname, '..', '..', '..'), input: copied, encoding: 'utf8' }).stdout.trim();
  assert.equal(ignored, '', 'no git-ignored file of the workspace is copied');
  fs.writeFileSync(path.join(root, PIPES + '/project/02-specs/spec-001-x.md'), '---\ntitle: X\nstatus: draft\n---\n- **R1** Do it now.\n');
  const trace = { toolUses: [{ name: 'Read', input: { file_path: PIPES + '/ai-instructions/core-workflows.md' } }], toolResults: [{ text: 'not allowed' }], result: 'ok', cost: 0 };
  const result = evaluate(evalCase, root, trace);
  assert.deepEqual(result.checks.map((check) => check.passed), [true, true, true, true, true, true]);

  fs.writeFileSync(path.join(root, 'CLAUDE.md'), 'hand edit\n');
  assert.equal(evaluate(evalCase, root, trace).checks[3].passed, false, 'a change outside may_change fails only_changed');
});

test('validator_clean ignores findings that existed before the agent ran', () => {
  const ctx = { root: path.resolve(__dirname, '..', '..', '..'), baselineFindings: [] };
  const findings = require('node:child_process').spawnSync(process.execPath, [path.join(__dirname, 'validate-project-records.cjs')], { encoding: 'utf8' }).stdout.split('\n').filter((line) => line.startsWith('['));
  ctx.baselineFindings = findings;
  assert.equal(CHECKS.validator_clean({}, ctx), true);
});

test('remove_paths hides files from the eval workspace', (t) => {
  const root = createWorkspace({ id: 'unit-remove', remove_paths: [PIPES + '/project/00-notes'] });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.ok(!fs.existsSync(path.join(root, PIPES + '/project/00-notes')));
  assert.ok(fs.existsSync(path.join(root, PIPES + '/manifest.json')));
});

test('body_unchanged allows frontmatter edits and rejects body edits', (t) => {
  const evalCase = { id: 'unit-body', setup: { [PIPES + '/project/00-notes/note-900-x.md']: '---\ntitle: X\nrelated: []\n---\nBody line.\n' } };
  const root = createWorkspace(evalCase);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.join(root, PIPES + '/project/00-notes/note-900-x.md');
  const ctx = { root };
  const check = { glob: PIPES + '/project/00-notes/note-900-x.md' };
  fs.writeFileSync(file, '---\ntitle: X\nrelated: [".pipes/a.md"]\n---\nBody line.\n');
  assert.equal(CHECKS.body_unchanged(check, ctx), true);
  fs.writeFileSync(file, '---\ntitle: X\nrelated: []\n---\nChanged body.\n');
  assert.equal(CHECKS.body_unchanged(check, ctx), false);
});

test('a run stopped on a usage limit is invalid, never a pass', (t) => {
  const root = createWorkspace({ id: 'unit-invalid' });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const evalCase = { id: 'unit-invalid', checks: [{ type: 'unchanged', glob: PIPES + '/manifest.json' }] };
  const limited = evaluate(evalCase, root, { toolUses: [], toolResults: [], result: "You've hit your 5-hour limit", cost: 0 });
  assert.equal(limited.invalid, true);
  assert.equal(limited.passed, false, 'a trivially true check must not turn a stopped run into a pass');
  const idle = evaluate(evalCase, root, { toolUses: [], toolResults: [], result: '', cost: 0 });
  assert.equal(idle.invalid, true);
  const real = evaluate(evalCase, root, { toolUses: [{ name: 'Read', input: {} }], toolResults: [], result: 'Refused.', cost: 0.1 });
  assert.equal(real.invalid, false);
  assert.equal(real.passed, true);
});

test('eval cases are split into starter and project scopes', () => {
  const cases = loadCases();
  const starter = cases.filter((item) => item.scope === 'starter');
  const project = cases.filter((item) => item.scope === 'project');
  assert.equal(starter.length + project.length, cases.length);
  assert.ok(starter.length >= 10, 'the starter keeps the generic behavior cases');
  assert.throws(() => parseArgs(['node', 'x', '--scope', 'nope']), /--scope/);
});

test('--changed selects covering cases, escalates broad changes, and ignores records and tests', () => {
  const { selectChanged } = require('./run-evals.cjs');
  const cases = [
    { id: 'hook', scope: 'starter', covers: ['.pipes/utils/scripts/hook-*.cjs', '.pipes/ai-instructions/delivery.md'] },
    { id: 'spec', scope: 'starter', covers: ['.pipes/utils/pipelines/pipeline-design-spec.md'] },
    { id: 'policy', scope: 'project', covers: ['.pipes/utils/rules/rule-example-policy.md'] },
  ];
  const ids = (files) => selectChanged(cases, files).selected.map((item) => item.id);
  assert.deepEqual(ids(['.pipes/ai-instructions/delivery.md']), ['hook']);
  assert.deepEqual(ids(['.pipes/utils/pipelines/pipeline-design-spec.md', '.pipes/utils/rules/rule-example-policy.md']), ['spec', 'policy']);
  assert.deepEqual(ids(['.pipes/project/00-notes/note-009-x.md', '.pipes/utils/scripts/x.test.cjs']), [], 'records and tests select nothing');
  assert.deepEqual(ids(['CLAUDE.md']), ['hook', 'spec'], 'a broad change runs the starter scope');
  assert.deepEqual(ids(['CLAUDE.md', '.pipes/utils/rules/rule-example-policy.md']), ['hook', 'spec', 'policy'], 'a broad change also runs the project cases that cover other changed files');
  assert.deepEqual(selectChanged(cases, ['.pipes/team/visionaire.md']).uncovered, ['.pipes/team/visionaire.md']);
  assert.deepEqual(ids(['app/src/main.ts']), [], 'application code is not agent configuration');
});

test('eval model comes from --model, then the delivery profile tier', () => {
  const { evalModel } = require('./run-evals.cjs');
  const profile = { evals: { routineModel: 'sonnet', milestoneModel: null } };
  assert.equal(evalModel({ model: 'haiku' }, profile), 'haiku');
  assert.equal(evalModel({}, profile), 'sonnet');
  assert.equal(evalModel({ milestone: true }, profile), null, 'milestone default means the agent tool default');
  assert.equal(evalModel({}, { evals: undefined }), null);
});

test('--rerun-failed takes failed and invalid cases from the last run', (t) => {
  const { lastRunFailures } = require('./run-evals.cjs');
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'pipes-evals-runs-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, '2026-01-01.json'), JSON.stringify({ results: [{ id: 'old', passed: false }] }));
  fs.writeFileSync(path.join(dir, '2026-01-02.json'), JSON.stringify({ results: [{ id: 'a', passed: true }, { id: 'b', passed: false }, { id: 'c', passed: false, invalid: true }] }));
  assert.deepEqual(lastRunFailures(dir), ['b', 'c']);
});

test('a case budget overrides --budget, and bad case options are rejected', () => {
  const { args } = ADAPTERS.claude.command({ prompt: 'x', max_budget_usd: 5 }, parseArgs(['node', 'x', '--budget', '1']));
  assert.equal(args[args.indexOf('--max-budget-usd') + 1], '5');
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'pipes-evals-cases-'));
  try {
    fs.writeFileSync(path.join(dir, 'w.json'), JSON.stringify({ id: 'w', scope: 'starter', covers: ['x'], prompt: 'p', checks: [{}], workspace: 'other' }));
    assert.throws(() => loadCases(dir), /workspace must be copy or starter/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('script_passes runs a workspace script by file name only', () => {
  const ctx = { root: path.dirname(path.resolve(__dirname, '..', '..')) };
  if (PIPES === '.pipes') assert.equal(CHECKS.script_passes({ script: 'validate-pure-markdown.cjs' }, ctx), true);
  assert.throws(() => CHECKS.script_passes({ script: '../../x.cjs' }, ctx), /file name/);
});

test('the bootstrap case runs in a fresh starter install and fails there before any bootstrap', (t) => {
  const evalCase = loadCases().find((item) => item.id === 'bootstrap-fresh-workspace');
  // The runner hides a case's own file, so inside that case's eval workspace there is nothing to test.
  if (!evalCase) { t.skip('the bootstrap case is not in this workspace'); return; }
  assert.ok(evalCase.milestone_only && evalCase.workspace === 'starter' && evalCase.max_budget_usd <= 5);
  const root = createWorkspace(evalCase);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.ok(fs.existsSync(path.join(root, '.pipes/ai-instructions/project.md')));
  assert.ok(fs.existsSync(path.join(root, 'CLAUDE.md')), 'surfaces generated');
  assert.ok(!fs.existsSync(path.join(root, '.pipes/project/05-decisions')) || !fs.readdirSync(path.join(root, '.pipes/project/05-decisions')).some((name) => name.startsWith('decision-')), 'no project records');
  assert.ok(fs.existsSync(path.join(root, 'src/loans.js')), 'fixture written');
  assert.ok(!fs.existsSync(path.join(root, '.pipes/utils/scripts/fixtures/evals/bootstrap-fresh-workspace.json')), 'the case cannot read its own checks');
  const result = evaluate(evalCase, root, { toolUses: [], toolResults: [], result: 'Done; G6 pending.', cost: 0 });
  const failed = result.checks.filter((check) => !check.passed).map((check) => check.detail);
  for (const reason of ['identity replaced', 'delivery profile written; the validator passes without one', 'conventions established', 'architecture established']) assert.ok(failed.includes(reason), reason);
  assert.equal(result.passed, false);
});

test('file_count counts matching files within min and max', (t) => {
  const root = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'pipes-evals-count-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'a.md'), 'scope: project\n');
  fs.writeFileSync(path.join(root, 'b.md'), 'scope: starter\n');
  assert.equal(CHECKS.file_count({ glob: '*.md', pattern: '^scope: project$', min: 1, max: 1 }, { root }), true);
  assert.equal(CHECKS.file_count({ glob: '*.md', min: 3 }, { root }), false);
  assert.equal(CHECKS.file_count({ glob: '*.md', max: 1 }, { root }), false);
  assert.throws(() => CHECKS.script_passes({ script: 'x.cjs', args: '--check' }, { root }), /array/);
});

test('the runner refuses paid runs from inside an eval run', () => {
  const { spawnSync } = require('node:child_process');
  const script = path.join(__dirname, 'run-evals.cjs');
  const env = { ...process.env, PIPES_EVAL_RUN: '1' };
  const refused = spawnSync(process.execPath, [script, '--case', 'push-to-main-denied'], { env, encoding: 'utf8' });
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /inside an eval run/);
  assert.equal(spawnSync(process.execPath, [script, '--dry-run', '--scope', 'starter'], { env, encoding: 'utf8' }).status, 0);
});
