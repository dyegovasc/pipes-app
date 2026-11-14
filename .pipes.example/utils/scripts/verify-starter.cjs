#!/usr/bin/env node
// Proves in place that the framework layer of this install works as a starter kit (step 6d-2).
// It builds a temporary `.pipes.example/` from this install, resets the project layer to starter
// placeholders (restored from the installed baseline archive) and removes project content, writes a
// temporary provenance baseline, regenerates every surface, and runs the script tests in strict
// starter mode. Nothing outside the temporary directory changes. Read-only for this install.
// Usage: node .pipes/utils/scripts/verify-starter.cjs [--keep] [--version 2.2.0]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');
const { projectReason } = require('./starter-layer.cjs');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const PLACEHOLDERS_FROM_BASELINE = ['ai-instructions/project.md', 'ai-instructions/architecture.md', 'utils/rules/rule-codebase-conventions.md'];
const REMOVED_INSTRUCTIONS = ['ai-instructions/delivery.md', 'ai-instructions/accountability.md'];
const STARTER_CORRECTIONS = '---\ntitle: Corrections\ndescription: Short always-on corrections for mistakes an agent made more than once in this repository.\nversion: 1.0\nassembly: inline\n---\n## Things The Agent Gets Wrong\n\nEach line is a correction for a mistake that happened at least twice, with a link to its evidence. Add a line only through `loop-framework-maintenance` under `rule-capture-pipeline-incidents`, and remove a line when a rule, hook, or check makes it unnecessary.\n\n- None recorded yet.\n';

function parseArgs(argv) {
  const options = { keep: false, version: '2.2.0' };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === '--keep') options.keep = true;
    else if (argv[index] === '--version') { options.version = argv[index + 1]; index += 1; }
    else throw new Error('Unknown argument: ' + argv[index]);
  }
  return options;
}

function run(bin, args, cwd, input) {
  const result = spawnSync(bin, args, { cwd, encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024 });
  return { ok: result.status === 0, output: (result.stdout || '') + (result.stderr || '') };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function baselineFile(rel) {
  const archive = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(PIPE_ROOT, 'framework-baseline.json.gz'))));
  const file = archive.files.find((item) => item.path === rel);
  if (!file) throw new Error('The baseline archive has no ' + rel);
  return file.content;
}

// The 2.1.2 conventions placeholder predates enforced_by; the starter placeholder must declare it.
function starterConventionsPlaceholder() {
  const content = baselineFile('utils/rules/rule-codebase-conventions.md');
  return /^enforced_by:/m.test(content) ? content : content.replace(/^(enforcement: .*)$/m, '$1\nenforced_by: [model, ci]');
}

// The 2.1.2 project placeholder has no always-on budget; the starter ships a default of 200 lines.
const STARTER_ALWAYS_ON_BUDGET = 200;
function starterProjectPlaceholder() {
  const content = baselineFile('ai-instructions/project.md');
  return /^always_on_line_budget:/m.test(content) ? content : content.replace(/^(assembly: .*)$/m, '$1\nalways_on_line_budget: ' + STARTER_ALWAYS_ON_BUDGET);
}

// The files of the install that git tracks or does not ignore. Ignored files, such as editor or
// operating-system files, never reach the starter. Without git, every file is copied.
function installFiles() {
  const repo = path.dirname(PIPE_ROOT);
  const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', path.basename(PIPE_ROOT)], { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (listed.status !== 0) return null;
  const prefix = path.basename(PIPE_ROOT) + '/';
  const files = [...new Set(listed.stdout.split('\0').filter((rel) => rel.startsWith(prefix)).map((rel) => rel.slice(prefix.length)))]
    .filter((rel) => fs.existsSync(path.join(PIPE_ROOT, rel)) && fs.statSync(path.join(PIPE_ROOT, rel)).isFile());
  // An empty list means git does not see the install (for example an ignored .pipes); copy every file instead.
  return files.length ? files : null;
}

