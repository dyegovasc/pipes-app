const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');

function files(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(predicate).sort();
}

function markdownTree(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownTree(target));
    else if (entry.name.endsWith('.md')) out.push(target);
  }
  return out.sort();
}

function hardWrappedProse(content) {
  const issues = [];

  function scan(source, lineOffset = 0) {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    let bodyStart = 0;

    if (lines[0] === '---') {
      const end = lines.indexOf('---', 1);
      let scalarContinuation = false;
      for (let index = 1; index < end; index += 1) {
        const line = lines[index];
        if (/^[a-z][a-z0-9_-]*:\s+\S/i.test(line)) {
          scalarContinuation = !/:\s*[>|][-+0-9]*\s*$/.test(line);
        } else if (/^ {2,}\S/.test(line) && !/^ {2}-\s/.test(line) && scalarContinuation) {
          issues.push(lineOffset + index + 1);
        } else {
          scalarContinuation = false;
        }
      }
      if (end >= 0) bodyStart = end + 1;
    }

    function startsBlock(line) {
      const text = line.trimStart();
      return /^(?:#{1,6}\s|>|\|)/.test(text)
        || /^(?:[-+*]|\d+[.)])\s+/.test(text)
        || /^(?:---+|\*\*\*+|___+|===+)\s*$/.test(text)
        || /^\*\*[^*]+:\*\*/.test(text)
        || /^[A-Z][A-Za-z0-9 /&_-]*:\s*(?:\S.*)?$/.test(text)
        || /^<\/?[A-Za-z][^>]*>/.test(text)
        || /^\[[^\]]+\]:\s+/.test(text);
    }

    function cannotContinue(line) {
      const text = line.trimStart();
      return /^(?:#{1,6}\s|>|\|)/.test(text)
        || /^(?:---+|\*\*\*+|___+|===+)\s*$/.test(text)
        || /^\*\*[^*]+:\*\*\s*$/.test(text)
        || /^[A-Z][A-Za-z0-9 /&_-]*:\s*$/.test(text)
        || /^<\/?[A-Za-z][^>]*>/.test(text)
        || /^\[[^\]]+\]:\s+/.test(text);
    }

    let inComment = false;
    for (let index = bodyStart; index < lines.length; index += 1) {
      const line = lines[index];
      const fence = line.match(/^\s*(`{3,}|~{3,})([A-Za-z0-9_-]*)\s*$/);
      if (fence) {
        const closePattern = new RegExp('^\\s*' + escapeRegExp(fence[1]) + '\\s*$');
        let close = index + 1;
        while (close < lines.length && !closePattern.test(lines[close])) close += 1;
        if (/^(?:markdown|md)$/i.test(fence[2]) && close < lines.length) {
          scan(lines.slice(index + 1, close).join('\n'), lineOffset + index + 1);
        }
        index = close < lines.length ? close : lines.length;
        continue;
      }
      if (inComment) {
        if (line.includes('-->')) inComment = false;
        continue;
      }
      if (line.includes('<!--')) {
        if (!line.includes('-->')) inComment = true;
        continue;
      }
      if (!line.trim() || startsBlock(line)) continue;

      const previous = lines[index - 1] || '';
      if (!previous.trim() || cannotContinue(previous)) continue;
      if (/^ {4}\S/.test(line) && /^ {4}\S/.test(previous)) continue;
      issues.push(lineOffset + index + 1);
    }
  }

  scan(content);
  return issues;
}

const DETAILED_PHASE_FIELDS = [
  'Objective',
  'Acting Role',
  'Entry Conditions',
  'Inputs',
  'Fragments',
  'Instructions',
  'Outputs',
  'Handoff To',
  'Approval Gate',
  'Exit Conditions',
];

const REQUIRED_FRAGMENT_SECTIONS = {
  context: ['## Background', '## Structure'],
  instruction: ['## Instructions', '## Output'],
  output: ['## Format', '## Template'],
  question: ['## Question', '## Capture'],
  validation: ['## Checks', '## Acceptance Criteria'],
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('fragment authoring templates cover every supported type without entering active resolution', () => {
  const expected = {
    context: ['## Background', '## Structure'],
    instruction: ['## Instructions', '## Output'],
    output: ['## Format', '## Template'],
    question: ['## Question', '## Capture'],
    validation: ['## Checks', '## Acceptance Criteria'],
  };
  const fragmentRoot = path.join(ROOT, 'utils/fragments');
  assert.deepEqual(
    files(fragmentRoot, (name) => /^TEMPLATE-[a-z]+\.md$/.test(name)),
    Object.keys(expected).map((type) => 'TEMPLATE-' + type + '.md'),
  );
  const activeFiles = new Set(
    markdownTree(fragmentRoot)
      .filter((file) => path.basename(file).startsWith('fragment-')),
  );
  for (const [type, sections] of Object.entries(expected)) {
    const file = path.join(fragmentRoot, 'TEMPLATE-' + type + '.md');
    const content = fs.readFileSync(file, 'utf8');
    for (const field of ['title', 'description', 'version', 'fragment_type', 'domain']) {
      assert.match(content, new RegExp('^' + field + ':\\s+\\S', 'm'), file + ' ' + field);
    }
    assert.match(content, new RegExp('^fragment_type:\\s*' + type + '$', 'm'));
    for (const section of sections) {
      assert.match(content, new RegExp('^' + escapeRegExp(section), 'm'), file + ' missing ' + section);
    }
    assert.deepEqual(hardWrappedProse(content), [], file + ' keeps prose blocks on one line');
    assert.doesNotMatch(content, /<[A-Za-z][^>\n]*>/, file + ' avoids HTML-like placeholders');
    assert.doesNotMatch(content, /^# Fragment:/m, file + ' keeps the fragment title in frontmatter only');
    assert.equal(activeFiles.has(file), false, file + ' is not an active fragment');
  }
});

// The core contract is core.md plus core-workflows.md when the installed fork splits it.
function coreContract() {
  return ['ai-instructions/core.md', 'ai-instructions/core-workflows.md']
    .filter((rel) => fs.existsSync(path.join(ROOT, rel)))
    .map((rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8'))
    .join('\n');
}

function pipelineContent(name) {
  return fs.readFileSync(path.join(ROOT, 'utils/pipelines', name), 'utf8');
}

function starterPipelineFiles() {
  const discovered = files(path.join(ROOT, 'utils/pipelines'), (name) => /^pipeline-.+\.md$/.test(name));
  if (path.basename(ROOT) === '.pipes.example') return discovered;
  return discovered.filter((name) => Object.hasOwn(EXPECTED_PHASE_MEMBERS, name));
}

test('context fragments have exact pipeline consumers', () => {
  const expected = {
    'fragment-source-tree-execution-context': [
      'pipeline-create-loop.md',
      'pipeline-create-pipeline.md',
      'pipeline-create-team-member.md',
      'pipeline-define-codebase-stack.md',
      'pipeline-define-system-architecture.md',
    ],
    'fragment-instruction-surface-ownership': [
      'pipeline-define-codebase-stack.md',
      'pipeline-define-system-architecture.md',
      'pipeline-plan-new-feature.md',
    ],
  };
  const pipelines = starterPipelineFiles();
  for (const [id, consumers] of Object.entries(expected)) {
    const fragment = fs.readFileSync(path.join(ROOT, 'utils/fragments/context', id + '.md'), 'utf8');
    assert.match(fragment, /^fragment_type:\s*context$/m);
    for (const section of REQUIRED_FRAGMENT_SECTIONS.context) assert.match(fragment, new RegExp('^' + escapeRegExp(section), 'm'));
    assert.deepEqual(pipelines.filter((name) => frontmatterFragments(pipelineContent(name)).includes(id)), consumers);
  }
});

function frontmatterFragments(content) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const fragmentBlock = frontmatter.match(/^fragments:\n((?:  - .+\n?)*)/m)?.[1] || '';
  return fragmentBlock
    .split('\n')
    .map((line) => line.match(/^  - (fragment-.+)$/)?.[1])
    .filter(Boolean);
}

function assertDetailedPipelineContract(name, phaseCount) {
  const content = pipelineContent(name);
  assert.equal((content.match(/^### Phase \d+:/gm) || []).length, phaseCount, name);
  for (const field of DETAILED_PHASE_FIELDS) {
    assert.equal(
      (content.match(new RegExp('^\\*\\*' + field + ':\\*\\*', 'gm')) || []).length,
      phaseCount,
      name + ' ' + field,
    );
  }
  assert.equal(
    (content.match(/^\*\*Approval Gate:\*\*\s+\S.*$/gm) || []).length,
    phaseCount,
    name + ' Approval Gate values must be explicit and inline',
  );

  const fragmentIds = frontmatterFragments(content);
  assert.ok(fragmentIds.length > 0, name + ' declares fragments');
  assert.equal(new Set(fragmentIds).size, fragmentIds.length, name + ' fragment IDs are unique');
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const available = new Map(
    markdownTree(path.join(ROOT, 'utils/fragments'))
      .filter((file) => path.basename(file).startsWith('fragment-'))
      .map((file) => [path.basename(file, '.md'), file]),
  );
  for (const id of fragmentIds) {
    const file = available.get(id);
    assert.ok(file, name + ' resolves ' + id);
    assert.match(body, new RegExp('`' + escapeRegExp(id) + '`'), name + ' binds ' + id);
    const fragment = fs.readFileSync(file, 'utf8');
    const type = fragment.match(/^fragment_type:\s*(\w+)/m)?.[1];
    assert.ok(REQUIRED_FRAGMENT_SECTIONS[type], id + ' has a supported fragment type');
    for (const section of REQUIRED_FRAGMENT_SECTIONS[type]) {
      assert.match(fragment, new RegExp('^' + escapeRegExp(section), 'm'), id + ' missing ' + section);
    }
  }
}

const TEAM_MEMBER_IDS = new Set(
  files(path.join(ROOT, 'team'), (name) => /^[a-z][a-z0-9-]*\.md$/.test(name))
    .map((name) => path.basename(name, '.md')),
);

const EXPECTED_PHASE_MEMBERS = {
  'pipeline-define-policies.md': [[['full-stack-tech-lead'], ['be-architect'], ['be-architect']], [['be-architect'], [], ['roadmapper']], [['roadmapper'], ['reviewer'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
  'pipeline-bootstrap-workspace.md': [[['roadmapper'], [], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], ['e2e-tester']], [['e2e-tester'], [], []]],
  'pipeline-onboard-service-repo.md': [[['full-stack-tech-lead'], ['be-architect'], ['be-architect']], [['be-architect'], [], ['reviewer']], [['reviewer'], [], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], []]],
  'pipeline-review-change.md': [[['full-stack-tech-lead'], [], ['e2e-tester']], [['e2e-tester'], [], ['reviewer']], [['reviewer'], [], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['roadmapper']], [['roadmapper'], [], []]],
  'pipeline-release-change.md': [[['roadmapper'], ['e2e-tester'], ['roadmapper']], [['roadmapper'], [], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
  'pipeline-add-eval.md': [[['e2e-tester'], ['roadmapper'], ['e2e-tester']], [['e2e-tester'], ['reviewer'], ['e2e-tester']], [['e2e-tester'], [], []]],
  'pipeline-capture-intent.md': [[['visionaire'], ['roadmapper'], ['roadmapper']], [['roadmapper'], ['e2e-tester', 'reviewer'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
  'pipeline-design-spec.md': [[['roadmapper'], [], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['be-architect'], ['be-architect']], [['be-architect'], ['full-stack-tech-lead'], ['roadmapper']], [['roadmapper'], ['e2e-tester', 'reviewer'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
  'pipeline-create-loop.md': [[['roadmapper'], [], ['roadmapper']], [['roadmapper'], ['full-stack-tech-lead'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['roadmapper', 'e2e-tester'], []]],
  'pipeline-create-pipeline.md': [[['roadmapper'], [], ['roadmapper']], [['roadmapper'], ['full-stack-tech-lead'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['roadmapper', 'e2e-tester'], []]],
  'pipeline-create-team-member.md': [[['roadmapper'], [], ['roadmapper']], [['roadmapper'], ['full-stack-tech-lead'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
  'pipeline-define-codebase-stack.md': [[['full-stack-tech-lead'], ['roadmapper'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['roadmapper'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['e2e-tester'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['e2e-tester'], []]],
  'pipeline-define-system-architecture.md': [[['full-stack-tech-lead'], ['roadmapper'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], ['e2e-tester']], [['e2e-tester'], ['full-stack-tech-lead', 'roadmapper'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['e2e-tester'], []]],
  'pipeline-execute-mission.md': [[['roadmapper'], [], ['roadmapper']], [['roadmapper'], [], ['roadmapper']], [['roadmapper'], [], []]],
  'pipeline-execute-plan.md': [[['roadmapper'], [], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['roadmapper'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], [], ['e2e-tester']], [['e2e-tester'], ['roadmapper', 'full-stack-tech-lead'], []]],
  'pipeline-plan-new-feature.md': [[['visionaire'], ['roadmapper'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['fe-architect', 'be-architect'], ['full-stack-tech-lead']], [['full-stack-tech-lead'], ['fe-architect', 'be-architect'], ['roadmapper']], [['roadmapper'], ['full-stack-tech-lead'], ['roadmapper']], [['roadmapper'], [], ['roadmapper']], [['roadmapper'], ['full-stack-tech-lead'], []]],
  'pipeline-record-decision.md': [[['roadmapper'], [], ['roadmapper']], [['roadmapper'], [], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
  'pipeline-start-mission.md': [[['roadmapper'], [], ['roadmapper']], [['roadmapper'], ['e2e-tester'], ['roadmapper']], [['roadmapper'], ['e2e-tester'], []]],
};

function phaseBlocks(content) {
  const parts = content.split(/^### Phase \d+: [^\n]+$/m);
  return parts.slice(1);
}

function memberIds(block, field, required) {
  const value = block.match(new RegExp('^\\*\\*' + escapeRegExp(field) + ':\\*\\*[ \\t]*(.*)$', 'm'))?.[1];
  if (required) assert.notEqual(value, undefined, field + ' label is required');
  if (value === undefined) return [];
  assert.equal(value.replace(/`[^`]+`/g, '').replace(/[\s,]/g, ''), '', field + ' contains only member IDs');
  const ids = [...value.matchAll(/`([^`]+)`/g)].map((item) => item[1]);
  assert.equal(new Set(ids).size, ids.length, field + ' has no duplicate member IDs');
  ids.forEach((id) => assert.ok(TEAM_MEMBER_IDS.has(id), field + ' resolves team member ' + id));
  return ids;
}

function assertPhaseMembers(members) {
  for (const [name, expected] of Object.entries(members)) {
    const phases = phaseBlocks(pipelineContent(name));
    assert.equal(phases.length, expected.length, name + ' phase count');
    phases.forEach((phase, index) => {
      const [actors, support, handoff] = expected[index];
      assert.deepEqual(memberIds(phase, 'Acting Role', true), actors, name + ' phase ' + (index + 1) + ' actors');
      assert.equal(actors.length, 1, name + ' phase ' + (index + 1) + ' has one accountable actor');
      assert.deepEqual(memberIds(phase, 'Support Team', false), support, name + ' phase ' + (index + 1) + ' support');
      assert.deepEqual(memberIds(phase, 'Handoff To', true), handoff, name + ' phase ' + (index + 1) + ' handoff');
    });
  }
}

test('required starter pipelines preserve accountable actors, support, and member handoffs', () => {
  assertPhaseMembers(EXPECTED_PHASE_MEMBERS);
});

const SDLC_PIPELINES = ['pipeline-define-policies.md', 'pipeline-bootstrap-workspace.md', 'pipeline-onboard-service-repo.md', 'pipeline-review-change.md', 'pipeline-release-change.md', 'pipeline-add-eval.md', 'pipeline-capture-intent.md', 'pipeline-design-spec.md'];

test('SDLC delivery pipelines have complete phase contracts', () => {
  for (const name of SDLC_PIPELINES) assertDetailedPipelineContract(name, EXPECTED_PHASE_MEMBERS[name].length);
});

test('starter capabilities remain present while installed workspaces may extend pipelines', () => {
  assert.equal(
    files(path.join(ROOT, 'utils/loops'), (name) => /^loop-.+\.md$/.test(name)).length,
    5,
  );
  const pipelineFiles = files(path.join(ROOT, 'utils/pipelines'), (name) => /^pipeline-.+\.md$/.test(name));
  for (const name of Object.keys(EXPECTED_PHASE_MEMBERS)) {
    assert.ok(pipelineFiles.includes(name), name + ' remains available');
  }
  if (path.basename(ROOT) === '.pipes.example') assert.equal(pipelineFiles.length, 18);
  assert.deepEqual(
    files(
      path.join(ROOT, 'utils/scripts'),
      (name) => name.endsWith('.cjs') && !name.endsWith('.test.cjs'),
    ),
    [
      'assemble-instructions.cjs',
      'assemble-loop-skills.cjs',
      'assemble-pipeline-skills.cjs',
      'generate-catalog.cjs',
      'generate-framework-provenance.cjs',
      'generate-source-map.cjs',
      'project-artifact-validation.cjs',
    'project-record-metadata.cjs',
    'validate-project-records.cjs',
      'validate-pure-markdown.cjs',
      'assemble-agents.cjs',
      'assemble-hooks.cjs',
      'assemble-rule-skills.cjs',
      'delivery-profile.cjs',
      'hook-guard-protected-actions.cjs',
      'hook-protect-paths.cjs',
      'report-metrics.cjs',
      'run-evals.cjs',
      'starter-layer.cjs',
      'verify-starter.cjs',
    ].sort(),
  );

  const removed = [
    'utils/loops/operational-kernel.md',
    'utils/loops/mission-operations.md',
    'utils/loops/loop-project-definition.md',
    'utils/rules/rule-work-graph-integrity.md',
    'utils/scripts/validate-operational-state.cjs',
    'utils/scripts/validate-install.cjs',
    'utils/scripts/migration-dry-run.cjs',
  ];
  removed.forEach((rel) => assert.equal(fs.existsSync(path.join(ROOT, rel)), false, rel));
  assert.equal(fs.existsSync(path.join(ROOT, 'utils/rules/rule-framework-provenance.md')), true);
  assert.equal(fs.existsSync(path.join(ROOT, 'utils/scripts/generate-framework-provenance.cjs')), true);
  assert.equal(fs.existsSync(path.join(ROOT, 'utils/scripts/fixtures/framework-provenance/digest-contract-v1.json')), true);
});

test('all starter loops declare the shared mission integration contract', () => {
  const closureFragments = [
    'fragment-capture-execution-outcome',
    'fragment-format-outcome-record',
    'fragment-create-outcome-file',
  ];
  for (const file of files(path.join(ROOT, 'utils/loops'), (name) => /^loop-.+\.md$/.test(name))) {
    const content = fs.readFileSync(path.join(ROOT, 'utils/loops', file), 'utf8');
    const declaredFragments = frontmatterFragments(content);
    assert.match(content, /^## Mission Integration$/m, file);
    assert.match(content, /`framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`/, file);
    assert.match(content, /Specialized mission phases:/, file);
    closureFragments.forEach((id) => assert.ok(declaredFragments.includes(id), file + ' declares ' + id));
    assert.match(content, /After Validate and Reflect establish a terminal `succeeded`, `partial`, `failed`, or `cancelled` result/, file);
    assert.match(content, /exactly one approved, validated related outcome/, file);
    assert.match(content, /existing `related` paths for a matching outcome/, file);
    assert.match(content, /one closure package containing the exact outcome preview, mission terminal cleanup, `done` status change, and both reciprocal `related` links/, file);
    assert.match(content, /expected app-managed effects/, file);
    assert.match(content, /lightweight loop run without a mission does not create a mission outcome/, file);
  }
});

test('mission closure and Pipes Local relationship effects remain approval-bound and retry-safe', () => {
  const core = coreContract();
  const capture = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-capture-execution-outcome.md'),
    'utf8',
  );
  const create = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-create-outcome-file.md'),
    'utf8',
  );
  const state = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-state-update.md'),
    'utf8',
  );
  const gate = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-gate-evaluation.md'),
    'utf8',
  );
  const approval = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-request-approval.md'),
    'utf8',
  );
  const areaRule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-area-config-compliance.md'),
    'utf8',
  );
  const missionRule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-mission-state-integrity.md'),
    'utf8',
  );

  for (const content of [core, state, gate, missionRule]) {
    assert.match(content, /exactly one approved, validated related outcome/);
  }
  for (const content of [capture, create]) {
    assert.match(content, /existing `related` paths/);
    assert.match(content, /reuse exactly one matching outcome/);
  }
  for (const content of [core, create, approval, areaRule]) {
    assert.match(content, /automatic reciprocal `related` update/);
    assert.match(content, /related-sync-state\.json/);
    assert.match(content, /expected app-managed effects/);
  }
  assert.match(create, /direct agent-authored reciprocal edit requires that approval/);
  assert.match(approval, /do not authorize additional direct edits/);
  assert.match(areaRule, /does not authorize a direct agent-authored edit/);
});

test('operational Markdown contains no retired runtime contract', () => {
  const surfaces = [
    path.join(ROOT, 'ai-instructions'),
    path.join(ROOT, 'utils/fragments'),
    path.join(ROOT, 'utils/loops'),
    path.join(ROOT, 'utils/pipelines'),
    path.join(ROOT, 'utils/rules'),
  ];
  const excluded = new Set([path.join(ROOT, 'utils/fragments/CATALOG.md')]);
  const pattern = /operational-kernel|mission-operations|state_revision|mission-state:start|^loop_compatible:/m;
  for (const file of surfaces.flatMap(markdownTree).filter((item) => !excluded.has(item))) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), pattern, path.relative(ROOT, file));
  }
});

test('fragment IDs resolve uniquely across pipeline and loop contracts', () => {
  const fragmentFiles = markdownTree(path.join(ROOT, 'utils/fragments'))
    .filter((file) => path.basename(file).startsWith('fragment-'));
  const available = new Map();
  for (const file of fragmentFiles) {
    const id = path.basename(file, '.md');
    assert.equal(available.has(id), false, 'duplicate fragment ID ' + id);
    available.set(id, file);
  }

  const contracts = [
    ...starterPipelineFiles().map((name) => path.join(ROOT, 'utils/pipelines', name)),
    ...markdownTree(path.join(ROOT, 'utils/loops'))
      .filter((file) => path.basename(file).startsWith('loop-')),
  ];
  for (const contract of contracts) {
    const content = fs.readFileSync(contract, 'utf8');
    for (const id of frontmatterFragments(content)) {
      assert.ok(available.has(id), path.relative(ROOT, contract) + ' resolves ' + id);
    }
  }

  const core = coreContract();
  assert.match(core, /resolve its exact filename recursively under `\.pipes\/utils\/fragments\/`/);
  assert.match(core, /treat zero or multiple matches as an integrity error/);
});

test('Pipes Markdown keeps prose blocks on one physical line', () => {
  const writingRule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-output-writing-style.md'),
    'utf8',
  );
  assert.match(writingRule, /one physical Markdown line/);
  assert.match(writingRule, /hard-wrapped prose as a validation failure/);
  const failures = [];
  const frameworkSurfaces = [
    path.join(ROOT, 'ai-instructions'),
    path.join(ROOT, 'team'),
    path.join(ROOT, 'utils'),
  ];
  for (const file of frameworkSurfaces.flatMap(markdownTree)) {
    for (const line of hardWrappedProse(fs.readFileSync(file, 'utf8'))) {
      failures.push(path.relative(ROOT, file) + ':' + line);
    }
  }
  assert.deepEqual(failures, [], 'hard-wrapped prose:\n' + failures.slice(0, 50).join('\n'));
});

test('pure-Markdown enforcement reaches shared authoring boundaries and every loop', () => {
  const rule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-pure-markdown-writing.md'),
    'utf8',
  );
  for (const expected of [
    'enforcement: binding',
    'formatting, preview, approval, write, generation, validation, and completion boundary',
    'inline code or fenced code',
    'validate-pure-markdown.cjs',
  ]) assert.match(rule, new RegExp(escapeRegExp(expected), 'i'));

  for (const file of files(path.join(ROOT, 'utils/loops'), (name) => /^loop-.+\.md$/.test(name))) {
    assert.match(
      fs.readFileSync(path.join(ROOT, 'utils/loops', file), 'utf8'),
      /^  - rule-pure-markdown-writing$/m,
      file,
    );
  }

  for (const relative of [
    'utils/fragments/question/fragment-request-approval.md',
    'utils/fragments/question/fragment-request-phase-approval.md',
    'utils/fragments/instruction/fragment-create-files.md',
    'utils/fragments/instruction/fragment-state-update.md',
  ]) {
    const content = fs.readFileSync(path.join(ROOT, relative), 'utf8');
    assert.match(content, /pure-Markdown|pure_markdown|rule-pure-markdown-writing/i, relative);
  }
});

test('record configs use readable fields rather than typed identity fields', () => {
  const configs = markdownTree(path.join(ROOT, 'project'))
    .filter((file) => path.basename(file) === 'config.md');
  for (const config of configs) {
    const content = fs.readFileSync(config, 'utf8');
    assert.doesNotMatch(content, /^\s+- id: [a-z]+_id$/m, path.relative(ROOT, config));
    assert.match(content, /^\s+- id: version$/m);
    assert.match(content, /^\s+- id: status$/m);
    assert.match(content, /^\s+- id: related$/m);
  }
});

test('project records use only their readable area fields', () => {
  const common = ['title', 'description', 'version', 'created', 'status', 'related'];
  const allowedByArea = {
    '00-notes': common,
    '01-intents': common,
    '02-specs': common,
    '03-missions': [...common, 'loop'],
    '04-plans': common,
    '05-decisions': common,
    '06-outcomes': [...common, 'result'],
    '07-artifacts': common,
  };
  for (const [area, allowed] of Object.entries(allowedByArea)) {
    const dir = path.join(ROOT, 'project', area);
    const records = markdownTree(dir).filter((file) => {
      const name = path.basename(file);
      return name !== 'README.md' && name !== 'config.md';
    });
    for (const record of records) {
      const content = fs.readFileSync(record, 'utf8');
      const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
      const fields = [...frontmatter.matchAll(/^([a-z][a-z_]*):/gm)].map((item) => item[1]);
      fields.forEach((field) => assert.ok(allowed.includes(field), path.relative(ROOT, record) + ' has unsupported ' + field));
    }
  }
});

test('creation pipelines have complete phase contracts and compatible foundations', () => {
  for (const name of [
    'pipeline-create-loop.md',
    'pipeline-create-pipeline.md',
    'pipeline-create-team-member.md',
  ]) assertDetailedPipelineContract(name, 4);

  const intent = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-pipeline-intent.md'),
    'utf8',
  );
  for (const category of [
    'creation',
    'definition',
    'planning',
    'orchestration',
    'delivery',
    'record',
  ]) assert.match(intent, new RegExp('`' + category + '`'));
  assert.match(intent, /phase order, accountable actors, fixed support members, dynamic-role resolution conditions, concrete member handoffs/i);
  assert.match(intent, /validation evidence/i);

  const phaseDefinition = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-define-phases.md'),
    'utf8',
  );
  for (const field of DETAILED_PHASE_FIELDS) {
    assert.match(phaseDefinition, new RegExp('`\\*\\*' + field + ':\\*\\*`'));
  }
  assert.match(phaseDefinition, /Team Contract/);
  assert.match(phaseDefinition, /Loop Use/);

  const fragmentMapping = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-identify-fragments.md'),
    'utf8',
  );
  assert.match(fragmentMapping, /exact union of phase/i);
  assert.match(fragmentMapping, /declared-but-unused and used-but-undeclared/i);
  assert.match(fragmentMapping, /rule-validate-fragment-types/);

  const approval = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-request-approval.md'),
    'utf8',
  );
  assert.match(approval, /displayed content, target paths, and listed creation effects/i);
  assert.match(approval, /excluded_effects/);
  assert.doesNotMatch(approval, /Pipeline ID and name|Phase 3: Redefine|Phase 5|Phase 6/);

  const approvalConsumers = starterPipelineFiles()
    .filter((name) => frontmatterFragments(pipelineContent(name)).includes('fragment-request-approval'));
  assert.deepEqual(approvalConsumers, [
    'pipeline-add-eval.md',
    'pipeline-capture-intent.md',
    'pipeline-create-loop.md',
    'pipeline-create-pipeline.md',
    'pipeline-create-team-member.md',
    'pipeline-define-codebase-stack.md',
    'pipeline-define-policies.md',
    'pipeline-define-system-architecture.md',
    'pipeline-design-spec.md',
    'pipeline-onboard-service-repo.md',
    'pipeline-record-decision.md',
    'pipeline-release-change.md',
    'pipeline-review-change.md',
    'pipeline-start-mission.md',
  ]);

  const teamPipeline = pipelineContent('pipeline-create-team-member.md');
  const teamWriter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-create-team-member-file.md'),
    'utf8',
  );
  for (const content of [teamPipeline, teamWriter]) {
    for (const expected of [
      'installed_project',
      'starter_maintenance',
      '.pipes-v2/team/{role-id}.md',
      '.pipes/team/{role-id}.md',
    ]) assert.match(content, new RegExp(escapeRegExp(expected)), expected);
  }
  assert.match(teamPipeline, /writes? and validates? `\.pipes-v2\/` first/i);
  assert.match(teamPipeline, /execution context, ordered target set/i);
  assert.match(teamWriter, /different content as a blocking conflict/i);
  assert.match(teamWriter, /already_matches/);
  assert.match(teamWriter, /without implying that an agent was spawned/i);
});

test('definition and decision pipelines are evidence-led, context-aware, and complete', () => {
  for (const name of [
    'pipeline-define-codebase-stack.md',
    'pipeline-define-system-architecture.md',
    'pipeline-record-decision.md',
  ]) assertDetailedPipelineContract(name, 4);

  const projectQuestion = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-project-context.md'),
    'utf8',
  );
  const stackQuestion = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-stack-details.md'),
    'utf8',
  );
  for (const question of [projectQuestion, stackQuestion]) {
    assert.match(question, /repository evidence/i);
    assert.match(question, /Do not ask/i);
    assert.match(question, /evidence_sources/);
  }
  assert.doesNotMatch(projectQuestion, /What is this project\?/);
  assert.doesNotMatch(stackQuestion, /List the key technologies/);

  const codebaseDiscovery = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-check-existing-codebase-files.md'),
    'utf8',
  );
  for (const value of ['installed_project', 'starter_maintenance', '.pipes-v2/', '.pipes/']) {
    assert.match(codebaseDiscovery, new RegExp(escapeRegExp(value)));
  }

  const projectFormatter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/output/fragment-format-project-instruction.md'),
    'utf8',
  );
  for (const expected of ['assembly: inline', '## Stack', '## Architecture']) {
    assert.match(projectFormatter, new RegExp(escapeRegExp(expected)));
  }
  assert.doesNotMatch(projectFormatter, /Pipes Notebook/);
  assert.doesNotMatch(projectFormatter, /^# Project:/m);

  const conventionsFormatter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/output/fragment-format-codebase-conventions-rule.md'),
    'utf8',
  );
  const conventionsTemplate = conventionsFormatter.match(/```markdown\n([\s\S]*?)\n```/)?.[1] || '';
  assert.ok(conventionsTemplate);
  for (const expected of [
    'rule_type: governance',
    'applies_to:',
    'enforcement: binding',
    'gate_relevance:',
    '## Requirement',
    '## Enforcement',
    '## Checks',
  ]) assert.match(conventionsTemplate, new RegExp(escapeRegExp(expected)));
  assert.doesNotMatch(conventionsTemplate, /rule_type: codebase|starter_status:|## Dos|## Don'ts/);

  const boundaryMapping = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-map-system-boundaries.md'),
    'utf8',
  );
  assert.match(boundaryMapping, /system_definition/);
  assert.match(boundaryMapping, /feature_change/);
  const boundaryConsumers = starterPipelineFiles()
    .filter((name) => frontmatterFragments(pipelineContent(name)).includes('fragment-map-system-boundaries'));
  assert.deepEqual(boundaryConsumers, [
    'pipeline-define-system-architecture.md',
    'pipeline-design-spec.md',
    'pipeline-plan-new-feature.md',
  ]);

  for (const relative of [
    'validation/fragment-check-existing-architecture-instruction.md',
    'validation/fragment-validate-architecture-instruction.md',
    'instruction/fragment-write-architecture-instruction.md',
  ]) {
    const content = fs.readFileSync(path.join(ROOT, 'utils/fragments', relative), 'utf8');
    assert.match(content, /installed_project/);
    assert.match(content, /starter_maintenance/);
    assert.match(content, /\.pipes-v2/);
    assert.match(content, /\.pipes\//);
  }
  const architectureWriter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-write-architecture-instruction.md'),
    'utf8',
  );
  assert.doesNotMatch(architectureWriter, /digest|receipt|serialized/i);
  assert.match(architectureWriter, /compare its current text directly/i);
  assert.match(architectureWriter, /already equals the approved content/i);

  const decision = pipelineContent('pipeline-record-decision.md');
  const normalizedDecision = decision.replace(/\s+/g, ' ');
  for (const expected of [
    'do_not_record',
    'duplicate',
    'supersedes_existing',
    'proper authority',
    '`proposed`',
    '`accepted`',
    'silently alter another decision',
  ]) assert.match(normalizedDecision, new RegExp(escapeRegExp(expected), 'i'));
});

test('Start Mission records a compact draft and never starts its loop', () => {
  const pipeline = fs.readFileSync(
    path.join(ROOT, 'utils/pipelines/pipeline-start-mission.md'),
    'utf8',
  );
  assert.equal((pipeline.match(/^### Phase \d+:/gm) || []).length, 3);
  assert.equal((pipeline.match(/^\*\*Approval Gate:\*\*\s+\S.*$/gm) || []).length, 3);
  assert.match(pipeline, /\*\*Approval Gate:\*\* Human-mandatory\./);
  assert.match(pipeline, /One explicit user approval covers/);
  assert.match(pipeline, /no more than 300 physical lines before `## Journal`/);
  assert.match(pipeline, /Journal heading and content are excluded/i);
  assert.match(pipeline, /execution has not started/i);
  assert.doesNotMatch(
    pipeline,
    /follow the selected loop|immediate continuation|begin governed progress|Write And Handoff/i,
  );
  assert.doesNotMatch(pipeline, /JSON|state_revision|immutable.*ID/i);

  const formatter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/output/fragment-format-mission-record.md'),
    'utf8',
  );
  const fence = String.fromCharCode(96).repeat(3);
  const start = formatter.indexOf(fence + 'markdown\n');
  const end = formatter.indexOf('\n' + fence, start + fence.length);
  const template = start >= 0 && end > start
    ? formatter.slice(start + fence.length + 'markdown\n'.length, end)
    : '';
  assert.ok(template);
  assert.ok(template.slice(0, template.indexOf('## Journal')).split('\n').length <= 300);
  assert.match(template, /^status: draft$/m);
  assert.match(template, /^Autonomy profile: `\{user_mediated\|delegated_until_escalation\|mixed\}`$/m);
  assert.match(template, /^Human-intervention level: `\{more\|less\|context-dependent\}`$/m);
  assert.match(template, /^Active workflow:/m);
  assert.match(template, /^Pending gate:/m);
  assert.match(template, /^Resume trigger:/m);
  assert.match(template, /^Validation target:/m);
  assert.match(template, /^### \{YYYY-MM-DD hh:mm:ss\} — Created$/m);
  const body = template.replace(/^---\n[\s\S]*?\n---\n/, '');
  assert.match(body, /^## Objective$/m);
  assert.doesNotMatch(body, /^# /m);
  for (const section of [
    '## Objective',
    '## Scope',
    '## Delivery',
    '## Operating Envelope',
    '## Roles',
    '## Current State',
    '## Gates',
    '## Validation',
    '## Stop',
    '## Next Actions',
    '## Journal',
  ]) assert.match(template, new RegExp(section));

  const creator = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-create-mission-file.md'),
    'utf8',
  );
  const activation = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-activate-mission.md'),
    'utf8',
  );
  const stateUpdate = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-state-update.md'),
    'utf8',
  );
  const readiness = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/validation/fragment-assess-mission-readiness.md'),
    'utf8',
  );
  assert.match(creator, /execution_not_started/);
  assert.match(creator, /Do not invoke the selected loop/);
  assert.match(creator, /Do not invoke the selected loop, a planning or execution pipeline/);
  for (const contract of [formatter, creator, activation, stateUpdate, readiness]) {
    assert.match(contract, /YYYY-MM-DD hh:mm:ss/);
  }
});

