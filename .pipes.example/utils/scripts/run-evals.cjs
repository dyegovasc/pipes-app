#!/usr/bin/env node
// Behavioral evals for this repository's agent configuration (.pipes, generated entrypoints,
// skills, agents, hooks). Each case runs one real agent task in a disposable copy of the
// workspace and then applies deterministic checks to the result. The agent CLI is an adapter,
// so other agent tools can be added without changing cases or checks.
//
// Usage: node .pipes/utils/scripts/run-evals.cjs [--case <id>]... [--scope starter|project|all]
//        [--changed] [--rerun-failed] [--milestone] [--adapter claude] [--dry-run]
//        [--budget <usd per case>] [--model <model>] [--keep]
// Tiers: --changed for every agent-configuration change, --scope starter once per
// step before its commit, all cases with --milestone at milestones. Models come from the Evals table
// in .pipes/ai-instructions/delivery.md unless --model is given. That table also makes eval results required
// at gate G6; without it they are recommended.
// Case options: `workspace: "starter"` runs the case in a fresh starter install with only
// its setup files beside it; `max_budget_usd` overrides --budget for that case; `milestone_only` keeps
// the case out of every run except --milestone and an explicit --case (so --rerun-failed after a milestone
// run needs --milestone again). A case never sees its own file, and an agent under test cannot start a
// nested paid eval run: the runner sets PIPES_EVAL_RUN, and only --dry-run works while it is set.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { loadProfile } = require('./delivery-profile.cjs');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const WORKSPACE_ROOT = path.dirname(PIPE_ROOT);
const CASES_DIR = path.join(__dirname, 'fixtures', 'evals');
const RESULTS_DIR = path.join(PIPE_ROOT, 'utils', 'state', 'evals');
// starter: generic framework behavior, part of a starter kit; project: this project's content.
const SCOPES = ['starter', 'project'];
const USAGE_LIMIT = /hit your .*limit|usage limit|rate limit/i;

function parseArgs(argv) {
  const options = { cases: [], adapter: 'claude', dryRun: false, budget: 1, model: null, keep: false, scope: 'all', changed: false, rerunFailed: false, milestone: false };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--case') { options.cases.push(argv[index + 1]); index += 1; }
    else if (arg === '--adapter') { options.adapter = argv[index + 1]; index += 1; }
    else if (arg === '--budget') { options.budget = Number(argv[index + 1]); index += 1; }
    else if (arg === '--model') { options.model = argv[index + 1]; index += 1; }
    else if (arg === '--scope') { options.scope = argv[index + 1]; index += 1; }
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--changed') options.changed = true;
    else if (arg === '--rerun-failed') options.rerunFailed = true;
    else if (arg === '--milestone') options.milestone = true;
    else if (arg === '--keep') options.keep = true;
    else throw new Error('Unknown argument: ' + arg);
  }
  if (!Number.isFinite(options.budget) || options.budget <= 0) throw new Error('--budget must be a positive number of USD.');
  if (!['all', ...SCOPES].includes(options.scope)) throw new Error('--scope must be all, starter, or project.');
  return options;
}

function loadCases(dir = CASES_DIR) {
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const value = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
      for (const field of ['id', 'prompt', 'checks']) {
        if (!value[field]) throw new Error(name + ' is missing ' + field);
      }
      if (value.id + '.json' !== name) throw new Error(name + ' must be named after its id');
      if (!SCOPES.includes(value.scope)) throw new Error(name + ' needs scope: starter or project');
      if (!Array.isArray(value.covers) || !value.covers.length) throw new Error(name + ' needs covers: the globs of the files it exercises');
      if (value.workspace !== undefined && !['copy', 'starter'].includes(value.workspace)) throw new Error(name + ' workspace must be copy or starter');
      if (value.max_budget_usd !== undefined && !(Number(value.max_budget_usd) > 0)) throw new Error(name + ' max_budget_usd must be a positive number');
      return { may_change: [], setup: {}, ...value };
    });
}

// ---------- case selection ----------

