const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { discoverRuleSkills, generate, renderSkill, MARKER_START } = require('./assemble-rule-skills.cjs');

function fixture(t, rules) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-rule-skills-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const pipeRoot = path.join(root, '.pipes');
  fs.mkdirSync(path.join(pipeRoot, 'utils/rules'), { recursive: true });
  for (const [name, content] of Object.entries(rules)) fs.writeFileSync(path.join(pipeRoot, 'utils/rules', name), content);
  return { root, pipeRoot };
}

const POLICY = '---\ntitle: Example Policy\nskill: true\nskill_description: Apply the example policy when changing a service.\n---\n# Rule\n\n## Checks\n\n- Never do the secret thing.\n';

test('only rules with skill: true become skills, and skills point to the rule without copying it', (t) => {
  const { pipeRoot } = fixture(t, { 'rule-example-policy.md': POLICY, 'rule-plain.md': '---\ntitle: Plain\n---\n' });
  const rules = discoverRuleSkills(pipeRoot);
  assert.deepEqual(rules.map((rule) => rule.skillName), ['pipes.policy-example-policy']);
  const skill = renderSkill(rules[0]);
  assert.match(skill, /`\.pipes\/utils\/rules\/rule-example-policy\.md`/);
  assert.ok(!skill.includes('Never do the secret thing'), 'skill does not copy rule text');
});

test('skill: true without a trigger description is rejected', (t) => {
  const { pipeRoot } = fixture(t, { 'rule-bad.md': '---\ntitle: Bad\nskill: true\n---\n' });
  assert.throws(() => discoverRuleSkills(pipeRoot), /skill_description/);
});

test('generation targets both skill roots, is idempotent, and removes only its own stale skills', (t) => {
  const { root, pipeRoot } = fixture(t, { 'rule-example-policy.md': POLICY });
  const foreign = path.join(root, '.claude/skills/pipes.plan-new-feature/SKILL.md');
  fs.mkdirSync(path.dirname(foreign), { recursive: true });
  fs.writeFileSync(foreign, '<!-- pipes-pipeline-skill:start -->\n');
  const stale = path.join(root, '.claude/skills/pipes.policy-old/SKILL.md');
  fs.mkdirSync(path.dirname(stale), { recursive: true });
  fs.writeFileSync(stale, MARKER_START + '\n');

  assert.equal(generate({ root, pipeRoot, check: true }).stale, true);
  generate({ root, pipeRoot });
  for (const base of ['.claude/skills', '.agents/skills']) {
    assert.ok(fs.existsSync(path.join(root, base, 'pipes.policy-example-policy/SKILL.md')), base);
  }
  assert.ok(fs.existsSync(foreign), 'pipeline skills are left alone');
  assert.ok(!fs.existsSync(stale), 'stale policy skill removed');
  assert.equal(generate({ root, pipeRoot, check: true }).stale, false);
});

test('live policy rules declare a trigger and their skills never copy rule text', () => {
  for (const rule of discoverRuleSkills()) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'rules', rule.id + '.md'), 'utf8');
    const checks = (source.split('## Checks')[1] || '').split('\n').filter((line) => line.startsWith('- '));
    const skill = renderSkill(rule);
    checks.forEach((line) => assert.ok(!skill.includes(line.slice(2)), rule.id + ' skill copies: ' + line));
  }
});

test('policy rules other than the conventions rule are project-scoped', () => {
  for (const rule of discoverRuleSkills()) {
    if (rule.id === 'rule-codebase-conventions') continue;
    const source = fs.readFileSync(path.join(__dirname, '..', 'rules', rule.id + '.md'), 'utf8');
    assert.match(source, /^scope: project$/m, rule.id + ' is project content and must declare scope: project');
  }
});