test('Start Mission requires an explicit autonomy selection before preview or write', () => {
  const pipeline = pipelineContent('pipeline-start-mission.md');
  const phaseOne = phaseBlocks(pipeline)[0];
  const question = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-mission-definition.md'),
    'utf8',
  );
  const readiness = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/validation/fragment-assess-mission-readiness.md'),
    'utf8',
  );
  const formatter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/output/fragment-format-mission-record.md'),
    'utf8',
  );

  assert.match(phaseOne, /for every new mission/i);
  assert.match(phaseOne, /wait for the user's explicit selection/i);
  assert.match(phaseOne, /do not build a mission preview or write a file/i);
  assert.match(phaseOne, /before finalizing loop selection/i);
  assert.match(phaseOne, /Phase 1 blocks until the user explicitly selects/i);
  for (const [level, profile] of [
    ['less', 'delegated_until_escalation'],
    ['more', 'user_mediated'],
    ['context-dependent', 'mixed'],
  ]) {
    assert.match(question, new RegExp('`' + level + '` — map to `' + profile + '`'));
    assert.match(readiness, new RegExp('`' + level + '` to `' + profile + '`'));
  }
  for (const forbiddenInference of [
    'task size',
    'risk',
    'scope detail',
    'selected loop',
    'prior missions',
    'protected actions',
    'preferred safety posture',
  ]) assert.match(question, new RegExp(forbiddenInference));
  assert.match(question, /does not select the level for a new mission/i);
  assert.match(readiness, /missing, contradictory, unconfirmed, or unmapped values fail readiness/i);
  assert.match(readiness, /cannot complete, finalize loop selection, build a preview, or write a mission/i);
  assert.match(readiness, /preview approval does not create or alter that choice/i);
  assert.match(formatter, /Preserve the explicit user-selected human-intervention level/i);
  assert.match(formatter, /User explicitly selected `\{human-intervention level\}` intervention/i);
  assert.match(pipeline, /Treat creation approval as file approval only; never infer execution approval/i);

  assert.doesNotMatch(pipeline, /\.pipes-v2\//);
});

