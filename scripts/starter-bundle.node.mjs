import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';
import { canonicalJson, run as runMetadata } from './generate-pipes-framework-metadata.mjs';
import {
  MAX_BUNDLE_BYTES,
  buildStarterBundle,
  bundleContentEquals,
  compareWithStarterTree,
  listStarterFiles,
  sha256,
  verifyStarterBundle,
} from './lib/starter-bundle.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function git(cwd, args) {
  const result = spawnSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@localhost', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=', ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

async function fixtureRepository(context) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'pipes-starter-bundle-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const starter = path.join(root, '.pipes.example');
  mkdirSync(path.join(starter, 'ai-instructions'), { recursive: true });
  mkdirSync(path.join(starter, 'project', '00-notes'), { recursive: true });
  writeFileSync(path.join(starter, 'README.md'), '# Starter\n');
  writeFileSync(path.join(starter, 'ai-instructions', 'core.md'), 'core\n');
  // A BOM file sits in the opaque project layer, which the baseline archive does not track.
  writeFileSync(path.join(starter, 'project', '00-notes', 'README.md'), '\ufeffnotes with a BOM\n');
  writeFileSync(path.join(starter, 'project', '00-notes', 'image.bin'), Buffer.from([0xff, 0xfe, 0x00, 0x80]));
  await runMetadata({ mode: 'bootstrap-starter', frameworkVersion: '1.0.1', root, starterOnly: true, initializeInstalledOrigin: false, initializeInstalledAdopted: false });
  writeFileSync(path.join(root, '.gitignore'), '.DS_Store\n*.log\n');
  writeFileSync(path.join(starter, '.DS_Store'), 'ignored');
  writeFileSync(path.join(starter, 'debug.log'), 'ignored');
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['add', '.gitignore', '.pipes.example/README.md']);
  git(root, ['commit', '-q', '-m', 'partial']);
  return root;
}

function repack(compressed, mutate) {
  const bundle = JSON.parse(gunzipSync(compressed).toString('utf8'));
  mutate(bundle);
  return gzipSync(Buffer.from(canonicalJson(bundle), 'utf8'), { level: 9 });
}

test('the file set includes uncommitted files, excludes ignored files, and is sorted by UTF-8 bytes', async (context) => {
  const root = await fixtureRepository(context);
  const files = listStarterFiles(root);
  assert.ok(files.includes('README.md'));
  assert.ok(files.includes('ai-instructions/core.md'));
  assert.ok(files.includes('manifest.json'));
  assert.ok(!files.includes('.DS_Store'));
  assert.ok(!files.includes('debug.log'));
  assert.deepEqual(files, [...files].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b))));
});

test('a build is deterministic and chooses utf8 or base64 per file', async (context) => {
  const root = await fixtureRepository(context);
  const first = buildStarterBundle({ root, version: '1.0.1' });
  const second = buildStarterBundle({ root, version: '1.0.1' });
  assert.deepEqual(first.compressed, second.compressed);
  const byPath = new Map(first.bundle.files.map((file) => [file.path, file]));
  assert.equal(byPath.get('project/00-notes/README.md').encoding, 'utf8');
  assert.equal(byPath.get('project/00-notes/README.md').content, '\ufeffnotes with a BOM\n');
  assert.equal(byPath.get('project/00-notes/image.bin').encoding, 'base64');
  assert.equal(byPath.get('framework-baseline.json.gz').encoding, 'base64');
  const verified = verifyStarterBundle(first.compressed, { version: '1.0.1', size: first.compressed.length, sha256: sha256(first.compressed) });
  assert.deepEqual(compareWithStarterTree(verified, root), []);
  assert.deepEqual(verified.files.get('project/00-notes/image.bin'), Buffer.from([0xff, 0xfe, 0x00, 0x80]));
});

test('a version that differs from the manifest is refused', async (context) => {
  const root = await fixtureRepository(context);
  assert.throws(() => buildStarterBundle({ root, version: '1.0.2' }), /does not match/);
});

test('verification rejects wrong size, hash, version, and manifest hash', async (context) => {
  const root = await fixtureRepository(context);
  const { compressed } = buildStarterBundle({ root, version: '1.0.1' });
  assert.throws(() => verifyStarterBundle(compressed, { size: compressed.length + 1 }), /size/);
  assert.throws(() => verifyStarterBundle(compressed, { sha256: '0'.repeat(64) }), /sha256 does not match/);
  assert.throws(() => verifyStarterBundle(compressed, { version: '1.0.2' }), /does not equal/);
  assert.throws(() => verifyStarterBundle(compressed, { manifestSha256: '0'.repeat(64) }), /manifest sha256/);
});

