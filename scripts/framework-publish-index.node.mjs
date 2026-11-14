import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import { canonicalJson, run as runMetadata } from './generate-pipes-framework-metadata.mjs';
import { parseArgs, publishIndex, replacePair } from './framework-publish-index.mjs';
import { INDEX_PATH, SIGNATURE_PATH } from './lib/framework-index.mjs';
import { createTestSigner, parsePublicKey, verifySignature } from './lib/minisign.mjs';
import { buildStarterBundle, bundleFileName, sha256 } from './lib/starter-bundle.mjs';

const VERSION = '2.2.1';

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

async function fixture(context) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'pipes-publish-index-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const starter = path.join(root, '.pipes.example');
  mkdirSync(path.join(starter, 'ai-instructions'), { recursive: true });
  mkdirSync(path.join(starter, 'project', '00-notes'), { recursive: true });
  writeFileSync(path.join(starter, 'project', '00-notes', 'README.md'), 'notes\n');
  writeFileSync(path.join(starter, 'README.md'), '# Starter\n');
  writeFileSync(path.join(starter, 'ai-instructions', 'core.md'), 'core\n');
  await runMetadata({ mode: 'bootstrap-starter', frameworkVersion: VERSION, root, starterOnly: true, initializeInstalledOrigin: false, initializeInstalledAdopted: false });
  mkdirSync(path.join(root, 'frameworks'));
  writeFileSync(path.join(root, 'frameworks', 'compatibility.json'), `${JSON.stringify({ compatibilitySchemaVersion: 1, versions: { [VERSION]: { minAppVersion: '0.7.3' } } }, null, 2)}\n`);
  git(root, ['init', '-q', '-b', 'main']);
  // Isolate the test repository from the user's git identity, signing, and hooks.
  git(root, ['config', 'user.name', 'test']);
  git(root, ['config', 'user.email', 'test@localhost']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  git(root, ['config', 'core.hooksPath', '']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'framework source']);
  git(root, ['tag', `pipes-framework-v${VERSION}`]);
  const { compressed } = buildStarterBundle({ root, version: VERSION });
  const bundleFile = path.join(root, '..', `${path.basename(root)}-${bundleFileName(VERSION)}`);
  writeFileSync(bundleFile, compressed);
  context.after(() => rmSync(bundleFile, { force: true }));
  return { root, compressed, bundleFile };
}

function release(bytes) {
  return {
    published_at: '2026-11-14T15:00:00Z',
    assets: [{ name: bundleFileName(VERSION), size: bytes.length, digest: `sha256:${sha256(bytes)}` }],
  };
}

function options({ root, compressed, bundleFile }, signer, overrides = {}) {
  return {
    root,
    version: VERSION,
    bundleFile,
    publicKeyTexts: [signer.publicKeyText],
    signer,
    fetchRelease: async () => release(compressed),
    fetchBundle: async () => assert.fail('the bundle file is used'),
    now: () => new Date('2026-11-14T16:00:00Z'),
    ...overrides,
  };
}

const later = (iso) => () => new Date(iso);

test('end to end: the index is signed, verifies, and the commit holds exactly the two index files', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  const result = await publishIndex(options(env, signer, { commit: true }));
  assert.equal(result.written, true);
  const message = readFileSync(path.join(env.root, INDEX_PATH));
  const verified = verifySignature({ message, signatureText: readFileSync(path.join(env.root, SIGNATURE_PATH), 'utf8'), publicKeys: [parsePublicKey(signer.publicKeyText)] });
  assert.equal(verified.trustedComment, 'pipes-framework-index v1 generatedAt=2026-11-14T16:00:00Z');
  const index = JSON.parse(message.toString('utf8'));
  assert.equal(message.toString('utf8'), canonicalJson(index));
  assert.deepEqual(index.versions.map((entry) => [entry.frameworkVersion, entry.minAppVersion, entry.releasedAt, entry.withdrawn]), [[VERSION, '0.7.3', '2026-11-14T15:00:00Z', false]]);
  assert.equal(index.versions[0].bundle.sha256, sha256(env.compressed));
  assert.deepEqual(git(env.root, ['show', '--name-only', '--format=', 'HEAD']).trim().split('\n').sort(), [INDEX_PATH, SIGNATURE_PATH].sort());
  assert.equal(git(env.root, ['status', '--porcelain']).trim(), '');
});

