#!/usr/bin/env node
// PreToolUse hook for Bash. Enforces rule-commit-guardrails deterministically:
// asks before commits, pushes, PR creation and comments, releases, and promotions; denies
// direct pushes to protected branches, force-pushes, merges, self-approvals, dispatches to
// `ticket` environments without a matching change ticket, and direct infrastructure changes.
// Project facts (protected branches, environments, ticket pattern, release workflows) come from
// the optional Markdown delivery profile `.pipes/ai-instructions/delivery.md`; without it, every
// release or promotion asks the holder of gate G5, who is the user unless the optional
// `.pipes/ai-instructions/accountability.md` names another holder.
// Read-only: it inspects the command and, at most, reads the current git branch and the two files.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { environmentRule, loadProfile } = require('./delivery-profile.cjs');

const DEFAULT_G5_HOLDER = 'you, the G5 holder';

// The holder of gate G5 from an accountability matrix: the last cell of the table row whose first
// cell starts with `G5`. A missing row, an empty cell, a `{...}` placeholder, or the session user
// resolves to the default holder.
function g5HolderFrom(markdown) {
  for (const line of String(markdown || '').split(/\r?\n/)) {
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
    if (!/^\|/.test(line.trim()) || !/^G5\b/.test(cells[0] || '')) continue;
    const holder = cells[cells.length - 1].replace(/^`(.*)`$/, '$1').trim();
    if (!holder || holder.includes('{') || /session user/i.test(holder)) return DEFAULT_G5_HOLDER;
    return holder;
  }
  return DEFAULT_G5_HOLDER;
}

function loadG5Holder(pipeRoot = path.resolve(__dirname, '..', '..')) {
  try {
    const file = path.join(pipeRoot, 'ai-instructions', 'accountability.md');
    return fs.existsSync(file) ? g5HolderFrom(fs.readFileSync(file, 'utf8')) : DEFAULT_G5_HOLDER;
  } catch {
    return DEFAULT_G5_HOLDER;
  }
}

const RANK = { none: 0, ask: 1, deny: 2 };

// A heredoc body is data passed to a command's standard input, not shell commands. Remove each body
// (from the line after `<<WORD`, `<<'WORD'`, `<<"WORD"`, or `<<-WORD` up to the line holding only WORD)
// so text inside it, such as a script or a comment, is never read as a protected command.
function stripHeredocs(command) {
  const lines = String(command).split('\n');
  const kept = [];
  let terminator = null;
  let allowTabs = false;
  for (const line of lines) {
    if (terminator !== null) {
      if ((allowTabs ? line.replace(/^\t+/, '') : line) === terminator) terminator = null;
      continue;
    }
    kept.push(line);
    const match = line.match(/<<(-?)\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\2/);
    if (match) { terminator = match[3]; allowTabs = match[1] === '-'; }
  }
  return kept.join('\n');
}

function splitSegments(rawCommand) {
  const command = stripHeredocs(rawCommand);
  const segments = [];
  let current = '';
  let quote = null;
  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];
    if (quote) {
      if (char === '\\' && quote === '"' && index + 1 < command.length) { current += char + command[index + 1]; index += 1; continue; }
      if (char === quote) quote = null;
      current += char;
      continue;
    }
    if (char === '"' || char === "'") { quote = char; current += char; continue; }
    if (char === '\\' && index + 1 < command.length) { current += char + command[index + 1]; index += 1; continue; }
    const two = command.slice(index, index + 2);
    if (two === '&&' || two === '||') { segments.push(current); current = ''; index += 1; continue; }
    if (char === ';' || char === '|' || char === '\n' || char === '&') { segments.push(current); current = ''; continue; }
    if (char === '(' || char === ')' || char === '`') { segments.push(current); current = ''; continue; }
    if (two === '$(') { segments.push(current); current = ''; index += 1; continue; }
    current += char;
  }
  segments.push(current);
  return segments.map((segment) => segment.trim()).filter(Boolean);
}

function tokenize(segment) {
  const tokens = [];
  let current = '';
  let quote = null;
  let started = false;
  for (let index = 0; index < segment.length; index += 1) {
    const char = segment[index];
    if (quote) {
      if (char === quote) { quote = null; continue; }
      if (char === '\\' && quote === '"' && index + 1 < segment.length) { current += segment[index + 1]; index += 1; continue; }
      current += char;
      continue;
    }
    if (char === '"' || char === "'") { quote = char; started = true; continue; }
    if (char === '\\' && index + 1 < segment.length) { current += segment[index + 1]; index += 1; started = true; continue; }
    if (/\s/.test(char)) {
      if (started) { tokens.push(current); current = ''; started = false; }
      continue;
    }
    current += char;
    started = true;
  }
  if (started) tokens.push(current);
  return tokens;
}

