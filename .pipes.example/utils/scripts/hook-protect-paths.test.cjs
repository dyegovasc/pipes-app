const test = require('node:test');
const assert = require('node:assert/strict');
const { decide } = require('./hook-protect-paths.cjs');

const edit = (tool, filePath) => decide({ tool_name: tool, tool_input: { file_path: filePath }, cwd: '/repo' }).decision;

test('immutable provenance files are denied for edit tools', () => {
  assert.equal(edit('Edit', '/repo/.pipes/manifest.json'), 'deny');
  assert.equal(edit('Write', '.pipes/framework-baseline.json.gz'), 'deny');
  assert.equal(edit('MultiEdit', '/repo/sub/../.pipes/manifest.json'), 'deny');
});

test('other files and tools are not affected', () => {
  assert.equal(edit('Edit', '/repo/.pipes/framework-fork.json'), 'none');
  assert.equal(edit('Write', '/repo/manifest.json'), 'none');
  assert.equal(edit('Edit', '/repo/.pipes/utils/rules/rule-scope-control.md'), 'none');
  assert.equal(decide({ tool_name: 'Read', tool_input: { file_path: '/repo/.pipes/manifest.json' } }).decision, 'none');
});
