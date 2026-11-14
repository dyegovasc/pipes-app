const test = require('node:test');
const assert = require('node:assert/strict');
const {
  instructionEntries,
  mergeIntoContent,
  parseFrontmatter,
  renderPipesSection,
  ruleEntries,
} = require('./assemble-instructions.cjs');

test('parses frontmatter without treating the body as metadata', () => {
  const parsed = parseFrontmatter('---\ntitle: Example\nassembly: inline\n---\n# Body\n');
  assert.equal(parsed.meta.title, 'Example');
  assert.equal(parsed.meta.assembly, 'inline');
  assert.equal(parsed.body, '# Body\n');
});

test('renders canonical concise Pipes instructions', () => {
  const content = renderPipesSection('Test', instructionEntries(), ruleEntries());
  assert.match(content, /governant orchestrator expressed in Markdown/);
  assert.match(content, /\.pipes\/ai-instructions\/project\.md/);
  const fs = require('node:fs');
  const path = require('node:path');
  const workflows = path.resolve(__dirname, '..', '..', 'ai-instructions', 'core-workflows.md');
  if (fs.existsSync(workflows)) {
    // Split core: fragment resolution is on-demand in the workflow contract, which the wrapper references.
    assert.match(content, /`\.pipes\/ai-instructions\/core-workflows\.md`/);
    assert.match(content, /read `\.pipes\/ai-instructions\/core-workflows\.md`/);
    const contract = fs.readFileSync(workflows, 'utf8');
    assert.match(contract, /resolve its exact filename recursively under `\.pipes\/utils\/fragments\/`/);
    assert.match(contract, /Never infer a type directory/);
  } else {
    assert.match(content, /resolve its exact filename recursively under `\.pipes\/utils\/fragments\/`/);
    assert.match(content, /Never infer a type directory/);
  }
  assert.match(content, /`rule-pure-markdown-writing`/);
  assert.match(content, /Prohibits raw HTML in renderable Pipes Markdown/);
  assert.doesNotMatch(content, /\.pipes-v2\//);
  assert.doesNotMatch(content, /operational-kernel|mission-operations|state_revision/);
});

test('managed wrapper merge is stable for unchanged content', () => {
  const section = renderPipesSection('Codex', instructionEntries(), ruleEntries());
  const first = mergeIntoContent(null, section, 'Codex');
  const second = mergeIntoContent(first, section, 'Codex');
  assert.equal(second, first);
});

test('always-on instructions stay within the configured line budget', () => {
  const { alwaysOnBudget, budgetReport } = require('./assemble-instructions.cjs');
  const limit = alwaysOnBudget();
  const report = budgetReport(renderPipesSection('Test', instructionEntries(), ruleEntries()), limit);
  assert.ok(report.ok, 'always-on block is ' + report.lines + ' lines; budget is ' + limit);
  assert.deepEqual(budgetReport('a\nb\nc', 2), { lines: 3, limit: 2, ok: false });
  assert.deepEqual(budgetReport('a\nb', null), { lines: 2, limit: null, ok: true });
});