function stripPrefixes(tokens) {
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) { index += 1; continue; }
    if (['sudo', 'command', 'exec', 'nohup', 'time', 'builtin'].includes(token)) { index += 1; continue; }
    if (token === 'env') {
      index += 1;
      while (index < tokens.length && (tokens[index].startsWith('-') || /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[index]))) index += 1;
      continue;
    }
    break;
  }
  return tokens.slice(index);
}

function program(token) {
  return path.basename(token || '');
}

function gitSubcommand(args) {
  let index = 0;
  let cwd = null;
  while (index < args.length && args[index].startsWith('-')) {
    const option = args[index];
    if (option === '-C') { cwd = args[index + 1]; index += 2; continue; }
    if (['-c', '--git-dir', '--work-tree', '--namespace'].includes(option)) { index += 2; continue; }
    index += 1;
  }
  return { name: args[index], rest: args.slice(index + 1), cwd };
}

function refspecTargets(rest) {
  const positional = rest.filter((arg) => !arg.startsWith('-'));
  return positional.slice(1).map((spec) => {
    const destination = spec.includes(':') ? spec.split(':').pop() : spec;
    return destination.replace(/^\+/, '').replace(/^refs\/heads\//, '');
  });
}

function decideGit(args, context) {
  const { name, rest, cwd } = gitSubcommand(args);
  const directory = cwd ? path.resolve(context.cwd, cwd) : context.cwd;
  if (name === 'commit') return { decision: 'ask', reason: 'Commits need your approval (rule-commit-guardrails).' };
  if (name !== 'push') return { decision: 'none' };
  const forced = rest.some((arg) => arg === '-f' || arg.startsWith('--force') || arg === '--mirror' || arg === '--delete' || arg === '-d')
    || rest.filter((arg) => !arg.startsWith('-')).slice(1).some((spec) => spec.startsWith('+') || spec.startsWith(':'));
  if (forced) return { decision: 'deny', reason: 'Force-push, mirror, and remote branch deletion are not allowed (rule-commit-guardrails).' };
  if (rest.includes('--all')) return { decision: 'deny', reason: 'Pushing all branches can update shared branches; push one feature branch instead.' };
  let targets = refspecTargets(rest);
  if (!targets.length) {
    const branch = context.currentBranch(directory);
    if (!branch) return { decision: 'ask', reason: 'Could not determine the branch being pushed; confirm the push.' };
    targets = [branch];
  }
  const protectedBranches = new Set(context.profile.protectedBranches);
  const shared = targets.filter((target) => protectedBranches.has(target) || target === 'HEAD' && protectedBranches.has(context.currentBranch(directory)));
  if (shared.length) return { decision: 'deny', reason: 'Direct pushes to ' + shared.join(', ') + ' are not allowed; open a pull request for code-owner review (gate G4).' };
  return { decision: 'ask', reason: 'Pushes need your approval (rule-commit-guardrails).' };
}

function workflowEnvironment(args) {
  for (let index = 0; index < args.length; index += 1) {
    if (['-f', '-F', '--field', '--raw-field'].includes(args[index])) {
      const match = String(args[index + 1] || '').match(/^environment=(.+)$/);
      if (match) return match[1];
    }
    const inline = args[index].match(/^--(?:raw-)?field=environment=(.+)$/);
    if (inline) return inline[1];
  }
  return undefined;
}

function decideGh(args, raw, context) {
  const [group, action, ...rest] = args;
  if (group === 'pr' && action === 'merge') return { decision: 'deny', reason: 'Merging belongs to the code owner through branch protection (gate G4).' };
  if (group === 'pr' && action === 'review' && rest.some((arg) => arg === '--approve' || arg === '-a')) {
    return { decision: 'deny', reason: 'Agents never approve pull requests (rule-separation-of-duties).' };
  }
  if (group === 'pr' && action === 'create') return { decision: 'ask', reason: 'Opening a pull request publishes work; confirm it (rule-commit-guardrails).' };
  if (group === 'pr' && action === 'review' && rest.some((arg) => ['--comment', '-c', '--request-changes', '-r'].includes(arg))) {
    return { decision: 'ask', reason: 'Posting a review publishes it to the pull request; confirm it (rule-commit-guardrails).' };
  }
  if ((group === 'pr' || group === 'issue') && action === 'comment') return { decision: 'ask', reason: 'Posting a comment publishes it; confirm it (rule-commit-guardrails).' };
  if (group === 'release' && action === 'create') return { decision: 'ask', reason: 'Creating a release needs the confirmation of ' + context.g5Holder + ' (gate G5).' };
  if (group === 'workflow' && action === 'run') {
    const workflow = path.basename(rest.find((arg) => !arg.startsWith('-')) || '');
    const { profile } = context;
    const isRelease = profile.releaseWorkflows.length ? profile.releaseWorkflows.includes(workflow) : /release|promote|deploy/i.test(workflow);
    if (!isRelease) return { decision: 'ask', reason: 'Dispatching a workflow is an external effect; confirm it.' };
    const environment = workflowEnvironment(rest);
    // Without an environment, a profile that uses tickets treats the dispatch as a ticket release.
    const usesTickets = profile.environments.some((candidate) => candidate.autonomy === 'ticket');
    const rule = environment || !usesTickets ? environmentRule(profile, environment || '*') : { autonomy: 'ticket' };
    if (rule.autonomy !== 'ticket') {
      return { decision: 'ask', reason: 'Release or promotion to ' + (environment || 'an unspecified environment') + ' needs the confirmation of ' + context.g5Holder + ' (gate G5).' };
    }
    const ticket = profile.changeTicket.pattern;
    const ticketName = ticket ? ticket.source.replace(/\\b/g, '').replace(/\\d\+/g, '') + ' ' : '';
    const approver = profile.changeTicket.approver ? 'the ' + profile.changeTicket.approver.toLowerCase() : context.g5Holder;
    if (ticket && ticket.test(raw)) {
      return { decision: 'ask', reason: 'Release or promotion to ' + (environment || 'an unspecified environment') + ' with a change ticket; ' + approver + ' must confirm (gate G5).' };
    }
    return { decision: 'deny', reason: 'Release or promotion to ' + (environment || 'an unspecified environment') + ' needs an approved ' + ticketName + 'change ticket and ' + approver + ' (gate G5).' };
  }
  return { decision: 'none' };
}

const INFRA = {
  terraform: new Set(['apply', 'destroy', 'import', 'taint', 'untaint']),
  kubectl: new Set(['apply', 'create', 'delete', 'scale', 'patch', 'edit', 'replace', 'rollout', 'drain', 'cordon', 'uncordon', 'set', 'label', 'annotate']),
  flux: new Set(['reconcile', 'suspend', 'resume', 'delete', 'create']),
  helm: new Set(['install', 'upgrade', 'uninstall', 'rollback', 'delete']),
};

function decideInfra(tool, args) {
  const subcommands = args.filter((arg) => !arg.startsWith('-'));
  if (tool === 'terraform' && args.some((arg) => arg === 'state') && args.some((arg) => ['rm', 'mv', 'push'].includes(arg))) {
    return { decision: 'deny', reason: 'Terraform state changes are not allowed from an agent session.' };
  }
  if (subcommands.some((arg) => INFRA[tool].has(arg))) {
    return { decision: 'deny', reason: 'Infrastructure changes go through pull requests to GitOps sources, not direct ' + tool + ' commands (rule-commit-guardrails).' };
  }
  return { decision: 'none' };
}

function decideSegment(segment, context, depth) {
  const tokens = stripPrefixes(tokenize(segment));
  if (!tokens.length) return { decision: 'none' };
  const tool = program(tokens[0]);
  const args = tokens.slice(1);
  if (tool === 'cd' && args[0]) { context.cwd = path.resolve(context.cwd, args[0]); return { decision: 'none' }; }
  if (['bash', 'sh', 'zsh'].includes(tool)) {
    const flagIndex = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/.test(arg));
    if (flagIndex >= 0 && args[flagIndex + 1] !== undefined && depth < 3) return decideCommand(args[flagIndex + 1], context, depth + 1);
    return { decision: 'none' };
  }
  if (tool === 'eval' && depth < 3) return decideCommand(args.join(' '), context, depth + 1);
  if (tool === 'git') return decideGit(args, context);
  if (tool === 'gh') return decideGh(args, segment, context);
  if (INFRA[tool]) return decideInfra(tool, args);
  return { decision: 'none' };
}