// A change to one of these touches every agent session, so --changed runs the whole starter scope,
// together with every case whose covers match another changed file.
const BROAD_PATHS = ['.pipes/ai-instructions/core.md', 'CLAUDE.md', 'AGENTS.md', '.github/copilot-instructions.md', '.claude/settings.json'];
// Changes here are not agent configuration (records, runtime state, tests, and fixtures) and select nothing.
const NOT_CONFIG = [/^\.pipes\/project\//, /^\.pipes\/utils\/state\//, /\.test\.cjs$/, /^\.pipes\/utils\/scripts\/fixtures\//, /^\.pipes\/framework-fork\.json$/, /^\.pipes\/utils\/fragments\/CATALOG\.md$/, /^\.pipes\/utils\/mapping\//];
const AGENT_CONFIG = [/^\.pipes\//, /^CLAUDE\.md$/, /^AGENTS\.md$/, /^\.github\/copilot-instructions\.md$/, /^\.claude\//, /^\.agents\//];

function selectChanged(cases, files) {
  const config = files.filter((file) => AGENT_CONFIG.some((pattern) => pattern.test(file)) && !NOT_CONFIG.some((pattern) => pattern.test(file)));
  const broad = config.filter((file) => BROAD_PATHS.includes(file));
  const covering = (item) => item.covers.some((glob) => config.some((file) => globToRegExp(glob).test(file)));
  if (broad.length) return { selected: cases.filter((item) => item.scope === 'starter' || covering(item)), broad, uncovered: [] };
  const selected = cases.filter(covering);
  const uncovered = config.filter((file) => !cases.some((item) => item.covers.some((glob) => globToRegExp(glob).test(file))));
  return { selected, broad, uncovered };
}

function workingTreeChanges(root = WORKSPACE_ROOT) {
  const tracked = git(root, ['diff', '--name-only', 'HEAD']).split('\n').filter(Boolean);
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
  return [...new Set([...tracked, ...untracked])];
}

function lastRunFailures(dir = RESULTS_DIR) {
  if (!fs.existsSync(dir)) throw new Error('No earlier eval run to rerun.');
  const last = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().pop();
  if (!last) throw new Error('No earlier eval run to rerun.');
  return (JSON.parse(fs.readFileSync(path.join(dir, last), 'utf8')).results || []).filter((item) => !item.passed || item.invalid).map((item) => item.id);
}

function evalModel(options, profile = loadProfile()) {
  if (options.model) return options.model;
  return (options.milestone ? profile.evals?.milestoneModel : profile.evals?.routineModel) || null;
}

// ---------- disposable workspace ----------

function git(cwd, args) {
  const result = spawnSync('git', ['-c', 'user.name=pipes-evals', '-c', 'user.email=evals@localhost', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + result.stderr);
  return result.stdout;
}

// A fresh install: the framework layer with placeholder project instructions and generated surfaces.
function createStarterWorkspace(root) {
  const { installStarter } = require('./verify-starter.cjs');
  const failed = [];
  installStarter(root, { dirName: '.pipes', step: (name, result) => { if (!result.ok) failed.push(name + ': ' + result.output.slice(0, 500)); return result.ok; } });
  if (failed.length) throw new Error('starter workspace setup failed: ' + failed.join('; '));
}

function createWorkspace(evalCase, source = WORKSPACE_ROOT) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-eval-' + evalCase.id + '-'));
  if (evalCase.workspace === 'starter') createStarterWorkspace(root);
  const files = evalCase.workspace === 'starter' ? [] : git(source, ['ls-files', '-co', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  for (const rel of files) {
    const from = path.join(source, rel);
    if (!fs.existsSync(from) || !fs.statSync(from).isFile()) continue;
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.copyFileSync(from, path.join(root, rel));
  }
  for (const rel of evalCase.copy_paths || []) {
    const from = path.join(source, rel);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(root, rel), { recursive: true });
  }
  // The agent under test must not read its own checks.
  const pipesDir = evalCase.workspace === 'starter' ? '.pipes' : path.relative(WORKSPACE_ROOT, PIPE_ROOT);
  fs.rmSync(path.join(root, pipesDir, path.relative(PIPE_ROOT, CASES_DIR), evalCase.id + '.json'), { force: true });
  // Remove files the case must not see, such as earlier records of the same task in the working tree.
  for (const rel of evalCase.remove_paths || []) fs.rmSync(path.join(root, rel), { recursive: true, force: true });
  for (const [rel, content] of Object.entries(evalCase.setup || {})) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content, 'utf8');
  }
  git(root, ['init', '-q', '-b', 'feature/eval']);
  git(root, ['add', '-A']);
  // Copied service paths are git-ignored here; force-track them so checks see agent changes to them.
  for (const rel of evalCase.copy_paths || []) if (fs.existsSync(path.join(root, rel))) git(root, ['add', '-f', '--', rel]);
  git(root, ['commit', '-q', '-m', 'eval baseline']);
  return root;
}

// ---------- adapters ----------

const ADAPTERS = {
  claude: {
    command(evalCase, options) {
      const args = [
        '-p', evalCase.prompt,
        '--output-format', 'stream-json', '--verbose',
        '--permission-mode', 'acceptEdits',
        '--setting-sources', 'project',
        '--no-session-persistence',
        '--max-budget-usd', String(evalCase.max_budget_usd ?? options.budget),
        '--allowedTools', ...(evalCase.allowed_tools || DEFAULT_ALLOWED_TOOLS), ...(evalCase.extra_allowed_tools || []),
      ];
      if (options.model) args.push('--model', options.model);
      return { bin: 'claude', args };
    },
    parse(stdout) {
      const trace = { toolUses: [], toolResults: [], result: '', cost: null, error: false };
      for (const line of String(stdout).split('\n')) {
        if (!line.trim()) continue;
        let event;
        try { event = JSON.parse(line); } catch { continue; }
        const content = event.message?.content;
        if (Array.isArray(content)) {
          for (const item of content) {
            if (item.type === 'tool_use') trace.toolUses.push({ name: item.name, input: item.input || {} });
            if (item.type === 'tool_result') {
              const text = Array.isArray(item.content) ? item.content.map((part) => part.text || '').join('\n') : String(item.content || '');
              trace.toolResults.push({ text, isError: Boolean(item.is_error) });
            }
          }
        }
        if (event.type === 'result') {
          trace.result = String(event.result || '');
          trace.cost = event.total_cost_usd ?? null;
          trace.error = Boolean(event.is_error);
        }
      }
      return trace;
    },
  },
};

const DEFAULT_ALLOWED_TOOLS = [
  'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill', 'Agent',
  'Bash(node:*)', 'Bash(ls:*)', 'Bash(cat:*)', 'Bash(cd:*)', 'Bash(grep:*)', 'Bash(head:*)', 'Bash(tail:*)', 'Bash(find:*)', 'Bash(wc:*)', 'Bash(echo:*)',
  'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)', 'Bash(git add:*)', 'Bash(git commit:*)', 'Bash(git push:*)',
];

// ---------- checks ----------

function globToRegExp(glob) {
  let pattern = '';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === '*' && glob[index + 1] === '*') { pattern += '.*'; index += 1; if (glob[index + 1] === '/') index += 1; }
    else if (char === '*') pattern += '[^/]*';
    else if (char === '?') pattern += '[^/]';
    else pattern += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + pattern + '$');
}

