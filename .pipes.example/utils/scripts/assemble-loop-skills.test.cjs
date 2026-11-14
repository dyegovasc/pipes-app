const test = require('node:test');
const assert = require('node:assert/strict');
const {
  discoverLoops,
  renderSkill,
} = require('./assemble-loop-skills.cjs');

const EXPECTED = [
  'loop-artifact-production',
  'loop-concept-development',
  'loop-feature-delivery',
  'loop-framework-maintenance',
  'loop-investigation-and-recovery',
];

test('discovers exactly the five starter loops', () => {
  const loops = discoverLoops();
  assert.deepEqual(loops.map((item) => item.id), EXPECTED);
  assert.deepEqual(
    loops.map((item) => item.skillName),
    EXPECTED.map((id) => 'pipes.' + id),
  );
});

test('renders loop skills that drive Markdown directly', () => {
  for (const loop of discoverLoops()) {
    const skill = renderSkill(loop);
    assert.match(skill, /\.pipes\/utils\/loops\/loop-/);
    assert.match(skill, /Stop only for validated completion/);
    assert.match(skill, /Read only the fragments and rules needed/);
    assert.match(skill, /Resolve each fragment ID by exact filename to exactly one file/);
    assert.match(skill, /never infer its type directory/);
    assert.doesNotMatch(skill, /\.pipes-v2|operational-kernel|mission-operations|state_revision/);
    assert.ok(skill.split('\n').length < 35);
  }
});

test('loop and pipeline skills read the workflow contract first only when it exists', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const loops = require('./assemble-loop-skills.cjs');
  const pipelines = require('./assemble-pipeline-skills.cjs');
  const contract = /^1\. Read `\.pipes\/ai-instructions\/core-workflows\.md` first/m;
  assert.equal(loops.hasWorkflowContract(), true);
  for (const loop of loops.discoverLoops()) assert.match(loops.renderSkill(loop), contract);
  for (const pipeline of pipelines.discoverPipelines()) assert.match(pipelines.renderSkill(pipeline), contract);
  for (const skill of [loops.renderSkill(loops.discoverLoops()[0]), pipelines.renderSkill(pipelines.discoverPipelines()[0])]) {
    const numbers = [...skill.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    assert.deepEqual(numbers, numbers.map((_, index) => index + 1), 'steps are numbered without gaps');
  }
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-no-workflow-contract-'));
  try {
    assert.equal(loops.hasWorkflowContract(empty), false);
    assert.equal(pipelines.hasWorkflowContract(empty), false);
  } finally {
    fs.rmSync(empty, { recursive: true, force: true });
  }
});
