import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyFrameworkIndex } from './framework-verify-index.mjs';
import { addVersion, canonicalIndexJson, emptyIndex, finalizeIndex, makeEntry, revokeKey, trustedComment } from './lib/framework-index.mjs';
import { createTestSigner } from './lib/minisign.mjs';

function entry(version, minAppVersion = '0.7.3') {
  return makeEntry({
    manifest: { frameworkVersion: version, manifestSchemaVersion: 2, projectLayoutVersion: 3 },
    manifestSha256: 'a'.repeat(64),
    minAppVersion,
    releasedAt: '2026-11-14T15:00:00Z',
    size: 600588,
    sha256: 'b'.repeat(64),
  });
}

function repo(context, { keys, index, signer, comment, compatibility = { '2.2.1': { minAppVersion: '0.7.3' } } }) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'pipes-verify-index-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'frameworks/keys'), { recursive: true });
  writeFileSync(path.join(root, 'frameworks/compatibility.json'), `${JSON.stringify({ compatibilitySchemaVersion: 1, versions: compatibility }, null, 2)}\n`);
  for (const [name, key] of Object.entries(keys)) writeFileSync(path.join(root, 'frameworks/keys', `${name}.pub`), key.publicKeyText);
  if (index) {
    const json = canonicalIndexJson(index);
    writeFileSync(path.join(root, 'frameworks/index.json'), json);
    writeFileSync(path.join(root, 'frameworks/index.json.minisig'), signer.signMessage(Buffer.from(json), comment ?? trustedComment(index.generatedAt)));
  }
  return root;
}

const NOW = new Date('2026-11-14T16:00:00Z');

test('no index passes', (context) => {
  assert.deepEqual(verifyFrameworkIndex(repo(context, { keys: {} })), { published: false });
});

test('a valid index signed by either key passes', (context) => {
  const active = createTestSigner();
  const standby = createTestSigner();
  const index = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), NOW);
  for (const signer of [active, standby]) {
    const result = verifyFrameworkIndex(repo(context, { keys: { active, standby }, index, signer }));
    assert.deepEqual(result.versions, ['2.2.1']);
    assert.equal(result.signer, signer.keyId);
  }
});

test('a bad signature, comment, signer, or missing pair is refused', (context) => {
  const active = createTestSigner();
  const stranger = createTestSigner();
  const index = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), NOW);
  assert.throws(() => verifyFrameworkIndex(repo(context, { keys: { active }, index, signer: stranger })), /no trusted public key/);
  assert.throws(() => verifyFrameworkIndex(repo(context, { keys: { active }, index, signer: active, comment: trustedComment('2026-11-14T16:00:01Z') })), /trusted comment/);
  const revoked = finalizeIndex(null, revokeKey(addVersion(emptyIndex(), entry('2.2.1')), active.keyId), NOW);
  assert.throws(() => verifyFrameworkIndex(repo(context, { keys: { active }, index: revoked, signer: active })), /is revoked/);
  assert.throws(() => verifyFrameworkIndex(repo(context, { keys: {}, index, signer: active })), /has no public key/);
  const root = repo(context, { keys: { active } });
  writeFileSync(path.join(root, 'frameworks/index.json'), '{}');
  assert.throws(() => verifyFrameworkIndex(root), /must exist together/);
});

test('minAppVersion must equal the compatibility file', (context) => {
  const active = createTestSigner();
  const index = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1', '0.7.3')), NOW);
  assert.throws(() => verifyFrameworkIndex(repo(context, { keys: { active }, index, signer: active, compatibility: { '2.2.1': { minAppVersion: '0.8.0' } } })), /compatibility.json says 0\.8\.0/);
  assert.throws(() => verifyFrameworkIndex(repo(context, { keys: { active }, index, signer: active, compatibility: {} })), /says nothing/);
});