test('a withdraw-only run and a revoke-only run build on the verified index', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  await publishIndex(options(env, signer));
  const withdrawn = await publishIndex(options(env, signer, { version: null, bundleFile: null, withdraw: VERSION, now: later('2026-11-14T17:00:00Z') }));
  assert.equal(withdrawn.index.versions[0].withdrawn, true);
  const revoked = await publishIndex(options(env, signer, { version: null, bundleFile: null, revokeKeyId: 'ABCDEF0123456789', now: later('2026-11-14T18:00:00Z') }));
  assert.deepEqual(revoked.index.revokedKeyIds, ['ABCDEF0123456789']);
  assert.equal(revoked.index.versions[0].withdrawn, true);
});

test('revoking the signer key id is refused before signing', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  await publishIndex(options(env, signer));
  const before = readFileSync(path.join(env.root, INDEX_PATH), 'utf8');
  await assert.rejects(
    publishIndex(options(env, signer, { version: null, bundleFile: null, revokeKeyId: signer.keyId, now: later('2026-11-14T17:00:00Z') })),
    /signing key .* is revoked/,
  );
  assert.equal(readFileSync(path.join(env.root, INDEX_PATH), 'utf8'), before);
});

test('a bundle whose size, digest, or content does not match is refused', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  const tooBig = { ...release(env.compressed) };
  tooBig.assets = [{ ...tooBig.assets[0], size: env.compressed.length + 1 }];
  await assert.rejects(publishIndex(options(env, signer, { fetchRelease: async () => tooBig })), /bytes; the release asset has/);
  const wrongDigest = { ...release(env.compressed) };
  wrongDigest.assets = [{ ...wrongDigest.assets[0], digest: `sha256:${'0'.repeat(64)}` }];
  await assert.rejects(publishIndex(options(env, signer, { fetchRelease: async () => wrongDigest })), /sha256 does not match the release asset digest/);

  // A valid bundle with a changed file: its own hashes are consistent, but it is not the tag content.
  const bundle = JSON.parse(gunzipSync(env.compressed).toString('utf8'));
  const readme = bundle.files.find((file) => file.path === 'README.md');
  readme.content = '# Changed\n';
  readme.sha256 = sha256(Buffer.from(readme.content));
  const tampered = gzipSync(Buffer.from(canonicalJson(bundle)));
  writeFileSync(env.bundleFile, tampered);
  await assert.rejects(publishIndex(options(env, signer, { fetchRelease: async () => release(tampered) })), /differs from a rebuild/);
  assert.equal(existsSync(path.join(env.root, INDEX_PATH)), false);
});

test('a source tree that differs from the tag is refused', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  writeFileSync(path.join(env.root, '.pipes.example', 'README.md'), '# Edited after the tag\n');
  await assert.rejects(publishIndex(options(env, signer)), /differs from the tag/);
  git(env.root, ['checkout', '--', '.pipes.example/README.md']);
  writeFileSync(path.join(env.root, '.pipes.example', 'extra.md'), 'untracked\n');
  await assert.rejects(publishIndex(options(env, signer)), /untracked files/);
});

test('a missing minAppVersion and a missing tag are refused', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  await assert.rejects(publishIndex(options(env, signer, { checkSource: () => {}, version: '2.2.2' })), /no asset|does not match/);
  git(env.root, ['tag', '-d', `pipes-framework-v${VERSION}`]);
  await assert.rejects(publishIndex(options(env, signer)), /Tag pipes-framework-v2\.2\.1 does not exist/);
  writeFileSync(path.join(env.root, 'frameworks', 'compatibility.json'), `${JSON.stringify({ compatibilitySchemaVersion: 1, versions: {} })}\n`);
  git(env.root, ['commit', '-q', '-am', 'drop the entry']);
  git(env.root, ['tag', `pipes-framework-v${VERSION}`]);
  await assert.rejects(publishIndex(options(env, signer)), /at pipes-framework-v2\.2\.1 has no minAppVersion/);
});

test('a public key that does not match the signer leaves no files behind', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  const other = createTestSigner();
  await assert.rejects(publishIndex(options(env, signer, { publicKeyTexts: [other.publicKeyText] })), /no trusted public key/);
  assert.equal(existsSync(path.join(env.root, INDEX_PATH)), false);
  assert.equal(existsSync(path.join(env.root, `${INDEX_PATH}.next`)), false);
  assert.equal(existsSync(path.join(env.root, `${SIGNATURE_PATH}.next`)), false);
});

test('a committed index that does not verify stops the run', async (context) => {
  const env = await fixture(context);
  const signer = createTestSigner();
  await publishIndex(options(env, signer));
  const indexPath = path.join(env.root, INDEX_PATH);
  writeFileSync(indexPath, readFileSync(indexPath, 'utf8').replace('"withdrawn": false', '"withdrawn": true'));
  await assert.rejects(
    publishIndex(options(env, signer, { version: null, bundleFile: null, revokeKeyId: 'ABCDEF0123456789', now: later('2026-11-14T17:00:00Z') })),
    /signature does not verify/,
  );
});

