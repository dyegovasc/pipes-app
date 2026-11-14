#!/usr/bin/env node
// Generates the managed Claude Code hooks in <workspace>/.claude/settings.json from the
// `hooks:` frontmatter of rules that list `hook` in `enforced_by` (rule-deterministic-enforcement).
// Non-managed settings and hooks are preserved. Managed hooks are recognised by their command,
// which always runs a script under .pipes/utils/scripts/hook-*.
const fs = require('node:fs');
const path = require('node:path');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const MANAGED_MARKER = '/.pipes/utils/scripts/hook-';

function parseArgs(argv) {
  const options = { root: path.dirname(PIPE_ROOT), check: false };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') options.check = true;
    else if (arg === '--root') { options.root = path.resolve(argv[index + 1] || ''); index += 1; }
    else if (arg.startsWith('--root=')) options.root = path.resolve(arg.slice(7));
    else throw new Error('Unknown argument: ' + arg);
  }
  return options;
}

function frontmatterBlock(content) {
  return String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
}

function ruleHooks(content, ruleId) {
  const block = frontmatterBlock(content);
  const enforcedBy = (block.match(/^enforced_by:\s*\[([^\]]*)\]/m)?.[1] || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (!enforcedBy.includes('hook')) return [];
  const hooksBlock = block.match(/^hooks:\r?\n((?:[ \t]+.*(?:\r?\n|$))*)/m)?.[1] || '';
  const hooks = [];
  let current = null;
  for (const line of hooksBlock.split(/\r?\n/)) {
    const item = line.match(/^\s*(-\s+)?([a-z_]+):\s*(.+?)\s*$/);
    if (!item) continue;
    if (item[1]) { current = {}; hooks.push(current); }
    if (current) current[item[2]] = item[3].replace(/^["']|["']$/g, '');
  }
  for (const hook of hooks) {
    if (!hook.event || !hook.matcher || !/^hook-[a-z0-9-]+\.cjs$/.test(hook.script || '')) {
      throw new Error(ruleId + ' declares an incomplete hook; each needs event, matcher, and a hook-*.cjs script.');
    }
    if (!fs.existsSync(path.join(PIPE_ROOT, 'utils/scripts', hook.script))) {
      throw new Error(ruleId + ' references a missing hook script: ' + hook.script);
    }
  }
  if (!hooks.length) throw new Error(ruleId + ' lists hook in enforced_by but declares no hooks.');
  return hooks.map((hook) => ({ ...hook, rule: ruleId }));
}

// Parses an indented frontmatter map such as:
//   claude_settings:
//     attribution:
//       commit: ""
//       sessionUrl: false
// Values are quoted strings, booleans, numbers, or nested maps (two-space indentation).
function parseNestedMap(lines, ruleId) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (const line of lines) {
    if (!line.trim()) continue;
    const item = line.match(/^( *)([A-Za-z][A-Za-z0-9_]*):(?:\s+(.*))?$/);
    if (!item) throw new Error(ruleId + ' has an unreadable claude_settings line: ' + line.trim());
    const indent = item[1].length;
    while (stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].value;
    const raw = item[3];
    if (raw === undefined || raw === '') {
      parent[item[2]] = {};
      stack.push({ indent, value: parent[item[2]] });
    } else if (/^".*"$/.test(raw) || /^'.*'$/.test(raw)) parent[item[2]] = raw.slice(1, -1);
    else if (raw === 'true' || raw === 'false') parent[item[2]] = raw === 'true';
    else if (/^-?\d+(\.\d+)?$/.test(raw)) parent[item[2]] = Number(raw);
    else throw new Error(ruleId + ' claude_settings value must be quoted, a boolean, or a number: ' + item[2]);
  }
  return root;
}

// Rules that list `managed-setting` in enforced_by may declare a nested `claude_settings:` block.
// Its top-level keys are owned by Pipes and overwritten on every generation.
function ruleSettings(content, ruleId) {
  const block = frontmatterBlock(content);
  const enforcedBy = (block.match(/^enforced_by:\s*\[([^\]]*)\]/m)?.[1] || '').split(',').map((item) => item.trim());
  const match = block.match(/^claude_settings:[ \t]*\r?\n((?:[ \t]+.*(?:\r?\n|$))*)/m);
  if (!match) return {};
  if (!enforcedBy.includes('managed-setting')) throw new Error(ruleId + ' declares claude_settings but does not list managed-setting in enforced_by.');
  const lines = match[1].split(/\r?\n/).filter((line) => line.trim());
  const base = Math.min(...lines.map((line) => line.match(/^ */)[0].length));
  return parseNestedMap(lines.map((line) => line.slice(base)), ruleId);
}

