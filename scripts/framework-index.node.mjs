import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addVersion,
  assertAppendOnly,
  assertSignerNotRevoked,
  bundleUrl,
  canonicalIndexJson,
  checkGeneratedAt,
  dropVersion,
  emptyIndex,
  finalizeIndex,
  makeEntry,
  revokeKey,
  trustedComment,
  validateIndex,
  withdrawVersion,
} from './lib/framework-index.mjs';

function entry(version, overrides = {}) {
  return {
    ...makeEntry({
      manifest: { frameworkVersion: version, manifestSchemaVersion: 2, projectLayoutVersion: 3 },
      manifestSha256: 'a'.repeat(64),
      minAppVersion: '0.7.3',
      releasedAt: '2026-11-14T15:00:00Z',
      size: 600588,
      sha256: 'b'.repeat(64),
    }),
    ...overrides,
  };
}

const T0 = new Date('2026-11-14T15:00:00.123Z');
const T1 = new Date('2026-11-14T16:00:00Z');

test('a first index holds one sorted entry and serializes canonically', () => {
  const index = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), T0);
  assert.equal(index.generatedAt, '2026-11-14T15:00:00Z');
  assert.equal(index.versions[0].bundle.url, 'https://github.com/dyegovasc/pipes-app/releases/download/pipes-framework-v2.2.1/pipes-starter-2.2.1.json.gz');
  assert.equal(canonicalIndexJson(index), `${JSON.stringify(index, null, 2)}\n`);
  assert.deepEqual(Object.keys(index), ['indexSchemaVersion', 'generatedAt', 'revokedKeyIds', 'versions']);
});

test('versions stay sorted by SemVer and a duplicate is refused', () => {
  let index = addVersion(emptyIndex(), entry('2.10.0'));
  index = addVersion(index, entry('2.2.1'));
  index = addVersion(index, entry('2.9.0'));
  assert.deepEqual(index.versions.map((e) => e.frameworkVersion), ['2.2.1', '2.9.0', '2.10.0']);
  assert.throws(() => addVersion(index, entry('2.9.0')), /already in the index/);
  assert.throws(() => addVersion(index, entry('2.11.0', { withdrawn: true })), /cannot be withdrawn/);
});

test('withdraw sets withdrawn and cannot be undone (R20)', () => {
  const before = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), T0);
  const after = withdrawVersion(before, '2.2.1');
  assert.equal(after.versions[0].withdrawn, true);
  assert.equal(before.versions[0].withdrawn, false);
  assert.throws(() => withdrawVersion(after, '2.2.1'), /already withdrawn/);
  assert.throws(() => withdrawVersion(after, '9.9.9'), /not in the index/);
  const withdrawn = finalizeIndex(before, after, T1);
  const undone = JSON.parse(JSON.stringify(withdrawn));
  undone.versions[0].withdrawn = false;
  assert.throws(() => assertAppendOnly(withdrawn, undone), /cannot be undone/);
});

test('revoke appends a key id, removal is refused, and a revoked signer is refused (R22)', () => {
  const before = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), T0);
  const after = finalizeIndex(before, revokeKey(before, '0807060504030201'), T1);
  assert.deepEqual(after.revokedKeyIds, ['0807060504030201']);
  assert.throws(() => revokeKey(after, '0807060504030201'), /already revoked/);
  assert.throws(() => revokeKey(after, '08070605'), /16 uppercase hex/);
  assert.throws(() => assertAppendOnly(after, { ...after, revokedKeyIds: [] }), /cannot be removed/);
  assert.throws(() => assertSignerNotRevoked(after, '0807060504030201'), /is revoked/);
  assert.doesNotThrow(() => assertSignerNotRevoked(after, 'ABCDEF0123456789'));
});

test('generatedAt must be later than the previous index (R21) and use whole seconds in UTC', () => {
  assert.doesNotThrow(() => checkGeneratedAt(null, '2026-11-14T15:00:00Z'));
  assert.doesNotThrow(() => checkGeneratedAt('2026-11-14T15:00:00Z', '2026-11-14T15:00:01Z'));
  assert.throws(() => checkGeneratedAt('2026-11-14T15:00:00Z', '2026-11-14T15:00:00Z'), /not later/);
  assert.throws(() => checkGeneratedAt('2026-11-14T15:00:00Z', '2026-11-14T14:59:59Z'), /not later/);
  for (const bad of ['2026-11-14T15:00:00.000Z', '2026-11-14T15:00:00+00:00', '2026-02-30T00:00:00Z', '2026-11-14 15:00:00Z']) {
    assert.throws(() => checkGeneratedAt(null, bad), /YYYY-MM-DDThh:mm:ssZ/, bad);
  }
  const first = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), T0);
  assert.throws(() => finalizeIndex(first, addVersion(first, entry('2.2.2')), T0), /not later/);
});

