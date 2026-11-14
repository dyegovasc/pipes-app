import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import {
  buildForkControl,
  buildBaselineArchive,
  buildManifest,
  canonicalJson,
  inventoryDigest,
  run,
  scanFramework,
  validateBaselineArchive,
  validateManifest,
} from './generate-pipes-framework-metadata.mjs';

async function temporaryRepository() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pipes-framework-metadata-'));
  await mkdir(path.join(root, '.pipes.example', 'ai-instructions'), { recursive: true });
  await mkdir(path.join(root, '.pipes.example', 'project', '00-notes'), { recursive: true });
  await mkdir(path.join(root, '.pipes'), { recursive: true });
  await writeFile(path.join(root, '.pipes.example', 'README.md'), '# Starter\n');
  await writeFile(path.join(root, '.pipes.example', 'ai-instructions', 'core.md'), 'core\n');
  return root;
}

test('manifest baseline content is recoverable and digest validation is deterministic', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const inventory = await scanFramework(path.join(root, '.pipes.example'));
  const archive = buildBaselineArchive('1.0.1', inventory);
  const manifest = buildManifest('1.0.1', inventory, archive);

  assert.equal(validateManifest(manifest), manifest);
  assert.equal(validateBaselineArchive(manifest, archive.compressed).files[0].content, '# Starter\n');
  assert.equal(manifest.files.length, 2);
  assert.equal('content' in manifest.files[0], false);
  assert.deepEqual(archive.compressed, buildBaselineArchive('1.0.1', inventory).compressed);
  assert.equal(canonicalJson(manifest), canonicalJson(buildManifest('1.0.1', inventory, archive)));
  const tampered = Buffer.from(archive.compressed);
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => validateBaselineArchive(manifest, tampered), /compressed hash or size is invalid/);
});

test('manifest schema 2 binds project layout 2 while legacy schema stays readable', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const inventory = await scanFramework(path.join(root, '.pipes.example'), '2.0.1');
  const manifest = buildManifest('2.0.1', inventory);
  assert.equal(manifest.manifestSchemaVersion, 2);
  assert.equal(manifest.projectLayoutVersion, 2);
  assert.equal(validateManifest(manifest), manifest);

  const missing = { ...manifest };
  delete missing.projectLayoutVersion;
  assert.throws(() => validateManifest(missing), /projectLayoutVersion/);

  const legacy = buildManifest('1.0.1', inventory);
  assert.equal(legacy.manifestSchemaVersion, 1);
  assert.equal('projectLayoutVersion' in legacy, false);
  assert.equal(validateManifest(legacy), legacy);
});

test('framework 2.2.0 and later write project layout 3 and the validator reads layouts 2 and 3 only', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const inventory = await scanFramework(path.join(root, '.pipes.example'), '2.2.0');
  const manifest = buildManifest('2.2.0', inventory);
  assert.equal(manifest.manifestSchemaVersion, 2);
  assert.equal(manifest.projectLayoutVersion, 3);
  assert.equal(validateManifest(manifest), manifest);
  assert.equal(buildManifest('2.1.3', inventory).projectLayoutVersion, 2);
  assert.equal(buildManifest('2.10.0', inventory).projectLayoutVersion, 3);
  assert.throws(() => validateManifest({ ...manifest, projectLayoutVersion: 4 }), /projectLayoutVersion/);
  assert.throws(() => validateManifest({ ...manifest, projectLayoutVersion: 1 }), /projectLayoutVersion/);
});

test('fork control excludes project files and records only immediate area names', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const starter = path.join(root, '.pipes.example');
  const installed = path.join(root, '.pipes');
  const manifest = buildManifest('1.0.1', await scanFramework(starter));
  await mkdir(path.join(installed, 'ai-instructions'), { recursive: true });
  await mkdir(path.join(installed, 'project', '00-ideas', 'nested'), { recursive: true });
  await writeFile(path.join(installed, 'README.md'), '# Customized\n');
  await writeFile(path.join(installed, 'ai-instructions', 'core.md'), 'core\n');
  await writeFile(path.join(installed, 'project', '00-ideas', 'private.md'), 'private\n');
  const inventory = await scanFramework(installed);
  const control = buildForkControl(manifest, inventory, 'adopted');

  assert.deepEqual(control.projectAreaChanges, { created: ['00-ideas'], deleted: ['00-notes'] });
  assert.deepEqual(control.modified.map((entry) => entry.path), ['README.md']);
  assert.equal(canonicalJson(control).includes('private.md'), false);
  assert.equal(canonicalJson(control).includes('private\n'), false);
});

test('digest contract uses stable path and project-area ordering', async () => {
  const fixture = JSON.parse(
    await readFile(new URL('./fixtures/pipes-framework-metadata/digest-contract-v1.json', import.meta.url), 'utf8'),
  );
  const forward = inventoryDigest(fixture.domain, fixture.files, fixture.projectAreas);
  const reverse = inventoryDigest(fixture.domain, [...fixture.files].reverse(), [...fixture.projectAreas].reverse());
  assert.equal(forward, reverse);
  assert.equal(forward, fixture.digest);
});

