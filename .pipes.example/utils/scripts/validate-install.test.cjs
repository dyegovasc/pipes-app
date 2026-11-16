const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { validateProjectRecords } = require('./validate-project-records.cjs');

const STARTER = path.resolve(__dirname, '..', '..');

function run(root, script, args = []) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, '.pipes/utils/scripts', script), ...args],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function skillCount(root, target, marker) {
  const skills = path.join(root, target, 'skills');
  if (!fs.existsSync(skills)) return 0;
  return fs.readdirSync(skills, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => {
      const file = path.join(skills, entry.name, 'SKILL.md');
      return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(marker);
    }).length;
}

function mission(level, profile, number) {
  return [
    '---',
    'title: Intervention ' + level,
    'description: Validate ' + level + ' intervention.',
    'version: 1.0',
    'created: 2026-07-16',
    'status: draft',
    'related: []',
    'loop: loop-framework-maintenance',
    '---',
    '## Objective',
    'Validate clean-installed mission contracts.',
    '## Scope',
    'In scope: mission validation.',
    '## Delivery',
    'Approach: `spec-driven`',
    'Approach rationale: Validate clean-installed delivery routing.',
    'Loop capabilities:',
    '- Planning: available through `pipeline-plan-new-feature`',
    '- Plan execution: available through `pipeline-execute-plan`',
    'Themes:',
    '1. **Validate delivery contracts** — `plan-recommended`',
    '   - Outcome: Prove installed mission routing.',
    '   - Depends on: none',
    '   - Affected contract families: missions and loops',
    '   - Route: plan before execution',
    '   - Promotion trigger: none',
    'Current theme: Validate delivery contracts',
    '## Operating Envelope',
    'Autonomy profile: ' + profile,
    'Human-intervention level: ' + level,
    'Allowed: read installed contracts.',
    '## Roles',
    'Primary: roadmapper.',
    '## Current State',
    'Phase: framed',
    'Active workflow: none',
    'Pending gate: mission execution; human_mandatory; user; pending',
    'Resume trigger: explicit approval; activate mission',
    'Validation target: installed validator passes',
    '## Gates',
    'Mission execution; human_mandatory; user; pending; invalidated by version or scope change; resume by activation.',
    '## Validation',
    'Check: validator; Result: pending; Relevance: full mission; Evidence: none.',
    '## Stop',
    'Complete when validated.',
    '## Next Actions',
    '1. Validate the mission.',
    '## Journal',
    '### 2026-07-16 10:00:0' + number + ' — Created',
    'Selected ' + level + ' intervention.',
    '',
  ].join('\n');
}