test('Start Mission guides zero-context and contextual intent before collaboration selection', () => {
  const pipeline = pipelineContent('pipeline-start-mission.md');
  const phaseOne = phaseBlocks(pipeline)[0];
  const question = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-mission-definition.md'),
    'utf8',
  );

  assert.match(pipeline, /^### Phase 1: Discover Intent, Choose Collaboration, And Route Delivery$/m);
  assert.match(question, /creates a draft mission only; it does not start execution/i);
  assert.match(question, /What would you like this mission to accomplish\?/);
  assert.match(question, /one open question before discussing scope or collaboration/i);
  assert.ok(
    question.indexOf('What would you like this mission to accomplish?')
      < question.indexOf('Human intervention controls collaboration cadence.'),
  );

  for (const expected of [
    'objective',
    'in-scope and out-of-scope boundaries',
    'observable validation evidence',
    'assumptions',
    'Do not ask the user to repeat information already supplied',
  ]) assert.match(question, new RegExp(escapeRegExp(expected), 'i'));
  for (const field of ['Objective', 'In scope', 'Out of scope', 'Done when', 'Assumptions']) {
    assert.match(question, new RegExp(escapeRegExp(field)));
  }
  assert.match(question, /Is anything materially wrong or missing\?/);
  assert.match(question, /only when the answer would materially change/i);

  const contextualIntent = phaseOne.indexOf('with contextual input');
  const authoredFrame = phaseOne.indexOf('Present the agent-authored frame');
  const collaboration = phaseOne.indexOf('After intent is concrete');
  const loopSelection = phaseOne.indexOf('Use `fragment-select-loop`');
  assert.ok(contextualIntent >= 0);
  assert.ok(authoredFrame > contextualIntent);
  assert.ok(collaboration > authoredFrame);
  assert.ok(loopSelection > collaboration);

  assert.match(question, /does not remove mandatory approvals, protected-action approvals, or the separate mission-execution approval/i);
  assert.deepEqual(
    question.match(/^- `(less|context-dependent|more)` — map to `(delegated_until_escalation|mixed|user_mediated)`;.*$/gm),
    [
      '- `less` — map to `delegated_until_escalation`; delegate routine decisions and pause at mandatory gates or declared escalation boundaries.',
      '- `context-dependent` — map to `mixed`; continue routine bounded work and pause at additional agreed checkpoints plus every mandatory gate.',
      '- `more` — map to `user_mediated`; return before meaningful branching decisions and protected actions as well as mandatory gates.',
    ],
  );
  assert.match(question, /map it to the closest supported choice and ask the user to confirm that mapping explicitly/i);
  assert.match(question, /If `context-dependent` is selected, ask which additional checkpoints should trigger a pause/i);

  assert.match(phaseOne, /without requiring loop-taxonomy knowledge/i);
  assert.match(phaseOne, /Intent, scope, exclusions, assumptions, authority, and validation are concrete and confirmed before collaboration is selected/i);
  assert.match(phaseOne, /do not build a mission preview or write a file until every Phase 1 exit condition is met/i);
  assert.match(phaseOne, /do not invoke a pipeline, activate, execute, or perform its first action/i);
  assert.equal((pipeline.match(/^### Phase \d+:/gm) || []).length, 3);
  assert.equal(files(path.join(ROOT, 'utils/loops'), (name) => /^loop-.+\.md$/.test(name)).length, 5);
  assert.match(pipeline, /Do not embed serialized runtime state/i);
  assert.match(pipeline, /Do not default or infer the intervention selection/i);
  assert.match(pipeline, /Treat creation approval as file approval only; never infer execution approval/i);
});

test('Start Mission decomposes delivery after loop selection without making pipelines mandatory', () => {
  const pipeline = pipelineContent('pipeline-start-mission.md');
  const phaseOne = phaseBlocks(pipeline)[0];
  const decomposition = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-decompose-mission-scope.md'),
    'utf8',
  );
  const deliveryQuestion = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-delivery-approach.md'),
    'utf8',
  );
  const formatter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/output/fragment-format-mission-record.md'),
    'utf8',
  );
  const reader = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-read-mission-record.md'),
    'utf8',
  );
  const stateUpdate = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-state-update.md'),
    'utf8',
  );

  const loopSelection = phaseOne.indexOf('Use `fragment-select-loop`');
  const scopeDecomposition = phaseOne.indexOf('Use `fragment-decompose-mission-scope`');
  const deliverySelection = phaseOne.indexOf('use `fragment-ask-delivery-approach`');
  const previewBoundary = phaseOne.indexOf('do not build a mission preview');
  assert.ok(loopSelection >= 0);
  assert.ok(scopeDecomposition > loopSelection);
  assert.ok(deliverySelection > scopeDecomposition);
  assert.ok(previewBoundary > deliverySelection);

  for (const classification of ['plan-required', 'plan-recommended', 'direct-capable']) {
    assert.match(decomposition, new RegExp('`' + classification + '`'));
    assert.match(formatter, new RegExp(classification));
  }
  assert.match(decomposition, /file-level steps, commands, test cases, estimates, or an execution queue/i);
  assert.match(decomposition, /available capabilities only/i);
  assert.match(deliveryQuestion, /Ask the user to choose only when both routes are valid/i);
  assert.match(deliveryQuestion, /Do not invoke this fragment when only one route is valid/i);
  assert.match(pipeline, /do not invoke planning, execution, or another optional pipeline during Start Mission/i);
  assert.match(formatter, /^## Delivery$/m);
  assert.match(reader, /legacy_without_delivery/);
  assert.match(stateUpdate, /Under `spec-driven`/);
  assert.match(stateUpdate, /Under `adaptive`/);
  assert.match(stateUpdate, /capability inventory.*selected persisted route.*obligatory/i);

  for (const file of files(path.join(ROOT, 'utils/loops'), (name) => /^loop-.+\.md$/.test(name))) {
    const loop = fs.readFileSync(path.join(ROOT, 'utils/loops', file), 'utf8');
    assert.match(loop, /When the mission has `## Delivery`/);
    assert.match(loop, /capability inventory.*selected persisted route.*obligatory/i);
    assert.match(loop, /preserve the exact post-subworkflow resume action/i);
  }
});

