import assert from 'node:assert/strict';
import test from 'node:test';
import { compareSemver, minAppVersionProblems, parseArgs, policyChanged, releaseVersionProblems, replaceVersionText, withMinAppVersion } from './framework-release.mjs';

test('a greater version in the same major is accepted', () => {
  assert.deepEqual(releaseVersionProblems('2.2.2', '2.2.1'), []);
  assert.deepEqual(releaseVersionProblems('2.3.0', '2.2.1', ['1.0.1', '2.1.3', '2.2.0']), []);
  assert.deepEqual(releaseVersionProblems('2.99.0', '2.2.1'), []);
});

test('an equal version is refused', () => {
  assert.match(releaseVersionProblems('2.2.1', '2.2.1').join('\n'), /not greater than the current version 2\.2\.1/);
});

test('a lower version is refused', () => {
  assert.match(releaseVersionProblems('2.2.0', '2.2.1').join('\n'), /not greater/);
  assert.match(releaseVersionProblems('2.10.0', '2.11.0').join('\n'), /not greater/);
  assert.match(releaseVersionProblems('2.2.2-rc.1', '2.2.2').join('\n'), /not greater/);
});

test('a different major version is refused', () => {
  assert.match(releaseVersionProblems('3.0.0', '2.2.1').join('\n'), /changes the major version/);
  assert.match(releaseVersionProblems('1.9.9', '2.2.1').join('\n'), /not greater/);
});

test('an invalid version is refused', () => {
  for (const version of ['2.3', 'v2.3.0', '02.3.0', '2.3.0.1', '', 'latest']) {
    assert.match(releaseVersionProblems(version, '2.2.1').join('\n'), /not a valid SemVer version/, version);
  }
});

test('an existing release directory for the current version is refused', () => {
  assert.match(releaseVersionProblems('2.3.0', '2.2.1', ['2.2.1']).join('\n'), /framework-releases\/2\.2\.1\/ already exists/);
});

test('SemVer precedence orders cores and pre-releases', () => {
  assert.ok(compareSemver('2.10.0', '2.9.9') > 0);
  assert.ok(compareSemver('2.3.0-rc.1', '2.3.0') < 0);
  assert.ok(compareSemver('2.3.0-rc.2', '2.3.0-rc.10') < 0);
  assert.ok(compareSemver('2.3.0-alpha', '2.3.0-1') > 0);
  assert.equal(compareSemver('2.3.0+build.1', '2.3.0'), 0);
});

test('the version argument is required', () => {
  assert.throws(() => parseArgs([]), /--version X is required/);
  assert.throws(() => parseArgs(['--version', '--dry-run']), /--version X is required/);
  assert.throws(() => parseArgs(['--version', '2.3.0']), /--min-app-version Y is required/);
  assert.deepEqual(parseArgs(['--version', '2.3.0', '--min-app-version', '0.7.3', '--dry-run']), { version: '2.3.0', minAppVersion: '0.7.3', dryRun: true });
});

test('version text replacement requires the expected occurrence count', () => {
  assert.equal(replaceVersionText('a `2.2.1` b `2.2.1`', '2.2.1', '2.3.0', 2, 'README'), 'a `2.3.0` b `2.3.0`');
  assert.throws(() => replaceVersionText('a `2.2.1`', '2.2.1', '2.3.0', 2, 'README'), /README names `2\.2\.1` 1 time\(s\); expected 2/);
});

const manifest = (overrides = {}) => ({
  manifestSchemaVersion: 2,
  projectLayoutVersion: 3,
  ownership: { trackedRoots: ['ai-instructions'], trackedFiles: ['README.md'], opaqueRoots: ['project'], ignoredNames: ['.DS_Store'] },
  files: [{ path: 'README.md', sha256: 'a'.repeat(64) }],
  ...overrides,
});

test('a content-only change is not a policy change', () => {
  assert.equal(policyChanged(manifest(), manifest({ files: [{ path: 'README.md', sha256: 'b'.repeat(64) }] })), false);
});

test('an ownership, schema, or layout change is a policy change', () => {
  const base = manifest();
  assert.equal(policyChanged(base, manifest({ ownership: { ...base.ownership, trackedRoots: ['ai-instructions', 'team'] } })), true);
  assert.equal(policyChanged(base, manifest({ ownership: { ...base.ownership, ignoredNames: [] } })), true);
  assert.equal(policyChanged(base, manifest({ manifestSchemaVersion: 3 })), true);
  assert.equal(policyChanged(base, manifest({ projectLayoutVersion: 4 })), true);
});

test('minAppVersion may stay the same for a content-only release', () => {
  assert.deepEqual(minAppVersionProblems({ next: '0.7.3', previous: '0.7.3', changedPolicy: false }), []);
  assert.deepEqual(minAppVersionProblems({ next: '0.8.0', previous: '0.7.3', changedPolicy: false }), []);
});

test('minAppVersion must increase when the policy changes', () => {
  assert.match(minAppVersionProblems({ next: '0.7.3', previous: '0.7.3', changedPolicy: true }).join('\n'), /must be newer than 0\.7\.3/);
  assert.deepEqual(minAppVersionProblems({ next: '0.8.0', previous: '0.7.3', changedPolicy: true }), []);
});

test('minAppVersion cannot be older than the previous version or invalid', () => {
  assert.match(minAppVersionProblems({ next: '0.7.2', previous: '0.7.3', changedPolicy: false }).join('\n'), /older than/);
  assert.match(minAppVersionProblems({ next: 'v0.8.0', previous: '0.7.3', changedPolicy: false }).join('\n'), /not a valid SemVer/);
});

test('the compatibility file cannot record a version twice', () => {
  const data = { compatibilitySchemaVersion: 1, versions: { '2.2.1': { minAppVersion: '0.7.3' } } };
  assert.deepEqual(withMinAppVersion(data, '2.2.2', '0.7.3').versions['2.2.2'], { minAppVersion: '0.7.3' });
  assert.throws(() => withMinAppVersion(data, '2.2.1', '0.7.3'), /already holds 2\.2\.1/);
});
