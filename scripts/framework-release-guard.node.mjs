import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertLatestIsAppRelease, assertTagMatchesManifest, parseAppReleaseTag } from './framework-release-guard.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('app release tags parse like app_update.rs parse_release_version', () => {
  // Vectors from pipes-local src-tauri/src/app_update.rs tests.
  for (const [tag, version] of [
    ['v1.2.3', '1.2.3'],
    ['1.2.3', '1.2.3'],
    ['pipes-local-v1.2.3', '1.2.3'],
    ['v0.5.20', '0.5.20'],
    ['pipes-local-v0.5.20', '0.5.20'],
    ['0.5.20-alpha.1', '0.5.20-alpha.1'],
    ['0.5.19+build.2', '0.5.19+build.2'],
    ['pipes-local-v0.7.4', '0.7.4'],
  ]) assert.equal(parseAppReleaseTag(tag), version, tag);
  for (const tag of ['vv1.2.3', 'pipes-local-vv1.2.3', 'other-v1.2.3', '', 'latest', 'pipes-framework-v2.2.1', '01.2.3', '0.5.20-01', null]) {
    assert.equal(parseAppReleaseTag(tag), null, String(tag));
  }
});

test('the latest release must be an app release', () => {
  assert.doesNotThrow(() => assertLatestIsAppRelease('pipes-local-v0.7.4'));
  assert.throws(() => assertLatestIsAppRelease('pipes-framework-v2.2.1'), /framework release/);
  assert.throws(() => assertLatestIsAppRelease('latest'), /not an app release tag/);
});

test('the tag must equal the manifest version', () => {
  assert.doesNotThrow(() => assertTagMatchesManifest('pipes-framework-v2.2.1', { frameworkVersion: '2.2.1' }));
  assert.throws(() => assertTagMatchesManifest('pipes-framework-v2.2.2', { frameworkVersion: '2.2.1' }), /does not equal/);
  assert.throws(() => assertTagMatchesManifest('pipes-framework-v2.2.1;touch x', { frameworkVersion: '2.2.1' }), /does not equal/);
  assert.throws(() => assertTagMatchesManifest('2.2.1', { frameworkVersion: '2.2.1' }), /does not equal/);
});

// Reads the `run` steps of the release workflow. It supports the two forms that file uses: a one-line
// `run:` and a folded `run: >-` block.
function workflowSteps(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const steps = [];
  for (let i = 0; i < lines.length; i += 1) {
    const name = /^ {6}- name: (.+)$/.exec(lines[i]);
    if (name) steps.push({ name: name[1], run: null, uses: null });
    const uses = /^ {8}uses: (.+)$/.exec(lines[i]);
    if (uses) steps.at(-1).uses = uses[1];
    const run = /^ {8}run: (.+)$/.exec(lines[i]);
    if (run && run[1] !== '>-') steps.at(-1).run = run[1];
    if (run && run[1] === '>-') {
      const folded = [];
      while (i + 1 < lines.length && /^ {10}\S/.test(lines[i + 1])) folded.push(lines[(i += 1)].trim());
      steps.at(-1).run = folded.join(' ');
    }
  }
  return steps;
}

// Steps that the stub run does not execute: the checkout and Node setup actions, the main-branch
// check (it needs a pushed commit), and the integrity checks (they run this test suite itself and
// run in the integrity workflow).
const NOT_RUN = ['Check out the tag', 'Install the pinned Node version', 'Check that the tag commit is on main', 'Run the integrity checks'];

function runRelease(context, env) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'pipes-release-stub-'));
  context.after(() => rmSync(dir, { recursive: true, force: true }));
  const log = path.join(dir, 'gh.log');
  writeFileSync(
    path.join(dir, 'gh'),
    `#!/bin/bash
echo "$*" >> "$GH_LOG"
case "$1 $2" in
  "api repos/"*)
    calls=$(grep -c '^api ' "$GH_LOG")
    if [ "$calls" -gt 1 ] && [ -n "$LATEST_AFTER" ]; then echo "$LATEST_AFTER"; else echo "$LATEST_TAG"; fi ;;
  "release view")
    if [ "$RELEASE_EXISTS" = 1 ]; then echo '{"tagName":"x"}'; else echo "release not found" >&2; exit 1; fi ;;
  "release create") exit 0 ;;
  *) echo "unexpected gh call: $*" >&2; exit 2 ;;
esac
`,
  );
  chmodSync(path.join(dir, 'gh'), 0o755);
  const steps = workflowSteps(path.join(REPO_ROOT, '.github/workflows/framework-release.yml'));
  assert.deepEqual(steps.filter((step) => NOT_RUN.includes(step.name)).map((step) => step.name), NOT_RUN);
  const results = [];
  for (const step of steps.filter((candidate) => !NOT_RUN.includes(candidate.name))) {
    assert.ok(step.run, `step ${step.name} has a run command`);
    const result = spawnSync('bash', ['-e', '-c', step.run], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        GH_LOG: log,
        GITHUB_REPOSITORY: 'dyegovasc/pipes-app',
        TAG: 'pipes-framework-v2.2.1',
        LATEST_TAG: 'pipes-local-v0.7.4',
        LATEST_AFTER: '',
        RELEASE_EXISTS: '0',
        ...env,
      },
    });
    results.push({ name: step.name, ok: result.status === 0, output: result.stdout + result.stderr });
    if (result.status !== 0) break;
  }
  const calls = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [];
  return { results, calls, failed: results.find((result) => !result.ok)?.name ?? null };
}

test('release steps: guards run in order and the release is created with --latest=false', (context) => {
  const { calls, failed } = runRelease(context, {});
  assert.equal(failed, null);
  assert.equal(calls.length, 4);
  assert.equal(calls[0], 'api repos/dyegovasc/pipes-app/releases/latest --jq .tag_name');
  assert.equal(calls[1], 'release view pipes-framework-v2.2.1 --repo dyegovasc/pipes-app --json tagName');
  assert.match(calls[2], /^release create pipes-framework-v2\.2\.1 dist\/pipes-starter-2\.2\.1\.json\.gz --title Pipes framework 2\.2\.1 /);
  assert.match(calls[2], / --latest=false --verify-tag$/);
  assert.equal(calls[3], 'api repos/dyegovasc/pipes-app/releases/latest --jq .tag_name');
});

test('release steps: a framework or unparseable latest release stops before the release', (context) => {
  for (const latest of ['pipes-framework-v2.2.0', 'latest']) {
    const { calls, failed } = runRelease(context, { LATEST_TAG: latest });
    assert.equal(failed, 'Check that the latest release is an app release', latest);
    assert.ok(!calls.some((call) => call.startsWith('release create')), latest);
  }
});

test('release steps: an existing release or a wrong tag stops before the release', (context) => {
  const existing = runRelease(context, { RELEASE_EXISTS: '1' });
  assert.equal(existing.failed, 'Refuse a release that already exists');
  assert.ok(!existing.calls.some((call) => call.startsWith('release create')));
  const wrongTag = runRelease(context, { TAG: 'pipes-framework-v2.2.2' });
  assert.equal(wrongTag.failed, 'Check that the tag matches the manifest version');
  assert.deepEqual(wrongTag.calls, []);
});

test('release steps: the job fails when the new release became latest', (context) => {
  const { calls, failed } = runRelease(context, { LATEST_AFTER: 'pipes-framework-v2.2.1' });
  assert.equal(failed, 'Check again that the latest release is an app release');
  assert.ok(calls.some((call) => call.startsWith('release create')));
});