test('spec-driven missions require complete approved plan coverage without counting plans by theme', () => {
  const core = coreContract();
  const startMission = pipelineContent('pipeline-start-mission.md');
  const executeMission = pipelineContent('pipeline-execute-mission.md');
  const planFeature = pipelineContent('pipeline-plan-new-feature.md');
  const executePlan = pipelineContent('pipeline-execute-plan.md');
  const decomposition = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-decompose-mission-scope.md'),
    'utf8',
  );
  const deliveryQuestion = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/question/fragment-ask-delivery-approach.md'),
    'utf8',
  );
  const activation = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-activate-mission.md'),
    'utf8',
  );
  const planReadiness = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-assess-plan-execution-readiness.md'),
    'utf8',
  );

  for (const content of [core, decomposition, deliveryQuestion]) {
    assert.match(content, /plan-required.*(?:coverage|covered).*not.*(?:dedicated|separate) plan/is);
    assert.match(content, /plan-recommended.*(?:separate|additional) plan.*optional/is);
    assert.match(content, /spec-driven.*at least one approved.*plan.*complete.*mission scope/is);
    assert.match(content, /additional plans?.*(?:evidence|justif)/is);
  }
  assert.match(startMission, /records?.*(?:delivery|persisted) route.*stops?/is);
  for (const content of [executeMission, activation]) {
    assert.match(content, /spec-driven.*(?:approved|validated) plan coverage.*complete.*mission scope/is);
    assert.match(content, /pipeline-plan-new-feature/);
  }
  assert.match(planFeature, /coverage.*complete confirmed mission scope/is);
  assert.match(planFeature, /split rationale/i);
  assert.match(executePlan, /collectively cover.*complete confirmed mission scope/is);
  assert.match(planReadiness, /collectively cover.*complete confirmed mission scope/is);
  for (const content of [executePlan, planReadiness]) {
    assert.match(content, /does not.*(?:classification|theme count)/is);
  }
  for (const file of files(path.join(ROOT, 'utils/loops'), (name) => /^loop-.+\.md$/.test(name))) {
    const loop = fs.readFileSync(path.join(ROOT, 'utils/loops', file), 'utf8');
    assert.match(loop, /selected persisted route.*obligat/is, file);
    assert.match(loop, /spec-driven.*complete.*mission scope/is, file);
  }
});

