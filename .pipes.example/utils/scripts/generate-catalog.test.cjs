const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  inventory,
  renderCatalog,
} = require('./generate-catalog.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const IS_STARTER_BASELINE = path.basename(ROOT) === '.pipes.example';

test('catalog reflects the complete Markdown-first inventory', () => {
  const items = inventory(ROOT);
  if (IS_STARTER_BASELINE) {
    assert.equal(items.pipelines.length, 18);
    assert.equal(items.loops.length, 5);
    // Starter rules exclude project policy rules (scope: project); the conventions placeholder is included.
    assert.equal(items.rules.filter((item) => item.meta.scope !== 'project' || item.id === 'rule-codebase-conventions').length, 27);
  }
  assert.equal(items.fragments.filter((item) => item.meta.fragment_type === 'context').length, 2);
  assert.equal(new Set(items.fragments.map((item) => item.id)).size, items.fragments.length);
  assert.equal(items.fragments.some((item) => item.id.startsWith('TEMPLATE-')), false);
  const rendered = renderCatalog(items);
  assert.match(rendered, new RegExp('\\*\\*Total Fragments:\\*\\* ' + items.fragments.length));
  assert.match(rendered, new RegExp('\\*\\*Total Pipelines:\\*\\* ' + items.pipelines.length));
  assert.match(rendered, new RegExp('\\*\\*Total Loops:\\*\\* ' + items.loops.length));
  assert.match(rendered, new RegExp('\\*\\*Total Rules:\\*\\* ' + items.rules.length));
  assert.match(rendered, /### Context \(2\)/);
  assert.match(rendered, /`fragment-source-tree-execution-context`/);
  assert.match(rendered, /`fragment-instruction-surface-ownership`/);
  assert.doesNotMatch(rendered, /TEMPLATE-(?:context|instruction|output|question|validation)/);
  assert.match(rendered, /\| Fragment \| Path \| Title \| Domain \| Description \|/);
  assert.match(
    rendered,
    /`fragment-lint-feature-questions` \| `\.pipes\/utils\/fragments\/validation\/fragment-lint-feature-questions\.md`/,
  );
  assert.match(
    rendered,
    /`fragment-classify-feature-unknowns` \| `\.pipes\/utils\/fragments\/instruction\/fragment-classify-feature-unknowns\.md`/,
  );
  assert.match(rendered, /\| Loop \| Title \| Type \| Primary Role \| Description \|/);
  assert.match(rendered, /`rule-pure-markdown-writing`/);
  assert.match(rendered, /`rule-generated-html-design`/);
  assert.doesNotMatch(rendered, /\| Kernel \|/);
});

test('catalog includes an additional valid pipeline without a fixed ceiling', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-catalog-extension-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const pipelineDir = path.join(temp, 'utils/pipelines');
  fs.mkdirSync(pipelineDir, { recursive: true });
  fs.cpSync(path.join(ROOT, 'utils/pipelines'), pipelineDir, { recursive: true });
  fs.writeFileSync(
    path.join(pipelineDir, 'pipeline-extension-probe.md'),
    '---\ntitle: Extension Probe\ndescription: Verifies extensible catalog inventory.\ncategory: validation\ndomain: all\n---\n',
    'utf8',
  );

  const baseline = inventory(ROOT);
  const extended = inventory(temp);
  assert.equal(extended.pipelines.length, baseline.pipelines.length + 1);
  const rendered = renderCatalog(extended);
  assert.match(rendered, new RegExp('\\*\\*Total Pipelines:\\*\\* ' + extended.pipelines.length));
  assert.match(rendered, /`pipeline-extension-probe`/);
});