test('a dry run writes nothing', async (context) => {
  const env = await fixture(context);
  const result = await publishIndex(options(env, createTestSigner(), { signer: null, dryRun: true }));
  assert.equal(result.written, false);
  assert.equal(result.index.versions.length, 1);
  assert.equal(existsSync(path.join(env.root, INDEX_PATH)), false);
});

test('the CLI arguments need an action, a public key, and a secret key unless dry run', () => {
  assert.throws(() => parseArgs(['--public-key', 'p']), /at least one of/);
  assert.throws(() => parseArgs(['--version', '2.2.1']), /--public-key PATH is required/);
  assert.throws(() => parseArgs(['--version', '2.2.1', '--public-key', 'p']), /--secret-key PATH is required/);
  assert.throws(() => parseArgs(['--version', '2.2.1', '--public-key', 'p', '--dry-run', '--commit']), /cannot be combined/);
  assert.throws(() => parseArgs(['--withdraw', '2.2.1', '--public-key', 'p', '--secret-key', 's', '--bundle-file', 'f']), /--bundle-file needs --version/);
  assert.deepEqual(parseArgs(['--withdraw', '2.2.1', '--public-key', 'a', '--public-key', 'b', '--secret-key', 's']).publicKeys, ['a', 'b']);
});

test('minAppVersion comes from the tag, not from a later edit of the working tree', async (context) => {
  const env = await fixture(context);
  writeFileSync(path.join(env.root, 'frameworks', 'compatibility.json'), `${JSON.stringify({ compatibilitySchemaVersion: 1, versions: { [VERSION]: { minAppVersion: '9.9.9' } } })}\n`);
  const result = await publishIndex(options(env, createTestSigner(), { signer: null, dryRun: true }));
  assert.equal(result.index.versions[0].minAppVersion, '0.7.3');
});

test('a committed index signed by a revoked key is not used as a base', async (context) => {
  const env = await fixture(context);
  const keyA = createTestSigner();
  const keyB = createTestSigner();
  await publishIndex(options(env, keyA));
  await publishIndex(options(env, keyB, { version: null, bundleFile: null, revokeKeyId: keyA.keyId, publicKeyTexts: [keyB.publicKeyText, keyA.publicKeyText], now: later('2026-11-14T17:00:00Z') }));
  // Re-sign the current index with the revoked key A, as an attacker with key A could.
  const indexPath = path.join(env.root, INDEX_PATH);
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  writeFileSync(path.join(env.root, SIGNATURE_PATH), keyA.signMessage(readFileSync(indexPath), `pipes-framework-index v1 generatedAt=${index.generatedAt}`));
  await assert.rejects(
    publishIndex(options(env, keyB, { version: null, bundleFile: null, withdraw: VERSION, publicKeyTexts: [keyB.publicKeyText, keyA.publicKeyText], now: later('2026-11-14T18:00:00Z') })),
    /signing key .* is revoked/,
  );
});

test('a failed signature move restores the previous index', (context) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'pipes-replace-pair-'));
  context.after(() => rmSync(dir, { recursive: true, force: true }));
  const paths = { indexPath: path.join(dir, 'index.json'), signaturePath: path.join(dir, 'index.json.minisig'), nextIndexPath: path.join(dir, 'index.json.next'), nextSignaturePath: path.join(dir, 'sig.next') };
  writeFileSync(paths.indexPath, 'old index');
  writeFileSync(paths.signaturePath, 'old signature');
  writeFileSync(paths.nextIndexPath, 'new index');
  writeFileSync(paths.nextSignaturePath, 'new signature');
  let calls = 0;
  const rename = (from, to) => {
    calls += 1;
    if (calls === 2) throw new Error('disk full');
    writeFileSync(to, readFileSync(from));
    rmSync(from);
  };
  assert.throws(() => replacePair({ ...paths, rename }), /previous index is restored/);
  assert.equal(readFileSync(paths.indexPath, 'utf8'), 'old index');
  assert.equal(readFileSync(paths.signaturePath, 'utf8'), 'old signature');
});

test('the CLI refuses a version or withdrawal that is not strict SemVer', () => {
  assert.throws(() => parseArgs(['--version', '2.2.1;x', '--public-key', 'p', '--dry-run']), /strict SemVer/);
  assert.throws(() => parseArgs(['--withdraw', '2.2.1+b', '--public-key', 'p', '--dry-run']), /strict SemVer/);
});