function declaredSettings(pipeRoot = PIPE_ROOT) {
  const dir = path.join(pipeRoot, 'utils/rules');
  const merged = {};
  for (const name of fs.readdirSync(dir).filter((file) => /^rule-.+\.md$/.test(file)).sort()) {
    const settings = ruleSettings(fs.readFileSync(path.join(dir, name), 'utf8'), name.slice(0, -3));
    for (const [key, value] of Object.entries(settings)) {
      if (key === 'hooks') throw new Error(name + ' must declare hooks with the hooks: frontmatter block, not claude_settings.');
      if (Object.hasOwn(merged, key)) throw new Error('Two rules declare the claude setting ' + key + '.');
      merged[key] = value;
    }
  }
  return merged;
}

function declaredHooks(pipeRoot = PIPE_ROOT) {
  const dir = path.join(pipeRoot, 'utils/rules');
  return fs.readdirSync(dir)
    .filter((name) => /^rule-.+\.md$/.test(name))
    .sort()
    .flatMap((name) => ruleHooks(fs.readFileSync(path.join(dir, name), 'utf8'), name.slice(0, -3)));
}

function hookCommand(script) {
  return 'node "$CLAUDE_PROJECT_DIR' + MANAGED_MARKER + script.slice('hook-'.length) + '"';
}

function isManaged(entry) {
  return typeof entry?.command === 'string' && entry.command.includes(MANAGED_MARKER);
}

function mergeHooks(settings, hooks) {
  const result = JSON.parse(JSON.stringify(settings || {}));
  const existing = result.hooks || {};
  const merged = {};
  for (const [event, groups] of Object.entries(existing)) {
    const kept = (Array.isArray(groups) ? groups : [])
      .map((group) => ({ ...group, hooks: (group.hooks || []).filter((entry) => !isManaged(entry)) }))
      .filter((group) => group.hooks.length);
    if (kept.length) merged[event] = kept;
  }
  for (const hook of hooks) {
    merged[hook.event] = merged[hook.event] || [];
    merged[hook.event].push({ matcher: hook.matcher, hooks: [{ type: 'command', command: hookCommand(hook.script) }] });
  }
  if (Object.keys(merged).length) result.hooks = merged;
  else delete result.hooks;
  return result;
}

function render(settings) {
  return JSON.stringify(settings, null, 2) + '\n';
}

function assemble(options = {}) {
  const root = options.root || path.dirname(PIPE_ROOT);
  const target = path.join(root, '.claude', 'settings.json');
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  const settings = current ? JSON.parse(current) : {};
  const next = render({ ...mergeHooks(settings, declaredHooks(options.pipeRoot)), ...declaredSettings(options.pipeRoot) });
  const changed = next !== current;
  if (options.check) return { target, changed, written: false };
  if (changed) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const temp = target + '.tmp-' + process.pid;
    fs.writeFileSync(temp, next, 'utf8');
    fs.renameSync(temp, target);
  }
  return { target, changed, written: changed };
}

function main() {
  const options = parseArgs(process.argv);
  const result = assemble(options);
  if (options.check && result.changed) {
    process.stderr.write('Managed hooks in ' + result.target + ' are stale; run assemble-hooks.cjs.\n');
    process.exitCode = 1;
    return;
  }
  process.stdout.write((result.written ? 'Wrote ' : 'Unchanged ') + result.target + '\n');
}

if (require.main === module) {
  try { main(); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}

module.exports = { assemble, declaredHooks, declaredSettings, hookCommand, mergeHooks, parseArgs, ruleHooks, ruleSettings };