test('clean install regenerates one skill per discovered pipeline and loop', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-clean-install-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  fs.cpSync(STARTER, path.join(temp, '.pipes'), { recursive: true });

  for (const relative of ['manifest.json', 'framework-baseline.json.gz', 'framework-fork.json']) {
    assert.deepEqual(
      fs.readFileSync(path.join(temp, '.pipes', relative)),
      fs.readFileSync(path.join(STARTER, relative)),
      relative + ' is installed byte-for-byte',
    );
  }

  const missionDir = path.join(temp, '.pipes/project/03-missions');
  for (const [index, [level, profile]] of [
    ['less', 'delegated_until_escalation'],
    ['more', 'user_mediated'],
    ['context-dependent', 'mixed'],
  ].entries()) {
    fs.writeFileSync(
      path.join(missionDir, 'mission-00' + (index + 1) + '-' + level + '.md'),
      mission(level, profile, index + 1),
      'utf8',
    );
  }

  run(temp, 'assemble-instructions.cjs', ['--targets', 'agents,claude,copilot', '--json']);
  run(temp, 'assemble-pipeline-skills.cjs', ['--targets', 'agents,claude', '--json']);
  run(temp, 'assemble-loop-skills.cjs', ['--targets', 'agents,claude', '--json']);
  run(temp, 'generate-catalog.cjs');
  run(temp, 'generate-source-map.cjs');
  run(temp, 'validate-pure-markdown.cjs');
  run(temp, 'validate-project-records.cjs');
  // A clean starter release must match its baseline exactly. An installed fork keeps its
  // immutable manifest and records divergence in fork control, so verify that control is fresh.
  const forkControlPath = path.join(temp, '.pipes/framework-fork.json');
  const forkSummary = JSON.parse(fs.readFileSync(forkControlPath, 'utf8')).summary;
  const isFork = forkSummary.created + forkSummary.modified + forkSummary.deleted > 0;
  if (path.basename(STARTER) === '.pipes.example' || !isFork) {
    run(temp, 'generate-framework-provenance.cjs', ['--root', path.join(temp, '.pipes'), '--check', '--json']);
  } else {
    const before = fs.readFileSync(forkControlPath);
    run(temp, 'generate-framework-provenance.cjs', ['--root', path.join(temp, '.pipes'), '--refresh-fork']);
    assert.deepEqual(fs.readFileSync(forkControlPath), before, 'installed fork control is fresh');
  }
  const installedFindings = validateProjectRecords(path.join(temp, '.pipes'));
  const representativeMissionErrors = installedFindings.filter((item) => (
    item.level === 'error'
    && /mission-00[1-3]-(less|more|context-dependent)\.md$/.test(item.path)
  ));
  assert.deepEqual(representativeMissionErrors, []);

  const pipelineCount = fs.readdirSync(path.join(STARTER, 'utils/pipelines'))
    .filter((name) => /^pipeline-.+\.md$/.test(name)).length;
  const loopCount = fs.readdirSync(path.join(STARTER, 'utils/loops'))
    .filter((name) => /^loop-.+\.md$/.test(name)).length;
  assert.equal(skillCount(temp, '.agents', 'pipes-pipeline-skill:start'), pipelineCount);
  assert.equal(skillCount(temp, '.agents', 'pipes-loop-skill:start'), loopCount);
  assert.equal(skillCount(temp, '.claude', 'pipes-pipeline-skill:start'), pipelineCount);
  assert.equal(skillCount(temp, '.claude', 'pipes-loop-skill:start'), loopCount);

  const pipelineSkill = fs.readFileSync(
    path.join(temp, '.agents/skills/pipes.plan-new-feature/SKILL.md'),
    'utf8',
  );
  const loopSkill = fs.readFileSync(
    path.join(temp, '.agents/skills/pipes.loop-framework-maintenance/SKILL.md'),
    'utf8',
  );
  const catalog = fs.readFileSync(
    path.join(temp, '.pipes/utils/fragments/CATALOG.md'),
    'utf8',
  );
  const sourceMap = fs.readFileSync(
    path.join(temp, '.pipes/utils/mapping/source-to-target-map.md'),
    'utf8',
  );
  const installedManifest = JSON.parse(fs.readFileSync(path.join(temp, '.pipes/manifest.json'), 'utf8'));
  const installedFork = JSON.parse(fs.readFileSync(path.join(temp, '.pipes/framework-fork.json'), 'utf8'));
  assert.equal(installedManifest.frameworkVersion, JSON.parse(fs.readFileSync(path.join(STARTER, 'manifest.json'), 'utf8')).frameworkVersion);
  assert.equal(installedFork.frameworkVersion, installedManifest.frameworkVersion);
  assert.equal(installedFork.baselineRelation, 'origin');
  if (isFork) {
    const { unchanged, modified, deleted } = installedFork.summary;
    assert.equal(unchanged + modified + deleted, installedManifest.files.length, 'fork control accounts for every baseline file');
  } else {
    assert.equal(installedFork.summary.unchanged, installedManifest.files.length);
    assert.equal(installedFork.summary.created, 0);
    assert.equal(installedFork.summary.modified, 0);
    assert.equal(installedFork.summary.deleted, 0);
  }
  for (const relative of ['manifest.json', 'framework-baseline.json.gz', 'framework-fork.json']) {
    assert.match(sourceMap, new RegExp('`\\.pipes/' + relative.replace(/\./g, '\\.') + '`'));
  }
  assert.equal(fs.existsSync(path.join(temp, '.pipes/utils/scripts/generate-framework-provenance.cjs')), true);
  assert.equal(fs.existsSync(path.join(temp, '.pipes/utils/scripts/fixtures/framework-provenance/digest-contract-v1.json')), true);
  assert.match(pipelineSkill, /Resolve each fragment ID by exact filename to exactly one file/);
  assert.match(loopSkill, /Resolve each fragment ID by exact filename to exactly one file/);
  assert.match(catalog, /\| Fragment \| Path \| Title \| Domain \| Description \|/);
  assert.match(
    catalog,
    /`\.pipes\/utils\/fragments\/validation\/fragment-lint-feature-questions\.md`/,
  );
  for (const type of ['context', 'instruction', 'output', 'question', 'validation']) {
    const relative = '.pipes/utils/fragments/TEMPLATE-' + type + '.md';
    assert.equal(fs.existsSync(path.join(temp, relative)), true, relative + ' is installed');
    assert.match(sourceMap, new RegExp('`' + relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '`'));
  }
  assert.doesNotMatch(catalog, /TEMPLATE-(?:context|instruction|output|question|validation)/);
  assert.match(catalog, /### Context \(2\)/);
  for (const id of ['fragment-source-tree-execution-context', 'fragment-instruction-surface-ownership']) {
    assert.equal(fs.existsSync(path.join(temp, '.pipes/utils/fragments/context/' + id + '.md')), true);
    assert.match(catalog, new RegExp('`' + id + '`'));
  }
  for (const [type, id] of [
    ['instruction', 'fragment-decompose-mission-scope'],
    ['question', 'fragment-ask-delivery-approach'],
    ['instruction', 'fragment-apply-plan-lifecycle-transition'],
  ]) {
    assert.equal(fs.existsSync(path.join(temp, '.pipes/utils/fragments/' + type + '/' + id + '.md')), true);
    assert.match(catalog, new RegExp('`' + id + '`'));
  }
  const workflowContract = path.join(temp, '.pipes/ai-instructions/core-workflows.md');
  if (fs.existsSync(workflowContract)) {
    // Split core: the mission line rule is on-demand in the workflow contract that the wrapper references.
    assert.match(fs.readFileSync(path.join(temp, 'AGENTS.md'), 'utf8'), /`\.pipes\/ai-instructions\/core-workflows\.md`/);
    assert.match(fs.readFileSync(workflowContract, 'utf8'), /at or below 300 physical lines/);
  } else {
    assert.match(fs.readFileSync(path.join(temp, 'AGENTS.md'), 'utf8'), /at or below 300 physical lines/);
  }
  assert.match(fs.readFileSync(path.join(temp, 'AGENTS.md'), 'utf8'), /`rule-pure-markdown-writing`/);
  const htmlRulePath = 'utils/rules/rule-generated-html-design.md';
  const htmlRule = fs.readFileSync(path.join(temp, '.pipes', htmlRulePath), 'utf8');
  assert.ok(installedManifest.files.some((file) => file.path === htmlRulePath));
  assert.match(htmlRule, /## Embedded Token Baseline/);
  assert.match(htmlRule, /Automatic follows the active app theme/);
  assert.match(htmlRule, /Do not invent messages, inspect the enclosing document DOM, request native privileges/);
  assert.match(catalog, /`rule-generated-html-design`/);
  assert.match(sourceMap, /`\.pipes\/utils\/rules\/rule-generated-html-design\.md`/);
  for (const entrypoint of ['AGENTS.md', 'CLAUDE.md', '.github/copilot-instructions.md']) {
    const content = fs.readFileSync(path.join(temp, entrypoint), 'utf8');
    assert.match(content, /Keep every authored Markdown document renderer-safe pure Markdown/);
    assert.match(content, /Standalone HTML artifacts follow `rule-generated-html-design`/);
  }
  assert.match(fs.readFileSync(path.join(temp, '.pipes/utils/rules/rule-pure-markdown-writing.md'), 'utf8'), /Standalone HTML artifacts are outside this Markdown syntax rule/);
  assert.match(fs.readFileSync(path.join(temp, '.pipes/utils/pipelines/pipeline-plan-new-feature.md'), 'utf8'), /active mission will resume afterward/i);
  assert.match(fs.readFileSync(path.join(temp, '.pipes/utils/pipelines/pipeline-start-mission.md'), 'utf8'), /fragment-decompose-mission-scope/);
  assert.match(fs.readFileSync(path.join(temp, '.pipes/utils/pipelines/pipeline-execute-mission.md'), 'utf8'), /delivery approach and current theme when present/i);
  const executePlan = fs.readFileSync(path.join(temp, '.pipes/utils/pipelines/pipeline-execute-plan.md'), 'utf8');
  assert.match(executePlan, /Direct and mission-bound invocations share one lifecycle and outcome contract/i);
  assert.match(executePlan, /exactly-one outcome and reciprocal-link evidence/i);
  assert.match(executePlan, /do not require or invent a plan record/i);
  assert.equal(fs.existsSync(path.join(temp, '.pipes/utils/rules/rule-plan-state-integrity.md')), true);
  assert.match(catalog, /`rule-plan-state-integrity`/);
  const teamPipeline = fs.readFileSync(
    path.join(temp, '.pipes/utils/pipelines/pipeline-create-team-member.md'),
    'utf8',
  );
  const teamWriter = fs.readFileSync(
    path.join(temp, '.pipes/utils/fragments/instruction/fragment-create-team-member-file.md'),
    'utf8',
  );
  for (const content of [teamPipeline, teamWriter]) {
    assert.match(content, /installed_project/);
    assert.match(content, /starter_maintenance/);
    assert.match(content, /team\/\{role-id\}\.md` in the starter source tree/);
    assert.match(content, /\.pipes\/team\/\{role-id\}\.md/);
  }
  assert.match(teamWriter, /staged target in the starter source tree, validate it, then create or reuse the exact installed `\.pipes\/` mirror/i);
  assert.match(fs.readFileSync(path.join(temp, '.pipes/utils/loops/loop-framework-maintenance.md'), 'utf8'), /append the compact gate receipt and continue the mission directly/i);

  const generated = [
    path.join(temp, 'AGENTS.md'),
    path.join(temp, 'CLAUDE.md'),
    path.join(temp, '.github/copilot-instructions.md'),
    path.join(temp, '.pipes/utils/fragments/CATALOG.md'),
    path.join(temp, '.pipes/utils/mapping/source-to-target-map.md'),
  ];
  for (const target of ['.agents', '.claude']) {
    const skills = path.join(temp, target, 'skills');
    for (const entry of fs.readdirSync(skills)) {
      const file = path.join(skills, entry, 'SKILL.md');
      if (fs.existsSync(file)) generated.push(file);
    }
  }
  for (const file of generated) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /\.pipes-v2\//, path.relative(temp, file));
  }
});