function decideCommand(command, context, depth = 0) {
  let result = { decision: 'none' };
  for (const segment of splitSegments(String(command || ''))) {
    const next = decideSegment(segment, context, depth);
    if (RANK[next.decision] > RANK[result.decision]) result = next;
  }
  return result;
}

function gitBranch(directory) {
  const result = spawnSync('git', ['-C', directory, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', timeout: 2000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

function decide(input, options = {}) {
  if (!input || input.tool_name !== 'Bash') return { decision: 'none' };
  const context = {
    cwd: input.cwd || process.cwd(),
    currentBranch: options.currentBranch || gitBranch,
    profile: options.profile || loadProfile(),
    g5Holder: options.g5Holder || loadG5Holder(),
  };
  return decideCommand(input.tool_input?.command, context);
}

function hookOutput(result) {
  if (result.decision === 'none') return '';
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: result.decision,
      permissionDecisionReason: result.reason,
    },
  });
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw || '{}'); }
    catch {
      process.stdout.write(hookOutput({ decision: 'ask', reason: 'Protected-action hook could not read its input; confirm the command.' }));
      return;
    }
    process.stdout.write(hookOutput(decide(input)));
  });
}

if (require.main === module) main();

module.exports = { DEFAULT_G5_HOLDER, decide, decideCommand, g5HolderFrom, hookOutput, splitSegments, tokenize };
