const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  BASELINE_DOMAIN,
  buildBaselineArchive,
  buildForkControl,
  buildManifest,
  canonicalJson,
  inventoryDigest,
  parseArguments,
  run,
  scanFramework,
  sha256,
  validateBaselineArchive,
  validateForkControl,
  validateManifest,
} = require('./generate-framework-provenance.cjs');
const SCRIPT = path.join(__dirname, 'generate-framework-provenance.cjs');

async function temporaryRoot(context) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'pipes-provenance-'));
  context.after(() => fsp.rm(root, { recursive: true, force: true }));
  await fsp.mkdir(path.join(root, 'ai-instructions'), { recursive: true });
  await fsp.mkdir(path.join(root, 'project', '00-notes'), { recursive: true });
  await fsp.mkdir(path.join(root, 'utils', 'issues'), { recursive: true });
  await fsp.writeFile(path.join(root, 'README.md'), '# Starter\n');
  await fsp.writeFile(path.join(root, 'ai-instructions', 'core.md'), 'core\n');
  await fsp.writeFile(path.join(root, 'utils', 'issues', 'README.md'), 'issues\n');
  await fsp.writeFile(path.join(root, 'utils', 'issues', '.gitkeep'), '');
  return root;
}

async function bytes(root) {
  const result = {};
  for (const name of ['manifest.json', 'framework-baseline.json.gz', 'framework-fork.json']) {
    const content = await fsp.readFile(path.join(root, name));
    result[name] = { content, sha256: sha256(content) };
  }
  return result;
}

function options(root, mode, extra = {}) {
  return {
    root,
    mode,
    frameworkVersion: null,
    allowBaselineInitialization: false,
    allowBaselineReplacement: false,
    json: false,
    ...extra,
  };
}

test('digest fixture and deterministic archive match the schema-v1 contract', async () => {
  const fixture = JSON.parse(await fsp.readFile(path.join(__dirname, 'fixtures/framework-provenance/digest-contract-v1.json'), 'utf8'));
  const forward = inventoryDigest(fixture.domain, fixture.files, fixture.projectAreas);
  const reverse = inventoryDigest(fixture.domain, [...fixture.files].reverse(), [...fixture.projectAreas].reverse());
  assert.equal(fixture.domain, BASELINE_DOMAIN);
  assert.equal(forward, fixture.digest);
  assert.equal(reverse, fixture.digest);

  const inventory = {
    files: [{ path: 'README.md', encoding: 'utf-8', size: 2, sha256: fixture.files[1].sha256, content: 'x\n' }],
    projectAreas: ['00-notes'],
  };
  const first = buildBaselineArchive('2.0.0', inventory);
  const second = buildBaselineArchive('2.0.0', inventory);
  assert.deepEqual(first.compressed, second.compressed);
  assert.equal(first.compressed[4], 0);
  assert.equal(first.compressed[5], 0);
  assert.equal(first.compressed[6], 0);
  assert.equal(first.compressed[7], 0);
});

test('manifest archive and fork control validate and recover exact content', async (context) => {
  const root = await temporaryRoot(context);
  const inventory = await scanFramework(root);
  const archive = buildBaselineArchive('2.0.0', inventory);
  const manifest = buildManifest('2.0.0', inventory, archive);
  const control = buildForkControl(manifest, inventory, 'origin');
  assert.equal(validateManifest(manifest), manifest);
  const recovered = validateBaselineArchive(manifest, archive.compressed);
  assert.equal(recovered.files.find((file) => file.path === 'README.md').content, '# Starter\n');
  assert.equal(validateForkControl(control, manifest), control);
  assert.equal(control.summary.unchanged, manifest.files.length);
  assert.equal(canonicalJson(control).includes('# Starter'), false);

  const tampered = Buffer.from(archive.compressed);
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => validateBaselineArchive(manifest, tampered), /compressed hash or size is invalid/);
});