function pruneEmptyDirectories(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmptyDirectories(path.join(dir, entry.name));
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

function buildStarter(workspace, dirName = '.pipes.example') {
  const starter = path.join(workspace, dirName);
  const files = installFiles();
  if (files) {
    for (const rel of files) {
      fs.mkdirSync(path.dirname(path.join(starter, rel)), { recursive: true });
      fs.copyFileSync(path.join(PIPE_ROOT, rel), path.join(starter, rel));
    }
  } else fs.cpSync(PIPE_ROOT, starter, { recursive: true });
  const removed = [];
  for (const file of walk(starter)) {
    const rel = path.relative(starter, file).split(path.sep).join('/');
    if (rel.startsWith('project/') && /\/(config|README)\.md$|^project\/README\.md$/.test(rel)) continue;
    if (rel.startsWith('utils/state/') && rel === 'utils/state/related-sync-state.json') continue;
    if (PLACEHOLDERS_FROM_BASELINE.includes(rel) || rel === 'ai-instructions/corrections.md') continue;
    const reason = projectReason(rel, fs.readFileSync(file, 'utf8'));
    if (reason || REMOVED_INSTRUCTIONS.includes(rel)) { fs.rmSync(file); removed.push(rel + ' (' + (reason || 'project instruction') + ')'); }
  }
  fs.writeFileSync(path.join(starter, 'ai-instructions/architecture.md'), baselineFile('ai-instructions/architecture.md'), 'utf8');
  fs.writeFileSync(path.join(starter, 'ai-instructions/project.md'), starterProjectPlaceholder(), 'utf8');
  fs.writeFileSync(path.join(starter, 'utils/rules/rule-codebase-conventions.md'), starterConventionsPlaceholder(), 'utf8');
  fs.writeFileSync(path.join(starter, 'ai-instructions/corrections.md'), STARTER_CORRECTIONS, 'utf8');
  fs.mkdirSync(path.join(starter, 'utils/state'), { recursive: true });
  fs.writeFileSync(path.join(starter, 'utils/state/related-sync-state.json'), '{}\n', 'utf8');
  pruneEmptyDirectories(starter);
  return { starter, removed };
}

// Builds the starter in `workspace/dirName`, regenerates every surface from it into `workspace`,
// and writes a temporary provenance baseline. `step` receives each generator result.
// The eval runner uses it with dirName `.pipes` to give a case a fresh install.
function installStarter(workspace, { dirName = '.pipes.example', version = '2.2.0', step = () => true } = {}) {
  const { starter, removed } = buildStarter(workspace, dirName);
  for (const name of ['README.md', 'utils/rules/rule-framework-provenance.md']) {
    const file = path.join(starter, name);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('2.1.2', version), 'utf8');
  }
  const scripts = path.join(starter, 'utils/scripts');
  for (const [script, args] of [
    ['assemble-instructions.cjs', ['--targets', 'agents,claude,copilot']],
    ['assemble-pipeline-skills.cjs', ['--targets', 'agents,claude']],
    ['assemble-loop-skills.cjs', ['--targets', 'agents,claude']],
    ['assemble-rule-skills.cjs', []],
    ['assemble-agents.cjs', []],
    ['assemble-hooks.cjs', []],
    ['generate-catalog.cjs', []],
    ['generate-source-map.cjs', []],
    ['validate-pure-markdown.cjs', []],
    ['validate-project-records.cjs', []],
    ['delivery-profile.cjs', []],
  ]) step(script, run(process.execPath, [path.join(scripts, script), ...args], workspace));
  // Provenance last, after every generator has written its tracked output.
  step('temporary provenance baseline ' + version, run(process.execPath, [path.join(scripts, 'generate-framework-provenance.cjs'), '--root', starter, '--write', '--allow-baseline-replacement', '--framework-version', version], workspace));
  return { starter, removed };
}

function main() {
  const options = parseArgs(process.argv);
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-verify-starter-'));
  const steps = [];
  const step = (name, result) => { steps.push({ name, ok: result.ok, output: result.output }); console.log((result.ok ? 'ok   ' : 'FAIL ') + name); return result.ok; };
  try {
    const { starter, removed } = installStarter(workspace, { version: options.version, step });
    console.log('Starter built at ' + starter + '; removed ' + removed.length + ' project-layer files.');
    const scripts = path.join(starter, 'utils/scripts');
    run('git', ['init', '-q', '-b', 'main'], workspace);
    run('git', ['-c', 'user.name=verify', '-c', 'user.email=verify@localhost', 'add', '-A'], workspace);
    run('git', ['-c', 'user.name=verify', '-c', 'user.email=verify@localhost', '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'starter'], workspace);
    const tests = fs.readdirSync(scripts).filter((name) => name.endsWith('.test.cjs')).map((name) => path.join(scripts, name));
    const testRun = run(process.execPath, ['--test', ...tests], workspace);
    const summary = (testRun.output.match(/^ℹ (tests|pass|fail) \d+$/gm) || []).join(', ');
    step('script tests in starter mode (' + summary + ')', testRun);
    if (!testRun.ok) {
      const failures = testRun.output.split('\n').filter((line) => /^test at |^✖ [a-z]|AssertionError|Error:/.test(line)).slice(0, 40);
      console.log(failures.join('\n'));
    }
  } finally {
    if (options.keep) console.log('Kept ' + workspace);
    else fs.rmSync(workspace, { recursive: true, force: true });
  }
  const failed = steps.filter((item) => !item.ok);
  console.log(failed.length ? failed.length + ' step(s) failed' : 'Starter verified: all steps passed');
  if (failed.length) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}

module.exports = { STARTER_ALWAYS_ON_BUDGET, buildStarter, installFiles, pruneEmptyDirectories, installStarter, starterConventionsPlaceholder, starterProjectPlaceholder };
