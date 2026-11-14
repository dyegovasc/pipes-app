const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  validateBaselineArchive,
  validateForkControl,
  validateManifest,
} = require('./generate-framework-provenance.cjs');

const ROOT = path.resolve(__dirname, '..', '..');

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

test('framework provenance rule fixes schema-v2 ownership and digest semantics', () => {
  const rule = read('utils/rules/rule-framework-provenance.md');

  for (const expected of [
    '`manifestSchemaVersion: 2`',
    '`projectLayoutVersion: 3`',
    '`projectLayoutVersion: 2`',
    '`baselineArchiveSchemaVersion: 1`',
    '`forkControlSchemaVersion: 1`',
    '`pipes-framework-baseline-v1`',
    '`pipes-framework-fork-v1`',
    'unsigned 64-bit big-endian',
    'deterministic gzip with no variable timestamp',
    '`gzip-json-v1`',
    '`origin`',
    '`adopted`',
    '`unresolved`',
  ]) assert.match(rule, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  for (const root of [
    'ai-instructions/',
    'team/',
    'utils/fragments/',
    'utils/pipelines/',
    'utils/rules/',
    'utils/scripts/',
  ]) assert.match(rule, new RegExp('`' + root.replace('/', '\\/') + '`'));

  for (const excluded of [
    'project/',
    'utils/configs/',
    'utils/state/',
    'manifest.json',
    'framework-baseline.json.gz',
    'framework-fork.json',
  ]) assert.match(rule, new RegExp(excluded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  assert.match(rule, /project file path, content, size, and hash remain opaque/);
  assert.match(rule, /Customized file contents never appear in fork control/);
  assert.match(rule, /Every change to tracked baseline bytes or the immediate project-area inventory requires a different valid framework SemVer/);
  assert.match(rule, /Changes limited to opaque or ignored content do not require a framework-version increment/);
  assert.match(rule, /Every CLI invocation requires `--root` and exactly one of `--check`, `--bootstrap`, `--write`, or `--refresh-fork`/);
  assert.match(rule, /exported runner enforces the same root, mode, version, and write-authority rules/);
});

test('framework guidance preserves Markdown ownership and installed provenance', () => {
  const core = ['ai-instructions/core.md', 'ai-instructions/core-workflows.md'].filter((rel) => fs.existsSync(path.join(ROOT, rel))).map(read).join('\n');
  const readme = read('README.md');
  const integrity = read('utils/rules/rule-starter-kit-integrity.md');

  for (const content of [core, readme, integrity]) assert.match(content, /rule-framework-provenance/);
  assert.match(core, /must not select mission actions, own mission state, schedule work, infer workspace history, overwrite installed provenance without authority/);
  assert.match(readme, /current baseline is framework version `[^`]+`/);
  assert.match(readme, /installed manifest and baseline archive are immutable provenance/);
  assert.match(readme, /generate-framework-provenance\.cjs --root \.pipes --check/);
  assert.match(readme, /generate-framework-provenance\.cjs --root \.pipes --refresh-fork/);
  assert.match(integrity, /Preserve existing installed manifests, baseline archives, and their provenance relation/);
});

test('staged consumer architecture remains a placeholder', () => {
  if (path.basename(ROOT) !== '.pipes.example') return;
  const architecture = read('ai-instructions/architecture.md');
  assert.match(architecture, /Map each major component, module, or service/);
  assert.doesNotMatch(architecture, /framework-baseline\.json\.gz/);
});

test('staged release provenance is a fresh schema-v2 origin baseline', () => {
  if (path.basename(ROOT) !== '.pipes.example') return;
  const manifest = validateManifest(JSON.parse(read('manifest.json')));
  const archive = fs.readFileSync(path.join(ROOT, 'framework-baseline.json.gz'));
  const control = validateForkControl(JSON.parse(read('framework-fork.json')), manifest);
  const recovered = validateBaselineArchive(manifest, archive);

  assert.equal(manifest.manifestSchemaVersion, 2);
  assert.ok([2, 3].includes(manifest.projectLayoutVersion), 'layout ' + manifest.projectLayoutVersion);
  const versionReference = 'framework version `' + manifest.frameworkVersion + '`';
  assert.ok(read('utils/rules/rule-framework-provenance.md').includes(versionReference));
  assert.ok(read('README.md').includes(versionReference));
  assert.equal(recovered.frameworkVersion, manifest.frameworkVersion);
  assert.equal(control.frameworkVersion, manifest.frameworkVersion);
  assert.equal(control.baselineRelation, 'origin');
  assert.equal(control.summary.unchanged, manifest.files.length);
  assert.equal(control.summary.created, 0);
  assert.equal(control.summary.modified, 0);
  assert.equal(control.summary.deleted, 0);

  const result = spawnSync(
    process.execPath,
    [path.join(ROOT, 'utils/scripts/generate-framework-provenance.cjs'), '--root', ROOT, '--check', '--json'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.frameworkVersion, manifest.frameworkVersion);
  assert.equal(summary.baselineRelation, 'origin');
  assert.deepEqual(summary.changedPaths, []);

  const sourceMap = read('utils/mapping/source-to-target-map.md');
  for (const relative of ['manifest.json', 'framework-baseline.json.gz', 'framework-fork.json']) {
    assert.match(sourceMap, new RegExp('`\\.pipes/' + relative.replace(/\./g, '\\.') + '`'));
  }
  assert.doesNotMatch(sourceMap, /\.pipes\.example\//);
});

test('the manifest validator reads project layouts 2 and 3 and rejects every other layout', () => {
  const { validateManifest: validate } = require('./generate-framework-provenance.cjs');
  const manifest = JSON.parse(read('manifest.json'));
  for (const layout of [2, 3]) {
    assert.doesNotThrow(() => validate({ ...manifest, projectLayoutVersion: layout }), 'layout ' + layout);
  }
  for (const layout of [1, 4, undefined]) {
    assert.throws(() => validate({ ...manifest, projectLayoutVersion: layout }), /projectLayoutVersion/, 'layout ' + layout);
  }
});
