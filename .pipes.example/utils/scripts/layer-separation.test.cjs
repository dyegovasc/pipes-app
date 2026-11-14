const test = require('node:test');
const assert = require('node:assert/strict');
const { findLeaks, projectReason } = require('./starter-layer.cjs');
const { loadProfile } = require('./delivery-profile.cjs');

test('framework-layer files contain no fact of the project layer', () => {
  const { terms, leaks } = findLeaks();
  if (loadProfile().source) assert.ok(terms.length > 0, 'a project with a delivery profile yields project terms to check');
  assert.deepEqual(
    leaks.map((leak) => leak.rel + ':' + leak.line + ' ' + leak.kind + ' ' + leak.term),
    [],
    'move project facts to delivery.md, project.md, a scope: project rule, or a scope: project eval case',
  );
});

test('the layer classification treats records, project instructions, and project-scoped content as project layer', () => {
  assert.equal(projectReason('project/00-notes/note-001-x.md', ''), 'project records or local state');
  assert.equal(projectReason('ai-instructions/delivery.md', ''), 'project instruction');
  assert.equal(projectReason('ai-instructions/core.md', ''), null);
  assert.equal(projectReason('utils/rules/rule-x.md', '---\nscope: project\n---\n'), 'project policy rule');
  assert.equal(projectReason('utils/rules/rule-y.md', '---\ntitle: Y\n---\n'), null);
  assert.equal(projectReason('utils/scripts/fixtures/evals/a.json', JSON.stringify({ scope: 'project' })), 'project eval case');
  assert.equal(projectReason('utils/scripts/fixtures/evals/b.json', JSON.stringify({ scope: 'starter' })), null);
});

test('a synthetic starter case exempts only the terms of its own setup files', () => {
  const { syntheticSetupText } = require('./starter-layer.cjs');
  const synthetic = JSON.stringify({ workspace: 'starter', setup: { 'README.md': 'Deploys to `fixture-env`.' }, prompt: 'p' });
  assert.match(syntheticSetupText('utils/scripts/fixtures/evals/a.json', synthetic), /fixture-env/);
  assert.equal(syntheticSetupText('utils/scripts/fixtures/evals/b.json', JSON.stringify({ scope: 'starter', setup: { x: 'fixture-env' } })), '', 'cases on a copy of this workspace exempt nothing');
  assert.equal(syntheticSetupText('utils/rules/rule-x.md', synthetic), '');
});

test('the starter placeholders declare the enforcement and always-on budget defaults', () => {
  const { STARTER_ALWAYS_ON_BUDGET, starterConventionsPlaceholder, starterProjectPlaceholder } = require('./verify-starter.cjs');
  assert.match(starterConventionsPlaceholder(), /^enforced_by: \[model, ci\]$/m);
  const project = starterProjectPlaceholder();
  assert.match(project, new RegExp('^always_on_line_budget: ' + STARTER_ALWAYS_ON_BUDGET + '$', 'm'));
  assert.match(project, /^assembly: inline$/m, 'the placeholder keeps its assembly mode');
});

test('a framework file that points at a record of this project is a leak', (t) => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { findRecordReferences } = require('./starter-layer.cjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-record-leak-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (rel, content) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), content, 'utf8'); };
  for (const dir of ['ai-instructions', 'team', 'utils/rules', 'utils/pipelines', 'utils/loops', 'utils/fragments', 'utils/scripts']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  write('README.md', '# Readme\n');
  write('project/05-decisions/decision-007-real.md', '---\ntitle: Real\n---\n');
  write('utils/rules/rule-a.md', '---\ntitle: A\n---\nSee decision-007 and decision-901.\n');
  write('utils/scripts/x.test.cjs', '// decision-007 in a test is allowed\n');
  assert.deepEqual(findRecordReferences(root).map((leak) => leak.rel + ' ' + leak.term), ['utils/rules/rule-a.md decision-007']);
});

test('the starter copy takes only files that git sees, and empty directories are removed', (t) => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { installFiles, pruneEmptyDirectories } = require('./verify-starter.cjs');
  const files = installFiles();
  if (files) {
    assert.ok(files.includes('README.md'), 'the install README is listed');
    assert.ok(files.every((rel) => !/(^|\/)\.DS_Store$/.test(rel) && !rel.startsWith('utils/state/evals/')), 'ignored files are not listed');
  }
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-prune-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'kept/empty/deeper'), { recursive: true });
  fs.mkdirSync(path.join(root, 'gone/also'), { recursive: true });
  fs.writeFileSync(path.join(root, 'kept/file.md'), 'x\n', 'utf8');
  pruneEmptyDirectories(root);
  assert.ok(fs.existsSync(path.join(root, 'kept/file.md')));
  assert.ok(!fs.existsSync(path.join(root, 'kept/empty')));
  assert.ok(!fs.existsSync(path.join(root, 'gone')));
});
