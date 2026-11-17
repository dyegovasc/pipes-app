const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  discoverPipelines,
  renderSkill,
} = require('./assemble-pipeline-skills.cjs');

const EXPECTED = [
  'pipeline-add-eval',
  'pipeline-bootstrap-greenfield',
  'pipeline-bootstrap-workspace',
  'pipeline-capture-intent',
  'pipeline-create-loop',
  'pipeline-create-pipeline',
  'pipeline-create-team-member',
  'pipeline-define-codebase-stack',
  'pipeline-define-policies',
  'pipeline-define-system-architecture',
  'pipeline-design-spec',
  'pipeline-execute-mission',
  'pipeline-execute-plan',
  'pipeline-plan-new-feature',
  'pipeline-record-decision',
  'pipeline-release-change',
  'pipeline-review-change',
  'pipeline-start-mission',
];

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const IS_STARTER_BASELINE = path.basename(PIPE_ROOT) === '.pipes.example';

function extensionSource() {
  return [
    '---',
    'title: Extension Probe',
    'description: Verifies extensible pipeline discovery.',
    'version: 1.0',
    'domain: all',
    'category: validation',
    'fragments: []',
    '---',
    '# Pipeline: Extension Probe',
    '',
    '## Loop Use',
    '',
    'Available as a bounded validation probe.',
    '',
  ].join('\n');
}

test('discovers every valid pipeline while preserving starter capabilities', () => {
  const pipelines = discoverPipelines();
  const ids = pipelines.map((item) => item.id);
  assert.deepEqual(ids, [...ids].sort());
  assert.equal(new Set(ids).size, ids.length);
  for (const id of EXPECTED) assert.ok(ids.includes(id), id + ' remains available');
  if (IS_STARTER_BASELINE) assert.deepEqual(ids, EXPECTED);
  for (const id of EXPECTED) {
    const pipeline = pipelines.find((item) => item.id === id);
    assert.ok(pipeline);
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'pipelines', pipeline.filename),
      'utf8',
    );
    assert.match(source, /^## Loop Use$/m);
    assert.doesNotMatch(source, /^loop_compatible:/m);
  }
});

test('renders small canonical pipeline skills', () => {
  const pipelines = discoverPipelines();
  const skills = pipelines.map(renderSkill);
  assert.equal(skills.length, pipelines.length);
  for (const skill of skills) {
    assert.match(skill, /\.pipes\/utils\/pipelines\/pipeline-/);
    assert.match(skill, /first incomplete phase/);
    assert.match(skill, /Resolve each fragment ID by exact filename to exactly one file/);
    assert.match(skill, /never infer its type directory/);
    assert.doesNotMatch(skill, /\.pipes-v2|pipeline-execution-context|state_revision/);
    assert.ok(skill.split('\n').length < 35);
  }
});

test('discovers and renders an additional valid pipeline without a fixed ceiling', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-pipeline-extension-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const source = path.join(PIPE_ROOT, 'utils/pipelines');
  fs.cpSync(source, temp, { recursive: true });
  fs.writeFileSync(path.join(temp, 'pipeline-extension-probe.md'), extensionSource(), 'utf8');

  const baseline = discoverPipelines(source);
  const extended = discoverPipelines(temp);
  assert.equal(extended.length, baseline.length + 1);
  const probe = extended.find((item) => item.id === 'pipeline-extension-probe');
  assert.ok(probe);
  assert.match(renderSkill(probe), /\.pipes\/utils\/pipelines\/pipeline-extension-probe\.md/);
});