test('the trusted comment is built only from generatedAt (R13)', () => {
  assert.equal(trustedComment('2026-11-14T15:00:00Z'), 'pipes-framework-index v1 generatedAt=2026-11-14T15:00:00Z');
  assert.throws(() => trustedComment('2026-11-14T15:00:00.5Z'), /generatedAt/);
});

test('a version cannot be removed or changed except by withdrawal', () => {
  const before = finalizeIndex(null, addVersion(addVersion(emptyIndex(), entry('2.2.1')), entry('2.2.2')), T0);
  assert.throws(() => assertAppendOnly(before, { ...before, versions: [before.versions[1]] }), /cannot be removed; withdraw it instead/);
  const changed = JSON.parse(JSON.stringify(before));
  changed.versions[0].minAppVersion = '0.8.0';
  assert.throws(() => assertAppendOnly(before, changed), /cannot be changed/);
});

test('validation rejects malformed entries and indexes', () => {
  const index = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), T0);
  const cases = [
    [(i) => { i.extra = 1; }, /top-level keys/],
    [(i) => { i.indexSchemaVersion = 2; }, /indexSchemaVersion/],
    [(i) => { i.versions[0].bundle.url = bundleUrl('2.2.2'); }, /bundle.url/],
    [(i) => { i.versions[0].bundle.size = 17 * 1024 * 1024; }, /bundle.size/],
    [(i) => { i.versions[0].manifestSha256 = 'A'.repeat(64); }, /manifestSha256/],
    [(i) => { i.versions[0].minAppVersion = 'v0.7.3'; }, /minAppVersion/],
    [(i) => { i.versions[0].withdrawn = 'no'; }, /withdrawn/],
    [(i) => { i.versions[0].minAppVersion = '0.7.3+build.1'; }, /minAppVersion/],
    [(i) => { delete i.versions[0].projectLayoutVersion; }, /entry keys/],
    [(i) => { i.revokedKeyIds = ['x']; }, /revoked key id/],
    [(i) => { i.revokedKeyIds = ['0807060504030201', '0807060504030201']; }, /unique/],
    [(i) => { i.versions.push(i.versions[0]); }, /unique and sorted/],
  ];
  for (const [mutate, pattern] of cases) {
    const copy = JSON.parse(JSON.stringify(index));
    mutate(copy);
    assert.throws(() => validateIndex(copy), pattern);
  }
});

test('an entry needs a manifest with a project layout', () => {
  assert.throws(
    () => makeEntry({ manifest: { frameworkVersion: '1.0.1', manifestSchemaVersion: 1 }, manifestSha256: 'a'.repeat(64), minAppVersion: '0.7.3', releasedAt: '2026-11-14T15:00:00Z', size: 1, sha256: 'b'.repeat(64) }),
    /no projectLayoutVersion/,
  );
});

test('versions follow the Rust semver crate and refuse build metadata', () => {
  for (const version of ['2.2.1+build.1', '2.2.1-01', '02.2.1']) {
    assert.throws(() => addVersion(emptyIndex(), entry(version)), /strict SemVer/, version);
  }
  assert.doesNotThrow(() => addVersion(emptyIndex(), entry('2.3.0-rc.1')));
});

test('finalizeIndex validates the previous index before it compares generatedAt', () => {
  const previous = finalizeIndex(null, addVersion(emptyIndex(), entry('2.2.1')), T0);
  assert.throws(() => finalizeIndex({ ...previous, generatedAt: 'not a time' }, previous, T1), /generatedAt/);
});

test('only listed versions can be dropped, and only explicitly', () => {
  const before = finalizeIndex(null, addVersion(addVersion(emptyIndex(), entry('2.2.1')), entry('2.2.2')), T0);
  const dropped = dropVersion(before, '2.2.2');
  assert.deepEqual(dropped.versions.map((e) => e.frameworkVersion), ['2.2.1']);
  assert.throws(() => dropVersion(before, '9.9.9'), /not in the index/);
  assert.throws(() => finalizeIndex(before, dropped, T1), /cannot be removed/);
  assert.equal(finalizeIndex(before, dropped, T1, { allowedRemovals: ['2.2.2'] }).versions.length, 1);
  const both = dropVersion(dropped, '2.2.1');
  assert.throws(() => finalizeIndex(before, both, T1, { allowedRemovals: ['2.2.2'] }), /2\.2\.1 cannot be removed/);
});