function changedFiles(root) {
  return git(root, ['status', '--porcelain', '-uall'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).split(' -> ').pop());
}

function filesMatching(root, glob) {
  const regex = globToRegExp(glob);
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (regex.test(path.relative(root, full).split(path.sep).join('/'))) found.push(full);
    }
  };
  walk(root);
  return found;
}

function frontmatterValue(content, field) {
  const block = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  return block.match(new RegExp('^' + field + ':\\s*(.*)$', 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
}

function validatorFindings(root) {
  const result = spawnSync(process.execPath, [path.join(root, '.pipes/utils/scripts/validate-project-records.cjs')], { cwd: root, encoding: 'utf8' });
  return String(result.stdout).split('\n').filter((line) => line.startsWith('['));
}

function toolText(use) {
  return use.name + ' ' + JSON.stringify(use.input);
}

const CHECKS = {
  file_exists: (check, ctx) => filesMatching(ctx.root, check.glob).length > 0,
  file_absent: (check, ctx) => filesMatching(ctx.root, check.glob).length === 0,
  file_matches: (check, ctx) => {
    const files = filesMatching(ctx.root, check.glob);
    return files.length > 0 && files.every((file) => new RegExp(check.pattern, check.flags || 'm').test(fs.readFileSync(file, 'utf8')));
  },
  file_not_matches: (check, ctx) => filesMatching(ctx.root, check.glob)
    .every((file) => !new RegExp(check.pattern, check.flags || 'm').test(fs.readFileSync(file, 'utf8'))),
  frontmatter: (check, ctx) => {
    const files = filesMatching(ctx.root, check.glob);
    return files.length > 0 && files.every((file) => {
      const value = frontmatterValue(fs.readFileSync(file, 'utf8'), check.field);
      return check.equals !== undefined ? value === check.equals : value !== check.not_equals;
    });
  },
  unchanged: (check, ctx) => !ctx.changed.some((file) => globToRegExp(check.glob).test(file)),
  only_changed: (check, ctx) => ctx.changed.every((file) => ctx.mayChange.some((glob) => globToRegExp(glob).test(file))),
  // Only findings the agent introduced count; problems already in the copied working tree are baseline warnings.
  // The file may change only in its frontmatter (for example reciprocal related links); its body must stay as committed.
  body_unchanged: (check, ctx) => filesMatching(ctx.root, check.glob).every((file) => {
    const rel = path.relative(ctx.root, file).split(path.sep).join('/');
    const body = (text) => String(text).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    let committed;
    try { committed = git(ctx.root, ['show', 'HEAD:' + rel]); } catch { return true; }
    return body(committed) === body(fs.readFileSync(file, 'utf8'));
  }),
  validator_clean: (check, ctx) => !validatorFindings(ctx.root).some((line) => /^\[(error|blocked)\]/.test(line) && !(ctx.baselineFindings || []).includes(line)),
  // Runs one Pipes script of the workspace, by file name only, and passes on exit status 0.
  script_passes: (check, ctx) => {
    if (!/^[a-z0-9-]+\.cjs$/.test(check.script || '')) throw new Error('script must be a file name under .pipes/utils/scripts');
    if (check.args !== undefined && !Array.isArray(check.args)) throw new Error('args must be an array');
    const result = spawnSync(process.execPath, [path.join(ctx.root, '.pipes/utils/scripts', check.script), ...(check.args || [])], { cwd: ctx.root, encoding: 'utf8', timeout: 120000 });
    return result.status === 0;
  },
  // Counts the files of a glob, optionally only those whose content matches pattern, against min and max.
  file_count: (check, ctx) => {
    const count = filesMatching(ctx.root, check.glob).filter((file) => !check.pattern || new RegExp(check.pattern, check.flags || 'm').test(fs.readFileSync(file, 'utf8'))).length;
    return count >= (check.min ?? 1) && count <= (check.max ?? Infinity);
  },
  validator_has: (check, ctx) => validatorFindings(ctx.root).some((line) => line.includes(' ' + check.code + ' ')),
  tool_called: (check, ctx) => ctx.trace.toolUses.some((use) => new RegExp(check.pattern).test(toolText(use))),
  tool_not_called: (check, ctx) => !ctx.trace.toolUses.some((use) => new RegExp(check.pattern).test(toolText(use))),
  tool_result_matches: (check, ctx) => ctx.trace.toolResults.some((item) => new RegExp(check.pattern, 'i').test(item.text)),
  result_matches: (check, ctx) => new RegExp(check.pattern, 'i').test(ctx.trace.result),
  any: (check, ctx) => check.checks.some((inner) => runCheck(inner, ctx).passed),
};

function runCheck(check, ctx) {
  const fn = CHECKS[check.type];
  if (!fn) return { type: check.type, passed: false, detail: 'unknown check type' };
  try { return { type: check.type, passed: Boolean(fn(check, ctx)), detail: check.why || '' }; }
  catch (error) { return { type: check.type, passed: false, detail: error.message }; }
}

function evaluate(evalCase, root, trace, baselineFindings = []) {
  const ctx = { root, trace, changed: changedFiles(root), mayChange: evalCase.may_change || [], baselineFindings };
  const checks = evalCase.checks.map((check) => runCheck(check, ctx));
  const evidence = {
    toolUses: trace.toolUses.map((use) => (use.name + ' ' + JSON.stringify(use.input)).slice(0, 200)),
    deniedOrFailed: trace.toolResults.filter((item) => item.isError).map((item) => item.text.slice(0, 300)),
    result: String(trace.result || '').slice(0, 1500),
  };
  const baselineErrors = baselineFindings.filter((line) => /^\[(error|blocked)\]/.test(line));
  // Keep the actual diff of every file changed outside may_change, so an out-of-scope edit can be judged.
  const outOfScope = ctx.changed
    .filter((file) => !ctx.mayChange.some((glob) => globToRegExp(glob).test(file)))
    .map((file) => ({ file, diff: git(root, ['diff', '--no-color', '--', file]).slice(0, 2000) }));
  // A run that stopped on a usage limit or produced no agent activity is not a behavior result.
  const invalid = USAGE_LIMIT.test(String(trace.result || '')) || (!trace.toolUses.length && !String(trace.result || '').trim());
  return { id: evalCase.id, invalid, passed: !invalid && checks.every((check) => check.passed), checks, changed: ctx.changed, cost: trace.cost, baselineErrors, outOfScope, evidence };
}

// ---------- runner ----------

function runCase(evalCase, options) {
  const adapter = ADAPTERS[options.adapter];
  if (!adapter) throw new Error('Unknown adapter: ' + options.adapter);
  const { bin, args } = adapter.command(evalCase, options);
  if (options.dryRun) return { id: evalCase.id, dryRun: true, command: [bin, ...args.map((arg) => (arg.includes(' ') ? JSON.stringify(arg) : arg))].join(' ') };
  const root = createWorkspace(evalCase);
  try {
    const baselineFindings = validatorFindings(root);
    const run = spawnSync(bin, args, { cwd: root, env: { ...process.env, PIPES_EVAL_RUN: '1' }, encoding: 'utf8', timeout: (evalCase.timeout_seconds || 600) * 1000, maxBuffer: 64 * 1024 * 1024 });
    const trace = adapter.parse(run.stdout);
    if (run.error) trace.result += '\n[runner] ' + run.error.message;
    return { ...evaluate(evalCase, root, trace, baselineFindings), workspace: options.keep ? root : undefined };
  } finally {
    if (!options.keep) fs.rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  const options = parseArgs(process.argv);
  if (process.env.PIPES_EVAL_RUN && !options.dryRun) throw new Error('Refusing to start eval runs from inside an eval run (PIPES_EVAL_RUN is set); use --dry-run to list the cases.');
  let cases = loadCases().filter((item) => options.scope === 'all' || item.scope === options.scope);
  if (options.changed) {
    const { selected, broad, uncovered } = selectChanged(cases, workingTreeChanges());
    if (broad.length) console.log('Broad change (' + broad.join(', ') + '): running the starter scope.');
    for (const file of uncovered) console.log('! no eval case covers ' + file + '; add covers or run --scope starter if it affects agent behavior');
    cases = selected;
    if (!cases.length) { console.log('No eval case covers the changed agent configuration; the script tests are the check.'); return; }
  }
  if (options.rerunFailed) {
    const ids = new Set(lastRunFailures());
    cases = cases.filter((item) => ids.has(item.id));
    if (!cases.length) { console.log('The last run has no failed or invalid cases.'); return; }
  }
  if (!options.milestone && !options.cases.length) {
    for (const item of cases.filter((entry) => entry.milestone_only)) console.log('- skipped ' + item.id + ': milestone only (run with --milestone or --case)');
    cases = cases.filter((item) => !item.milestone_only);
  }
  const profile = loadProfile();
  options.model = evalModel(options, profile);
  console.log('Gate G6 eval results: ' + (profile.evals.required ? 'required (Evals table in delivery.md)' : 'recommended (no Evals table in delivery.md)'));
  console.log('Eval model: ' + (options.model || 'agent default') + (options.milestone ? ' (milestone)' : ' (routine)'));
  if (options.cases.length) {
    const unknown = options.cases.filter((id) => !cases.some((item) => item.id === id));
    if (unknown.length) throw new Error('Unknown case: ' + unknown.join(', '));
    cases = cases.filter((item) => options.cases.includes(item.id));
  }
  const results = [];
  for (const evalCase of cases) {
    const result = runCase(evalCase, options);
    results.push(result);
    if (result.dryRun) { console.log('- ' + result.id + ': ' + result.command); continue; }
    console.log((result.invalid ? 'INVALID ' : result.passed ? 'PASS ' : 'FAIL ') + result.id + (result.cost !== null ? '  ($' + Number(result.cost).toFixed(2) + ')' : ''));
    if (result.invalid) { console.log('     ! no behavior result: the agent run stopped on a usage limit or did nothing; rerun this case'); continue; }
    for (const check of result.checks.filter((item) => !item.passed)) console.log('     ✖ ' + check.type + (check.detail ? ' — ' + check.detail : ''));
    for (const line of result.baselineErrors || []) console.log('     ! baseline (not caused by the agent): ' + line);
  }
  if (options.dryRun) return;
  const passed = results.filter((item) => item.passed).length;
  const invalid = results.filter((item) => item.invalid).length;
  console.log(passed + '/' + results.length + ' eval cases passed' + (invalid ? '; ' + invalid + ' invalid (no behavior result, rerun them)' : ''));
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const file = path.join(RESULTS_DIR, new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(file, JSON.stringify({ adapter: options.adapter, model: options.model || 'default', tier: options.milestone ? 'milestone' : 'routine', results }, null, 2) + '\n', 'utf8');
  console.log('Results: ' + path.relative(WORKSPACE_ROOT, file));
  if (passed !== results.length) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}

module.exports = { SCOPES, createStarterWorkspace, selectChanged, evalModel, lastRunFailures, ADAPTERS, CHECKS, createWorkspace, evaluate, globToRegExp, loadCases, parseArgs, runCheck };