test('verification rejects malformed content', async (context) => {
  const root = await fixtureRepository(context);
  const { compressed } = buildStarterBundle({ root, version: '1.0.1' });
  const cases = [
    [(b) => b.files.reverse(), /unique and sorted/],
    [(b) => { b.files[0].path = '../escape'; }, /unsafe path/],
    [(b) => { b.files[0].path = '/absolute'; }, /unsafe path/],
    [(b) => { b.files = b.files.filter((f) => f.path !== 'manifest.json'); }, /missing required file: manifest.json/],
    [(b) => { b.files.find((f) => f.encoding === 'utf8').content += 'x'; }, /content hash mismatch/],
    [(b) => { b.files[0].mode = 'x'; }, /file keys/],
    [(b) => { b.extra = true; }, /top-level keys/],
    [(b) => { b.starterSchemaVersion = 2; }, /starterSchemaVersion/],
    [(b) => { b.files.find((f) => f.encoding === 'base64').content += '='; }, /not canonical|content hash/],
  ];
  for (const [mutate, pattern] of cases) assert.throws(() => verifyStarterBundle(repack(compressed, mutate)), pattern);
});

test('verification rejects oversized bundles and decompression bombs', () => {
  assert.throws(() => verifyStarterBundle(Buffer.alloc(MAX_BUNDLE_BYTES + 1)), /exceeds/);
  const bomb = gzipSync(Buffer.alloc(65 * 1024 * 1024));
  assert.throws(() => verifyStarterBundle(bomb), /gzip is invalid or too large/);
  assert.throws(() => verifyStarterBundle(Buffer.from('not gzip')), /gzip is invalid/);
});

test('content comparison ignores the zlib compression level', async (context) => {
  const root = await fixtureRepository(context);
  const { compressed, json } = buildStarterBundle({ root, version: '1.0.1' });
  const other = gzipSync(json, { level: 1 });
  assert.notDeepEqual(other, compressed);
  assert.ok(bundleContentEquals(compressed, other));
  assert.ok(!bundleContentEquals(compressed, repack(compressed, (b) => { b.frameworkVersion = '1.0.2'; })));
});

test('the 2.2.1 bundle of this repository keeps the published manifest and archive bytes', () => {
  const { compressed } = buildStarterBundle({ root: REPO_ROOT, version: '2.2.1' });
  const verified = verifyStarterBundle(compressed, { version: '2.2.1', manifestSha256: '47b6323c6e73b74e5deffc7961c05ba0ccba58180cfec77d7817f2eb2f0378a7' });
  assert.equal(sha256(verified.files.get('framework-baseline.json.gz')), '63d1c7cbb9e1139879610707295f3296188852122c7df9ee0604cbb427466793');
  assert.equal(verified.files.size, 270);
  assert.deepEqual(compareWithStarterTree(verified, REPO_ROOT), []);
});

function regzip(text) {
  return gzipSync(Buffer.from(text, 'utf8'), { level: 9 });
}

test('verification rejects trailing gzip data and non-canonical or duplicate-key JSON', async (context) => {
  const root = await fixtureRepository(context);
  const { compressed, json } = buildStarterBundle({ root, version: '1.0.1' });
  assert.throws(() => verifyStarterBundle(Buffer.concat([compressed, gzipSync(Buffer.from('x'))])), /trailing data|JSON is invalid/);
  assert.throws(() => verifyStarterBundle(Buffer.concat([compressed, Buffer.from('junk')])), /trailing data|gzip is invalid/);
  assert.throws(() => verifyStarterBundle(regzip(JSON.stringify(JSON.parse(json.toString('utf8'))))), /not canonical/);
  const duplicate = json.toString('utf8').replace('"starterSchemaVersion": 1,', '"starterSchemaVersion": 1,\n  "starterSchemaVersion": 1,');
  assert.throws(() => verifyStarterBundle(regzip(duplicate)), /not canonical/);
});

test('verification rejects case and Unicode-normalization collisions and lone surrogates', async (context) => {
  const root = await fixtureRepository(context);
  const { compressed } = buildStarterBundle({ root, version: '1.0.1' });
  const fileEntry = (filePath, content) => ({ path: filePath, encoding: 'utf8', sha256: sha256(Buffer.from(content, 'utf8')), content });
  const insert = (bundle, entries) => {
    bundle.files.push(...entries);
    bundle.files.sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
  };
  assert.throws(() => verifyStarterBundle(repack(compressed, (b) => insert(b, [fileEntry('zz/README.md', 'a'), fileEntry('zz/readme.md', 'b')]))), /collides/);
  assert.throws(() => verifyStarterBundle(repack(compressed, (b) => insert(b, [fileEntry('zz/caf\u00e9.md', 'a'), fileEntry('zz/cafe\u0301.md', 'b')]))), /collides/);
  assert.throws(() => verifyStarterBundle(repack(compressed, (b) => insert(b, [fileEntry('zz/lone.md', 'x\ud800')]))), /well-formed/);
});

test('a symlinked starter file is refused', async (context) => {
  const root = await fixtureRepository(context);
  symlinkSync('README.md', path.join(root, '.pipes.example', 'linked.md'));
  assert.throws(() => listStarterFiles(root), /not a regular file/);
});