test('scanner rejects framework symlinks', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const starter = path.join(root, '.pipes.example');
  await symlink(path.join(starter, 'README.md'), path.join(starter, 'ai-instructions', 'linked.md'));

  await assert.rejects(scanFramework(starter), /does not allow symlinks/);
});

test('bootstrap initializes origin metadata and check detects tracked changes', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  await run({
    mode: 'bootstrap-starter',
    frameworkVersion: '1.0.1',
    initializeInstalledOrigin: true,
    initializeInstalledAdopted: false,
    root,
  });
  const starterManifest = await readFile(path.join(root, '.pipes.example', 'manifest.json'), 'utf8');
  const installedManifest = await readFile(path.join(root, '.pipes', 'manifest.json'), 'utf8');
  const starterArchive = await readFile(path.join(root, '.pipes.example', 'framework-baseline.json.gz'));
  const installedArchive = await readFile(path.join(root, '.pipes', 'framework-baseline.json.gz'));
  assert.equal(installedManifest, starterManifest);
  assert.deepEqual(installedArchive, starterArchive);
  const installedControl = JSON.parse(await readFile(path.join(root, '.pipes', 'framework-fork.json'), 'utf8'));
  assert.equal(installedControl.baselineRelation, 'origin');

  await run({
    mode: 'check',
    frameworkVersion: null,
    initializeInstalledOrigin: false,
    initializeInstalledAdopted: false,
    root,
  });
  await writeFile(path.join(root, '.pipes.example', 'ai-instructions', 'core.md'), 'changed\n');
  await assert.rejects(
    run({
      mode: 'check',
      frameworkVersion: null,
      initializeInstalledOrigin: false,
      initializeInstalledAdopted: false,
      root,
    }),
    /baseline changes require a framework-version bump/,
  );
});

test('an archive compressed by another zlib build passes check and survives writes when its content matches', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  const options = { frameworkVersion: '1.0.1', initializeInstalledOrigin: true, initializeInstalledAdopted: false, root };
  await run({ ...options, mode: 'bootstrap-starter' });
  const starter = path.join(root, '.pipes.example');
  const original = await readFile(path.join(starter, 'framework-baseline.json.gz'));
  // Same baseline content, different compressed bytes: what another machine's zlib can produce.
  const other = gzipSync(gunzipSync(original), { level: 1, mtime: 0 });
  assert.notDeepEqual(other, original);
  const manifest = JSON.parse(await readFile(path.join(starter, 'manifest.json'), 'utf8'));
  manifest.baselineArchive.size = other.length;
  manifest.baselineArchive.sha256 = createHash('sha256').update(other).digest('hex');
  await writeFile(path.join(starter, 'framework-baseline.json.gz'), other);
  await writeFile(path.join(starter, 'manifest.json'), canonicalJson(manifest));

  const checkOptions = { ...options, frameworkVersion: null, initializeInstalledOrigin: false };
  await run({ ...checkOptions, mode: 'check' });
  await run({ ...checkOptions, mode: 'write' });
  assert.deepEqual(await readFile(path.join(starter, 'framework-baseline.json.gz')), other);
  assert.equal(await readFile(path.join(starter, 'manifest.json'), 'utf8'), canonicalJson(manifest));

  await writeFile(path.join(starter, 'ai-instructions', 'core.md'), 'changed\n');
  await assert.rejects(run({ ...checkOptions, mode: 'check' }), /baseline changes require a framework-version bump/);
});

test('normal writes preserve an existing installed manifest', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  await run({
    mode: 'bootstrap-starter',
    frameworkVersion: '1.0.1',
    initializeInstalledOrigin: true,
    initializeInstalledAdopted: false,
    root,
  });
  const installedManifestPath = path.join(root, '.pipes', 'manifest.json');
  const before = await readFile(installedManifestPath, 'utf8');
  await writeFile(path.join(root, '.pipes', 'README.md'), '# Fork\n');
  await run({
    mode: 'write',
    frameworkVersion: null,
    initializeInstalledOrigin: false,
    initializeInstalledAdopted: false,
    root,
  });
  assert.equal(await readFile(installedManifestPath, 'utf8'), before);
});

test('starter-only check passes without an installed .pipes, and the default check still requires it', async (context) => {
  const root = await temporaryRepository();
  context.after(() => rm(root, { recursive: true, force: true }));
  await rm(path.join(root, '.pipes'), { recursive: true, force: true });
  const options = { frameworkVersion: '2.2.1', initializeInstalledOrigin: false, initializeInstalledAdopted: false, root };
  await run({ ...options, mode: 'bootstrap-starter', starterOnly: true });
  await assert.rejects(access(path.join(root, '.pipes', 'manifest.json')));
  const checkOptions = { ...options, frameworkVersion: null };
  await run({ ...checkOptions, mode: 'check', starterOnly: true });
  await assert.rejects(run({ ...checkOptions, mode: 'check' }), /Installed manifest is missing/);
  await writeFile(path.join(root, '.pipes.example', 'ai-instructions', 'core.md'), 'changed\n');
  await assert.rejects(run({ ...checkOptions, mode: 'check', starterOnly: true }), /baseline changes require a framework-version bump/);
});
