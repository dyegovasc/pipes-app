const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { discoverAgents, generate, renderAgent, MARKER } = require('./assemble-agents.cjs');

test('reviewer and e2e-tester are the read-only isolated agents', () => {
  const agents = discoverAgents();
  assert.deepEqual(agents.map((agent) => agent.id), ['e2e-tester', 'reviewer']);
  for (const agent of agents) {
    assert.ok(!agent.tools.some((tool) => ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)), agent.id + ' is read-only');
    const content = renderAgent(agent);
    assert.match(content, new RegExp('`\\.pipes/team/' + agent.id + '\\.md`'));
    assert.match(content, /core-workflows\.md/);
    assert.ok(content.includes(MARKER));
    const persona = fs.readFileSync(path.join(__dirname, '..', '..', 'team', agent.id + '.md'), 'utf8');
    assert.match(persona, /^## Isolated Agent Mode$/m);
    const contract = persona.split('## Isolated Agent Mode')[1].split('\n## ')[0].trim().split('\n').find((line) => line.startsWith('- '));
    assert.ok(!content.includes(contract), agent.id + ' wrapper points to the persona instead of copying it');
  }
});

test('a persona that grants write tools is rejected', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-agents-persona-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'team'));
  fs.writeFileSync(path.join(root, 'team', 'writer.md'), '---\ntitle: Writer\nsubagent: true\nsubagent_tools: Read, Edit\nsubagent_description: Writes.\n---\n');
  assert.throws(() => discoverAgents(root), /read-only/);
});

test('generation is idempotent, keeps unmanaged agents, and removes stale managed ones', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-agents-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dir = path.join(root, '.claude/agents');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'mine.md'), '---\nname: mine\n---\nHand-written.\n');
  fs.writeFileSync(path.join(dir, 'old-role.md'), MARKER + '\n');

  assert.equal(generate({ root, check: true }).stale, true);
  generate({ root });
  assert.ok(fs.existsSync(path.join(dir, 'reviewer.md')));
  assert.ok(fs.existsSync(path.join(dir, 'e2e-tester.md')));
  assert.ok(fs.existsSync(path.join(dir, 'mine.md')));
  assert.ok(!fs.existsSync(path.join(dir, 'old-role.md')));
  assert.equal(generate({ root, check: true }).stale, false);
});
