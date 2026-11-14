const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { assemble, declaredHooks, mergeHooks, ruleHooks } = require('./assemble-hooks.cjs');

test('rules that list hook in enforced_by declare resolvable hooks', () => {
  const hooks = declaredHooks();
  assert.deepEqual(
    hooks.map((hook) => [hook.rule, hook.event, hook.matcher, hook.script]),
    [
      ['rule-commit-guardrails', 'PreToolUse', 'Bash', 'hook-guard-protected-actions.cjs'],
      ['rule-framework-provenance', 'PreToolUse', 'Edit|Write|MultiEdit|NotebookEdit', 'hook-protect-paths.cjs'],
    ],
  );
});

test('every rule declares a valid enforced_by list', () => {
  const dir = path.join(__dirname, '..', 'rules');
  const allowed = new Set(['model', 'hook', 'ci', 'managed-setting']);
  for (const name of fs.readdirSync(dir).filter((file) => /^rule-.+\.md$/.test(file))) {
    const content = fs.readFileSync(path.join(dir, name), 'utf8');
    const values = (content.match(/^enforced_by:\s*\[([^\]]*)\]/m)?.[1] || '').split(',').map((item) => item.trim()).filter(Boolean);
    assert.ok(values.length, name + ' declares enforced_by');
    values.forEach((value) => assert.ok(allowed.has(value), name + ' has a valid enforced_by value: ' + value));
  }
});

test('a rule that lists hook without declaring one is rejected', () => {
  assert.throws(() => ruleHooks('---\nenforced_by: [model, hook]\n---\n', 'rule-x'), /declares no hooks/);
  assert.deepEqual(ruleHooks('---\nenforced_by: [model]\n---\n', 'rule-y'), []);
});

test('merge keeps user settings and hooks and replaces only managed hooks', () => {
  const user = { permissions: { allow: ['Bash(ls:*)'] }, hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo done' }] }], PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.pipes/utils/scripts/hook-old.cjs"' }] }] } };
  const merged = mergeHooks(user, [{ event: 'PreToolUse', matcher: 'Bash', script: 'hook-guard-protected-actions.cjs' }]);
  assert.deepEqual(merged.permissions, user.permissions);
  assert.deepEqual(merged.hooks.Stop, user.hooks.Stop);
  assert.equal(merged.hooks.PreToolUse.length, 1);
  assert.match(merged.hooks.PreToolUse[0].hooks[0].command, /hook-guard-protected-actions\.cjs"$/);
});

test('assemble writes once, is idempotent, and check detects staleness', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-hooks-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, '.claude'));
  fs.writeFileSync(path.join(root, '.claude/settings.json'), JSON.stringify({ model: 'opus' }), 'utf8');

  assert.equal(assemble({ root, check: true }).changed, true);
  assert.equal(assemble({ root }).written, true);
  const settings = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json'), 'utf8'));
  assert.equal(settings.model, 'opus');
  assert.equal(settings.hooks.PreToolUse.length, 2);
  assert.equal(assemble({ root }).written, false);
  assert.equal(assemble({ root, check: true }).changed, false);
});

test('rules can own Claude settings keys through managed-setting', () => {
  const { declaredSettings, ruleSettings } = require('./assemble-hooks.cjs');
  const fs = require('node:fs');
  const path = require('node:path');
  const owner = fs.readdirSync(path.join(__dirname, '..', 'rules')).find((name) => /^claude_settings:/m.test(fs.readFileSync(path.join(__dirname, '..', 'rules', name), 'utf8')));
  if (!owner) assert.deepEqual(declaredSettings(), {});
  // Every rule's declared settings reach the generated settings exactly, for example a project attribution policy.
  const merged = declaredSettings();
  for (const name of fs.readdirSync(path.join(__dirname, '..', 'rules')).filter((file) => /^rule-.+\.md$/.test(file))) {
    const own = ruleSettings(fs.readFileSync(path.join(__dirname, '..', 'rules', name), 'utf8'), name.slice(0, -3));
    for (const [key, value] of Object.entries(own)) assert.deepEqual(merged[key], value, name + ' setting ' + key);
  }
  const settingsFile = path.join(__dirname, '..', '..', '..', '.claude', 'settings.json');
  if (fs.existsSync(settingsFile)) {
    const written = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    for (const [key, value] of Object.entries(merged)) assert.deepEqual(written[key], value, '.claude/settings.json ' + key);
  }
  assert.throws(() => ruleSettings('---\nenforced_by: [model]\nclaude_settings:\n  x: 1\n---\n', 'rule-x'), /managed-setting/);
  assert.throws(() => ruleSettings('---\nenforced_by: [managed-setting]\nclaude_settings:\n  x: bare words\n---\n', 'rule-y'), /quoted/);
  assert.deepEqual(
    ruleSettings('---\nenforced_by: [managed-setting]\nclaude_settings:\n  a:\n    b: ""\n    c: false\n  d: 2\n---\n', 'rule-z'),
    { a: { b: '', c: false }, d: 2 },
  );
  assert.ok(!/claude_settings: *\{/.test(require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'rules', 'rule-commit-guardrails.md'), 'utf8')), 'no inline JSON in rule frontmatter');
});