test('every durable project record created under mission execution links the invoking mission reciprocally', () => {
  const durableRule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-durable-record-routing.md'),
    'utf8',
  );
  const areaRule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-area-config-compliance.md'),
    'utf8',
  );
  const recordValidator = fs.readFileSync(
    path.join(ROOT, 'utils/scripts/validate-project-records.cjs'),
    'utf8',
  );
  for (const content of [durableRule, areaRule]) {
    assert.match(content, /every durable project record created.*mission execution/is);
    assert.match(content, /direct.*reciprocal.*related/is);
    assert.match(content, /invoking mission/i);
  }
  for (const relative of [
    'utils/fragments/instruction/fragment-create-plan-file.md',
    'utils/fragments/instruction/fragment-create-decision-file.md',
    'utils/fragments/instruction/fragment-create-outcome-file.md',
    'utils/fragments/instruction/fragment-create-files.md',
  ]) {
    const content = fs.readFileSync(path.join(ROOT, relative), 'utf8');
    assert.match(content, /invoking mission/i, relative);
    assert.match(content, /reciprocal.*related/is, relative);
    assert.match(content, /re-read.*(?:record|mission)/is, relative);
  }
  assert.match(pipelineContent('pipeline-record-decision.md'), /invoking mission/i);
  assert.match(recordValidator, /mission.*(?:reciprocal|unlinked)/i);
  assert.match(recordValidator, /plan.*(?:approval|version).*receipt/i);
});