test('scanner admits owned files and areas while excluding project and incidental content', async (context) => {
  const root = await temporaryRoot(context);
  await fsp.mkdir(path.join(root, 'project', '00-notes', 'nested'), { recursive: true });
  await fsp.writeFile(path.join(root, 'project', '00-notes', 'private.md'), 'secret\n');
  await fsp.writeFile(path.join(root, '.DS_Store'), 'incidental\n');
  await fsp.writeFile(path.join(root, 'utils', 'issues', 'incident-001.md'), 'private\n');
  const inventory = await scanFramework(root);
  assert.deepEqual(inventory.projectAreas, ['00-notes']);
  assert.deepEqual(inventory.files.map((file) => file.path), [
    'README.md',
    'ai-instructions/core.md',
    'utils/issues/.gitkeep',
    'utils/issues/README.md',
  ]);
  assert.equal(canonicalJson(inventory).includes('private.md'), false);
  assert.equal(canonicalJson(inventory).includes('secret'), false);
});

test('scanner rejects symlinks and invalid UTF-8 tracked content', async (context) => {
  const root = await temporaryRoot(context);
  await fsp.symlink(path.join(root, 'README.md'), path.join(root, 'ai-instructions', 'linked.md'));
  await assert.rejects(scanFramework(root), /does not allow symlinks/);
  await fsp.rm(path.join(root, 'ai-instructions', 'linked.md'));
  await fsp.writeFile(path.join(root, 'ai-instructions', 'invalid.md'), Buffer.from([0xc3, 0x28]));
  await assert.rejects(scanFramework(root), /not valid UTF-8/);
});

test('CLI parsing requires one root mode and exact write authority', () => {
  assert.throws(() => parseArguments([]), /--root is required/);
  assert.throws(() => parseArguments(['--root', '.', '--check', '--write']), /exactly one mode/);
  assert.throws(() => parseArguments(['--root', '.', '--bootstrap', '--framework-version', '2.0.0']), /allow-baseline-initialization/);
  assert.throws(() => parseArguments(['--root', '.', '--write', '--framework-version', '2.0.1']), /allow-baseline-replacement/);
  assert.throws(() => parseArguments(['--root', '.', '--refresh-fork', '--framework-version', '2.0.1']), /does not accept/);
  assert.throws(() => parseArguments(['--root', '.', '--bootstrap', '--allow-baseline-initialization', '--framework-version', 'v2']), /Invalid framework semantic version/);
  assert.equal(parseArguments(['--root', '.', '--check']).mode, 'check');
});

test('bootstrap writes complete origin metadata and check is read-only', async (context) => {
  const root = await temporaryRoot(context);
  await assert.rejects(run(options(root, 'bootstrap', { frameworkVersion: '2.0.0' })), /explicit baseline initialization authority/);
  const result = await run(options(root, 'bootstrap', { frameworkVersion: '2.0.0', allowBaselineInitialization: true }));
  assert.deepEqual(result.changedPaths, ['framework-baseline.json.gz', 'manifest.json', 'framework-fork.json']);
  assert.equal(result.control.baselineRelation, 'origin');
  const before = await bytes(root);
  const checked = await run(options(root, 'check'));
  assert.deepEqual(checked.changedPaths, []);
  const after = await bytes(root);
  for (const name of Object.keys(before)) assert.deepEqual(after[name].content, before[name].content);
  await assert.rejects(run(options(root, 'bootstrap', { frameworkVersion: '2.0.0', allowBaselineInitialization: true })), /requires manifest, baseline archive, and fork control to be absent/);
});

test('write rejects a changed baseline without a version change and preserves immutable bytes', async (context) => {
  const root = await temporaryRoot(context);
  await run(options(root, 'bootstrap', { frameworkVersion: '2.0.0', allowBaselineInitialization: true }));
  await fsp.writeFile(path.join(root, 'README.md'), '# Changed\n');
  const before = await bytes(root);
  await assert.rejects(run(options(root, 'write', { frameworkVersion: '2.0.1' })), /explicit baseline replacement authority/);
  await assert.rejects(run(options(root, 'write', { frameworkVersion: '2.0.0', allowBaselineReplacement: true })), /provide a different framework version/);
  const rejected = await bytes(root);
  assert.deepEqual(rejected['manifest.json'].content, before['manifest.json'].content);
  assert.deepEqual(rejected['framework-baseline.json.gz'].content, before['framework-baseline.json.gz'].content);

  const written = await run(options(root, 'write', { frameworkVersion: '2.0.1', allowBaselineReplacement: true }));
  assert.equal(written.manifest.frameworkVersion, '2.0.1');
  assert.deepEqual(written.changedPaths, ['framework-baseline.json.gz', 'manifest.json', 'framework-fork.json']);
  const repeated = await run(options(root, 'write', { frameworkVersion: '2.0.1', allowBaselineReplacement: true }));
  assert.deepEqual(repeated.changedPaths, []);
  await run(options(root, 'check'));
});