test('Execute Mission requires readiness approval before loop handoff', () => {
  const pipeline = fs.readFileSync(
    path.join(ROOT, 'utils/pipelines/pipeline-execute-mission.md'),
    'utf8',
  );
  assert.equal((pipeline.match(/^### Phase \d+:/gm) || []).length, 3);
  for (const fragment of [
    'fragment-ask-mission-selection',
    'fragment-read-mission-record',
    'fragment-assess-mission-execution-readiness',
    'fragment-request-phase-approval',
    'fragment-activate-mission',
  ]) assert.match(pipeline, new RegExp(fragment));
  assert.match(pipeline, /Human-mandatory/);
  assert.match(pipeline, /Do not treat the invocation request as this approval/);
  assert.match(pipeline, /intervention-to-autonomy mapping/);
  assert.match(pipeline, /immediate, still-valid gate continuation/i);
  assert.match(pipeline, /delivery approach and current theme when present/i);

  const phases = pipeline.slice(pipeline.indexOf('## Phases'));
  const approvalPhase = phases.indexOf('### Phase 2: Validate And Approve');
  const activationPhase = phases.indexOf('### Phase 3: Activate And Handoff');
  const explicitApproval = phases.indexOf('Human-mandatory', approvalPhase);
  const loopStart = phases.indexOf('begin only the', activationPhase);
  assert.ok(approvalPhase >= 0);
  assert.ok(explicitApproval > approvalPhase);
  assert.ok(activationPhase > explicitApproval);
  assert.ok(loopStart > activationPhase);

  const contracts = [
    ['question/fragment-ask-mission-selection.md', ['## Question', '## Capture']],
    ['instruction/fragment-read-mission-record.md', ['## Instructions', '## Output']],
    ['validation/fragment-assess-mission-execution-readiness.md', ['## Checks', '## Acceptance Criteria']],
    ['instruction/fragment-activate-mission.md', ['## Instructions', '## Output']],
  ];
  for (const [relative, sections] of contracts) {
    const content = fs.readFileSync(path.join(ROOT, 'utils/fragments', relative), 'utf8');
    sections.forEach((section) => assert.match(content, new RegExp('^' + section, 'm')));
  }
});

test('Execute Mission treats draft and active as lifecycle states while Journal receipts prove approval', () => {
  const pipeline = pipelineContent('pipeline-execute-mission.md');
  const core = coreContract();
  const missionReadme = fs.readFileSync(path.join(ROOT, 'project/03-missions/README.md'), 'utf8');
  const reader = fs.readFileSync(path.join(ROOT, 'utils/fragments/instruction/fragment-read-mission-record.md'), 'utf8');
  const readiness = fs.readFileSync(path.join(ROOT, 'utils/fragments/validation/fragment-assess-mission-execution-readiness.md'), 'utf8');
  const activation = fs.readFileSync(path.join(ROOT, 'utils/fragments/instruction/fragment-activate-mission.md'), 'utf8');
  const stateIntegrity = fs.readFileSync(path.join(ROOT, 'utils/rules/rule-mission-state-integrity.md'), 'utf8');

  for (const content of [pipeline, core, missionReadme, reader, readiness, activation, stateIntegrity]) {
    assert.match(content, /status.*lifecycle state/i);
    assert.match(content, /Journal.*receipt.*execution[- ]approval/i);
  }
  assert.match(pipeline, /both `draft` and `active`.*valid readiness candidates/i);
  assert.match(readiness, /active.*pending execution gate.*execution has not started.*coherent/i);
  assert.match(readiness, /do not classify.*needs_correction.*status alone/i);
  assert.match(activation, /preserve `active`.*same approval receipt/i);
  assert.match(reader, /active.*pending execution gate.*execution has not started.*readiness/i);
  assert.match(core, /active.*does not by itself prove execution approval/i);
  assert.match(missionReadme, /active.*does not by itself prove execution approval/i);
  assert.match(pipeline, /No mission state or mission action may change until the user explicitly approves/i);
  assert.match(readiness, /user can approve or reject execution/i);
  assert.match(pipeline, /Stop on `done`, unresolved `blocked`, invalid, ambiguous, or materially stale missions/i);
  assert.match(readiness, /Protected effects required by the initial action are identified/i);
  assert.match(activation, /Reject `done` missions and unresolved `blocked` missions/i);
  assert.match(activation, /Do not perform an initial protected action unless its separate approval/i);
  assert.match(pipeline, /immediate, still-valid gate continuation.*does not repeat this entry gate/i);
});

test('mission and plan lifecycle contracts are uniformly detailed and protected', () => {
  assertDetailedPipelineContract('pipeline-start-mission.md', 3);
  assertDetailedPipelineContract('pipeline-execute-mission.md', 3);
  assertDetailedPipelineContract('pipeline-execute-plan.md', 4);

  const startMission = pipelineContent('pipeline-start-mission.md');
  assert.match(startMission, /status remains `draft`/i);
  assert.match(startMission, /execution has not started/i);
  assert.match(startMission, /separately approved `pipeline-execute-mission`/i);
  assert.doesNotMatch(startMission, /invoke the selected loop.*after writing/i);

  const executeMission = pipelineContent('pipeline-execute-mission.md');
  assert.match(executeMission, /Human-mandatory/);
  assert.match(executeMission, /every start or resume/i);
  assert.match(executeMission, /Re-read the mission/);
  assert.match(executeMission, /unchanged\s+mission version/i);

  const executePlan = pipelineContent('pipeline-execute-plan.md');
  assert.match(executePlan, /^## Team Contract$/m);
  assert.match(executePlan, /Do not infer approval/i);
  assert.match(executePlan, /ready`, `needs_correction`, or `blocked`/);
  assert.match(executePlan, /material deviation/);
  assert.match(executePlan, /protected effect not explicitly covered/i);
  assert.match(executePlan, /recorded intervention-to-autonomy mapping/);
  assert.match(executePlan, /without requiring another pipeline command/i);
  assert.match(executePlan, /plan-content decision remains distinct and cannot authorize implementation/i);
  assert.match(executePlan, /exactly-one outcome and reciprocal-link evidence/i);
  assert.match(executePlan, /no mission or other related status changed implicitly/i);

  const readiness = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-assess-plan-execution-readiness.md'),
    'utf8',
  );
  for (const expected of [
    'plan_approval_evidence',
    'already_matches',
    'needs_correction',
    'protected_gates',
    'Do not execute',
  ]) assert.match(readiness, new RegExp(escapeRegExp(expected), 'i'));

  const executor = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-execute-approved-plan.md'),
    'utf8',
  );
  for (const expected of [
    'readiness_status: ready',
    'already_matches',
    'material deviation',
    'protected action',
    'Preserve unrelated user changes',
    'activation transition for a recorded plan',
  ]) assert.match(executor, new RegExp(escapeRegExp(expected), 'i'));

  const statusSync = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-sync-record-statuses.md'),
    'utf8',
  );
  assert.match(statusSync, /Apply nothing in this fragment/);
  assert.match(statusSync, /Do not infer that a related record is done/);
  assert.match(statusSync, /Exclude the executing source plan/);
});

test('execute plan owns recorded lifecycle and exactly-one outcome closure without inventing inline state', () => {
  const executePlan = pipelineContent('pipeline-execute-plan.md');
  const transition = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/instruction/fragment-apply-plan-lifecycle-transition.md'),
    'utf8',
  );
  const planRule = fs.readFileSync(
    path.join(ROOT, 'utils/rules/rule-plan-state-integrity.md'),
    'utf8',
  );
  for (const expected of [
    'plan_source_kind',
    'recorded` or `inline',
    'draft -> active',
    'blocked -> active',
    'active -> blocked',
    'active -> done',
    'exactly one validated related outcome',
    'Direct and mission-bound invocations share one lifecycle and outcome contract',
    'do not require or invent a plan record',
    'Result belongs to the outcome',
  ]) assert.match(executePlan, new RegExp(escapeRegExp(expected), 'i'));
  const phaseThree = executePlan.match(/^### Phase 3: Execute$[\s\S]*?(?=^### Phase 4:)/m)?.[0] || '';
  assert.ok(
    phaseThree.indexOf('fragment-apply-plan-lifecycle-transition') < phaseThree.indexOf('fragment-execute-approved-plan'),
    'recorded activation precedes the first remaining execution effect',
  );
  const phaseFour = executePlan.match(/^### Phase 4: Validate And Close$[\s\S]*$/m)?.[0] || '';
  assert.ok(
    phaseFour.indexOf('fragment-create-outcome-file') < phaseFour.lastIndexOf('active -> done'),
    'outcome creation precedes the terminal lifecycle transition',
  );
  for (const expected of [
    'transition_result: not_applicable',
    'draft` to `active',
    'active` to `blocked',
    'blocked` to `active',
    'active` to `done',
    'already matching persisted status',
    'one minor semantic version increment',
  ]) assert.match(transition, new RegExp(escapeRegExp(expected), 'i'));
  for (const expected of [
    'enforcement: binding',
    'exactly one validated related outcome',
    'direct and mission-bound',
    'inline plan content',
    'plan outcome never substitutes',
    'historical record migration',
  ]) assert.match(planRule, new RegExp(escapeRegExp(expected), 'i'));
  for (const loop of [
    'loop-artifact-production.md',
    'loop-feature-delivery.md',
    'loop-framework-maintenance.md',
    'loop-investigation-and-recovery.md',
  ]) {
    const content = fs.readFileSync(path.join(ROOT, 'utils/loops', loop), 'utf8');
    assert.match(content, /rule-plan-state-integrity/);
    assert.match(content, /without treating the plan outcome as the mission outcome/i);
  }
  assert.doesNotMatch(
    fs.readFileSync(path.join(ROOT, 'utils/loops/loop-concept-development.md'), 'utf8'),
    /rule-plan-state-integrity/,
  );
});

test('New Feature planning has a detailed six-phase contract and valid fragments', () => {
  const pipeline = fs.readFileSync(
    path.join(ROOT, 'utils/pipelines/pipeline-plan-new-feature.md'),
    'utf8',
  );
  assert.equal((pipeline.match(/^### Phase \d+:/gm) || []).length, 6);
  assert.match(pipeline, /draft plan is ready for revision/i);
  assert.match(pipeline, /until it is implementation-ready/i);
  assert.match(pipeline, /active mission will resume afterward/i);
  assert.match(pipeline, /Immediate mission continuation does not require the user to issue another pipeline command/i);
  assert.match(pipeline, /plan-content decision; it remains distinct from and does not authorize plan execution/i);
  for (const field of [
    'Objective',
    'Acting Role',
    'Entry Conditions',
    'Inputs',
    'Fragments',
    'Instructions',
    'Outputs',
    'Handoff To',
    'Approval Gate',
    'Exit Conditions',
  ]) {
    assert.equal(
      (pipeline.match(new RegExp('^\\*\\*' + field + ':\\*\\*', 'gm')) || []).length,
      6,
      field,
    );
  }

  const frontmatter = pipeline.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
  const fragmentBlock = frontmatter.match(/^fragments:\n((?:  - .+\n?)*)/m)?.[1] || '';
  const fragmentIds = fragmentBlock
    .split('\n')
    .map((line) => line.match(/^  - (fragment-.+)$/)?.[1])
    .filter(Boolean);
  assert.equal(fragmentIds.length, 23);
  for (const expected of [
    'fragment-lint-feature-questions',
    'fragment-establish-scope-guardrails',
    'fragment-map-system-boundaries',
    'fragment-assess-blast-radius',
    'fragment-assess-implementation-risks',
    'fragment-confirm-acceptance-criteria',
  ]) assert.ok(fragmentIds.includes(expected), expected);

  const available = new Map(
    markdownTree(path.join(ROOT, 'utils/fragments'))
      .filter((file) => path.basename(file).startsWith('fragment-'))
      .map((file) => [path.basename(file, '.md'), file]),
  );
  const requiredSections = {
    context: ['## Background', '## Structure'],
    instruction: ['## Instructions', '## Output'],
    output: ['## Format', '## Template'],
    question: ['## Question', '## Capture'],
    validation: ['## Checks', '## Acceptance Criteria'],
  };
  for (const id of fragmentIds) {
    const file = available.get(id);
    assert.ok(file, id + ' resolves');
    const content = fs.readFileSync(file, 'utf8');
    const type = content.match(/^fragment_type:\s*(\w+)/m)?.[1];
    assert.ok(requiredSections[type], id + ' has a supported fragment type');
    requiredSections[type].forEach((section) => assert.match(
      content,
      new RegExp('^' + section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'm'),
      id + ' missing ' + section,
    ));
  }

  const validator = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/validation/fragment-validate-plan-consistency.md'),
    'utf8',
  );
  assert.doesNotMatch(
    validator,
    /immutable plan ID|dependency IDs|ordered queue|content digest|execution-context receipt/i,
  );

  const formatter = fs.readFileSync(
    path.join(ROOT, 'utils/fragments/output/fragment-format-implementation-plan.md'),
    'utf8',
  );
  for (const section of [
    '## Outcome',
    '## Users And Requirements',
    '## Scope',
    '## Context Evidence',
    '## Recommended Approach',
    '## Solution Architecture',
    '## Implementation',
    '## Test Strategy',
    '## Risks And Preconditions',
    '## Acceptance Criteria',
    '## Deferred Work And Handoff',
  ]) assert.match(formatter, new RegExp(section));
  assert.doesNotMatch(
    [pipeline, formatter, validator].join('\n'),
    /assumption|warning/i,
    'execution-ready plan contracts contain no unresolved caveat category',
  );
});

test('starter omits staged historical decision records', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'project/05-decisions/decision-002-restore-markdown-first-orchestration.md')), false);
});