test('refresh-fork preserves relation and cannot change immutable provenance', async (context) => {
  const root = await temporaryRoot(context);
  await run(options(root, 'bootstrap', { frameworkVersion: '2.0.0', allowBaselineInitialization: true }));
  const controlPath = path.join(root, 'framework-fork.json');
  const adopted = JSON.parse(await fsp.readFile(controlPath, 'utf8'));
  adopted.baselineRelation = 'adopted';
  await fsp.writeFile(controlPath, canonicalJson(adopted));
  await fsp.writeFile(path.join(root, 'README.md'), '# Fork\n');
  await fsp.writeFile(path.join(root, 'project', '00-notes', 'private.md'), 'secret\n');
  const before = await bytes(root);
  const refreshed = await run(options(root, 'refresh-fork'));
  const after = await bytes(root);
  assert.deepEqual(refreshed.changedPaths, ['framework-fork.json']);
  assert.equal(refreshed.control.baselineRelation, 'adopted');
  assert.deepEqual(after['manifest.json'].content, before['manifest.json'].content);
  assert.deepEqual(after['framework-baseline.json.gz'].content, before['framework-baseline.json.gz'].content);
  assert.equal(after['framework-fork.json'].content.includes(Buffer.from('private.md')), false);
  assert.equal(after['framework-fork.json'].content.includes(Buffer.from('secret')), false);
  const repeated = await run(options(root, 'refresh-fork'));
  assert.deepEqual(repeated.changedPaths, []);
});

test('invalid immutable provenance is preserved on refresh failure', async (context) => {
  const root = await temporaryRoot(context);
  await run(options(root, 'bootstrap', { frameworkVersion: '2.0.0', allowBaselineInitialization: true }));
  const archivePath = path.join(root, 'framework-baseline.json.gz');
  const manifestPath = path.join(root, 'manifest.json');
  await fsp.writeFile(archivePath, Buffer.from('invalid'));
  const archiveBefore = await fsp.readFile(archivePath);
  const manifestBefore = await fsp.readFile(manifestPath);
  await assert.rejects(run(options(root, 'refresh-fork')), /compressed hash or size is invalid/);
  assert.deepEqual(await fsp.readFile(archivePath), archiveBefore);
  assert.deepEqual(await fsp.readFile(manifestPath), manifestBefore);
});

test('CLI process runs every mode with structured safe effects', async (context) => {
  const root = await temporaryRoot(context);
  function cli(args, expectedStatus = 0) {
    const result = spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], { encoding: 'utf8' });
    assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
    return result;
  }

  const bootstrapped = JSON.parse(cli(['--bootstrap', '--allow-baseline-initialization', '--framework-version', '2.0.0', '--json']).stdout);
  assert.deepEqual(bootstrapped.changedPaths, ['framework-baseline.json.gz', 'manifest.json', 'framework-fork.json']);
  assert.equal(JSON.parse(cli(['--check', '--json']).stdout).changedPaths.length, 0);
  await fsp.writeFile(path.join(root, 'README.md'), '# CLI Fork\n');
  assert.deepEqual(JSON.parse(cli(['--refresh-fork', '--json']).stdout).changedPaths, ['framework-fork.json']);
  assert.match(cli(['--write', '--allow-baseline-replacement', '--framework-version', '2.0.0'], 1).stderr, /provide a different framework version/);
  assert.equal(JSON.parse(cli(['--write', '--allow-baseline-replacement', '--framework-version', '2.0.1', '--json']).stdout).frameworkVersion, '2.0.1');
  assert.equal(JSON.parse(cli(['--check', '--json']).stdout).changedPaths.length, 0);
});
