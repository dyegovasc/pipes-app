#!/usr/bin/env node
// Releases a new framework version from `.pipes.example`, the only framework source.
// Every step runs first in temporary space: a staged copy of `.pipes.example` gets the new version
// text, the starter's own `installStarter` regenerates every derived surface from it, the starter
// script tests run in starter mode, and the provenance is generated and checked. Only then does the
// script write to this repository, in this order:
//   1. archive the current manifest and baseline archive to `framework-releases/<current>/`
//   2. write the new version text and any derived file that changed
//   3. run `generate-pipes-framework-metadata.mjs --write --framework-version X`, then `--check`
// It prints the two `RELEASES` entries to pin in `check-pipes-framework-release-assets.mjs`.
//
// It also records `--min-app-version` for the new version in `frameworks/compatibility.json`.
//
// Usage: npm run framework:release -- --version X --min-app-version Y [--dry-run]

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASELINE_ARCHIVE_FILE,
  FORK_CONTROL_FILE,
  MANIFEST_FILE,
  projectLayoutVersionFor,
  run as runMetadata,
} from './generate-pipes-framework-metadata.mjs';
import { isStrictSemver } from './lib/semver.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STARTER_DIR = '.pipes.example';
const RELEASES_DIR = 'framework-releases';
const COMPATIBILITY_FILE = 'frameworks/compatibility.json';
const COMPATIBILITY_SCHEMA_VERSION = 1;
const PROVENANCE_FILES = new Set([MANIFEST_FILE, BASELINE_ARCHIVE_FILE, FORK_CONTROL_FILE]);
// Each file that names the current version, with the number of backticked occurrences it must hold.
const VERSION_TEXT = [
  { file: 'README.md', count: 2 },
  { file: 'utils/rules/rule-framework-provenance.md', count: 1 },
];
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function parseSemver(version) {
  const match = SEMVER.exec(String(version));
  if (!match) return null;
  return { core: match.slice(1, 4).map(Number), prerelease: match[4] ? match[4].split('.') : [] };
}

function compareIdentifiers(left, right) {
  const leftNumeric = /^\d+$/.test(left);
  const rightNumeric = /^\d+$/.test(right);
  if (leftNumeric && rightNumeric) return Number(left) - Number(right);
  if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
  return left < right ? -1 : left > right ? 1 : 0;
}

/** SemVer precedence: negative when `left` is lower, positive when higher, 0 when equal. */
export function compareSemver(left, right) {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a || !b) throw new Error(`Not a SemVer version: ${a ? right : left}`);
  for (let index = 0; index < 3; index += 1) {
    if (a.core[index] !== b.core[index]) return a.core[index] - b.core[index];
  }
  if (!a.prerelease.length || !b.prerelease.length) return b.prerelease.length - a.prerelease.length;
  for (let index = 0; index < Math.min(a.prerelease.length, b.prerelease.length); index += 1) {
    const order = compareIdentifiers(a.prerelease[index], b.prerelease[index]);
    if (order) return order;
  }
  return a.prerelease.length - b.prerelease.length;
}

/**
 * Returns the reasons that `next` cannot be released after `current`; an empty list means valid.
 * `archived` lists the versions that already have a `framework-releases/<version>/` entry.
 */
export function releaseVersionProblems(next, current, archived = []) {
  if (!parseSemver(next)) return [`${next} is not a valid SemVer version`];
  if (!isStrictSemver(next)) return [`${next} has build metadata or a leading zero in a pre-release identifier`];
  if (!parseSemver(current)) return [`The current version ${current} is not a valid SemVer version`];
  const problems = [];
  if (compareSemver(next, current) <= 0) problems.push(`${next} is not greater than the current version ${current}`);
  if (parseSemver(next).core[0] !== parseSemver(current).core[0]) problems.push(`${next} changes the major version of ${current}`);
  if (archived.includes(current)) problems.push(`${RELEASES_DIR}/${current}/ already exists`);
  return problems;
}

export function parseArgs(argv) {
  const options = { version: null, minAppVersion: null, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version') {
      options.version = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--min-app-version') {
      options.minAppVersion = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!options.version || options.version.startsWith('--')) throw new Error('--version X is required');
  if (!options.minAppVersion || options.minAppVersion.startsWith('--')) throw new Error('--min-app-version Y is required');
  return options;
}

/**
 * True when the release changes the policy that the app checks before it offers a version: the
 * manifest `ownership` object, `manifestSchemaVersion`, or `projectLayoutVersion`. A change in file
 * content alone is not a policy change.
 */
export function policyChanged(previousManifest, nextManifest) {
  return (
    JSON.stringify(previousManifest.ownership) !== JSON.stringify(nextManifest.ownership) ||
    previousManifest.manifestSchemaVersion !== nextManifest.manifestSchemaVersion ||
    previousManifest.projectLayoutVersion !== nextManifest.projectLayoutVersion
  );
}

/** Returns the reasons that `next` cannot be the `minAppVersion` of the new release; empty means valid. */
export function minAppVersionProblems({ next, previous, changedPolicy }) {
  if (!parseSemver(next)) return [`--min-app-version ${next} is not a valid SemVer version`];
  if (!isStrictSemver(next)) return [`--min-app-version ${next} has build metadata or a leading zero in a pre-release identifier`];
  if (!parseSemver(previous)) return [`The previous minAppVersion ${previous} is not a valid SemVer version`];
  const order = compareSemver(next, previous);
  if (order < 0) return [`--min-app-version ${next} is older than the previous version's ${previous}`];
  if (changedPolicy && order === 0) {
    return [`The release changes the ownership policy, manifest schema, or project layout, so --min-app-version must be newer than ${previous}`];
  }
  return [];
}

export function readCompatibility(root) {
  const target = path.join(root, COMPATIBILITY_FILE);
  const data = JSON.parse(readFileSync(target, 'utf8'));
  if (data?.compatibilitySchemaVersion !== COMPATIBILITY_SCHEMA_VERSION || typeof data.versions !== 'object' || data.versions === null) {
    throw new Error(`${COMPATIBILITY_FILE} is invalid`);
  }
  return data;
}

export function withMinAppVersion(compatibility, version, minAppVersion) {
  if (compatibility.versions[version]) throw new Error(`${COMPATIBILITY_FILE} already holds ${version}`);
  return { ...compatibility, versions: { ...compatibility.versions, [version]: { minAppVersion } } };
}

/** Replaces every backticked `current` with `next`; refuses when the occurrence count is not the expected one. */
export function replaceVersionText(content, current, next, expectedCount, label) {
  const needle = `\`${current}\``;
  const found = content.split(needle).length - 1;
  if (found !== expectedCount) throw new Error(`${label} names ${needle} ${found} time(s); expected ${expectedCount}`);
  return content.replaceAll(needle, `\`${next}\``);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function exec(bin, args, cwd) {
  const result = spawnSync(bin, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: result.status === 0, output: (result.stdout || '') + (result.stderr || '') };
}

function git(cwd, args) {
  const result = exec('git', ['-c', 'user.name=framework-release', '-c', 'user.email=release@localhost', '-c', 'commit.gpgsign=false', ...args], cwd);
  if (!result.ok) throw new Error(`git ${args.join(' ')} failed: ${result.output}`);
  return result.output;
}

function walk(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

function sameBytes(left, right) {
  return existsSync(left) && existsSync(right) && readFileSync(left).equals(readFileSync(right));
}

function releaseEntry({ label, root, version, manifestBytes, archiveBytes, baselineDigest }) {
  const layout = projectLayoutVersionFor(version);
  return [
    '  {',
    `    label: '${label}',`,
    `    releaseRoot: path.join(REPO_ROOT, '${root}'),`,
    `    manifestPath: path.join(REPO_ROOT, '${root}', MANIFEST_FILE),`,
    `    archivePath: path.join(REPO_ROOT, '${root}', BASELINE_ARCHIVE_FILE),`,
    `    expectedVersion: '${version}',`,
    `    expectedManifestSha256: '${sha256(manifestBytes)}',`,
    `    expectedArchiveSha256: '${sha256(archiveBytes)}',`,
    `    expectedBaselineDigest: '${baselineDigest}',`,
    '    expectedManifestSchemaVersion: MANIFEST_SCHEMA_VERSION,',
    `    expectedProjectLayoutVersion: ${layout},`,
    `    expectedProjectAreas: LAYOUT_${layout}_PROJECT_AREAS,`,
    '  },',
  ].join('\n');
}

/** Builds and verifies the release in temporary space. Writes nothing to this repository. */
function stageRelease(current, next) {
  const stageRoot = mkdtempSync(path.join(os.tmpdir(), 'pipes-framework-release-stage-'));
  const workspace = mkdtempSync(path.join(os.tmpdir(), 'pipes-framework-release-build-'));
  const stage = path.join(stageRoot, STARTER_DIR);
  try {
    // 1. Stage the files of `.pipes.example` that git tracks or does not ignore.
    const listed = git(REPO_ROOT, ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', STARTER_DIR]);
    const files = [...new Set(listed.split('\0').filter(Boolean))].filter((rel) => existsSync(path.join(REPO_ROOT, rel)));
    for (const rel of files) {
      const target = path.join(stageRoot, rel);
      mkdirSync(path.dirname(target), { recursive: true });
      copyFileSync(path.join(REPO_ROOT, rel), target);
    }

    // 2. New version text.
    const changed = [];
    for (const { file, count } of VERSION_TEXT) {
      const target = path.join(stage, file);
      writeFileSync(target, replaceVersionText(readFileSync(target, 'utf8'), current, next, count, `${STARTER_DIR}/${file}`), 'utf8');
      changed.push(file);
    }

    // 3. Regenerate every derived surface with the starter's own tools and run its script tests.
    const require = createRequire(import.meta.url);
    const { installStarter } = require(path.join(stage, 'utils/scripts/verify-starter.cjs'));
    const failed = [];
    const step = (name, result) => {
      console.log(`${result.ok ? 'ok   ' : 'FAIL '}${name}`);
      if (!result.ok) failed.push(`${name}: ${result.output.slice(0, 800)}`);
      return result.ok;
    };
    installStarter(workspace, { version: next, step });
    if (failed.length) throw new Error(`Starter build failed:\n${failed.join('\n')}`);
    git(workspace, ['init', '-q', '-b', 'main']);
    git(workspace, ['add', '-A']);
    git(workspace, ['commit', '-q', '-m', 'starter']);
    const built = path.join(workspace, STARTER_DIR);
    const scripts = path.join(built, 'utils/scripts');
    const tests = readdirSync(scripts).filter((name) => name.endsWith('.test.cjs')).map((name) => path.join(scripts, name));
    const testRun = exec(process.execPath, ['--test', ...tests], workspace);
    const summary = (testRun.output.match(/^ℹ (tests|pass|fail) \d+$/gm) || []).join(', ');
    step(`script tests in starter mode (${summary})`, testRun);
    if (failed.length) throw new Error(`Starter script tests failed:\n${failed.join('\n')}`);

    // 4. Take back every derived file that differs; never the provenance files.
    const builtFiles = walk(built).filter((rel) => !PROVENANCE_FILES.has(rel));
    const stagedFiles = new Set(walk(stage).filter((rel) => !PROVENANCE_FILES.has(rel)));
    const missing = [...stagedFiles].filter((rel) => !builtFiles.includes(rel));
    if (missing.length) throw new Error(`The starter build dropped files that ${STARTER_DIR} holds:\n${missing.join('\n')}`);
    for (const rel of builtFiles) {
      if (sameBytes(path.join(built, rel), path.join(stage, rel))) continue;
      mkdirSync(path.dirname(path.join(stage, rel)), { recursive: true });
      copyFileSync(path.join(built, rel), path.join(stage, rel));
      if (!changed.includes(rel)) changed.push(rel);
    }
    return { stageRoot, stage, changed };
  } catch (error) {
    rmSync(stageRoot, { recursive: true, force: true });
    throw error;
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

// pipes-app is the framework source and holds no installed `.pipes`, so both runs are starter-only.
async function generateAndCheck(root, next) {
  const options = { root, initializeInstalledOrigin: false, initializeInstalledAdopted: false, starterOnly: true };
  await runMetadata({ ...options, mode: 'write', frameworkVersion: next });
  await runMetadata({ ...options, mode: 'check', frameworkVersion: null });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const starterRoot = path.join(REPO_ROOT, STARTER_DIR);
  const currentManifestBytes = readFileSync(path.join(starterRoot, MANIFEST_FILE));
  const currentArchiveBytes = readFileSync(path.join(starterRoot, BASELINE_ARCHIVE_FILE));
  const currentManifest = JSON.parse(currentManifestBytes.toString('utf8'));
  const current = currentManifest.frameworkVersion;
  const archived = existsSync(path.join(REPO_ROOT, RELEASES_DIR)) ? readdirSync(path.join(REPO_ROOT, RELEASES_DIR)) : [];
  const problems = releaseVersionProblems(options.version, current, archived);
  if (problems.length) throw new Error(`Refusing to release ${options.version}:\n- ${problems.join('\n- ')}`);
  const next = options.version;
  const compatibility = readCompatibility(REPO_ROOT);
  const previousMinAppVersion = compatibility.versions[current]?.minAppVersion;
  if (!previousMinAppVersion) throw new Error(`${COMPATIBILITY_FILE} has no minAppVersion for the current version ${current}`);
  const nextCompatibility = withMinAppVersion(compatibility, next, options.minAppVersion);
  console.log(`Releasing framework ${current} -> ${next}${options.dryRun ? ' (dry run)' : ''}`);

  const { stageRoot, stage, changed } = stageRelease(current, next);
  try {
    await generateAndCheck(stageRoot, next);
    const stagedManifestBytes = readFileSync(path.join(stage, MANIFEST_FILE));
    const stagedArchiveBytes = readFileSync(path.join(stage, BASELINE_ARCHIVE_FILE));
    const stagedManifest = JSON.parse(stagedManifestBytes.toString('utf8'));
    const stagedDigest = stagedManifest.baselineDigest;
    const minAppProblems = minAppVersionProblems({
      next: options.minAppVersion,
      previous: previousMinAppVersion,
      changedPolicy: policyChanged(currentManifest, stagedManifest),
    });
    if (minAppProblems.length) throw new Error(`Refusing to release ${next}:\n- ${minAppProblems.join('\n- ')}`);
    console.log(`Staged release verified: ${changed.length} file(s) change in ${STARTER_DIR}: ${changed.join(', ')}`);

    const forkPath = path.join(REPO_ROOT, '.pipes', FORK_CONTROL_FILE);
    const forkBefore = existsSync(forkPath) ? readFileSync(forkPath) : null;
    if (!options.dryRun) {
      const written = [];
      try {
        const releaseDir = path.join(REPO_ROOT, RELEASES_DIR, current);
        mkdirSync(releaseDir, { recursive: true });
        for (const file of [MANIFEST_FILE, BASELINE_ARCHIVE_FILE]) {
          copyFileSync(path.join(starterRoot, file), path.join(releaseDir, file));
          written.push(`${RELEASES_DIR}/${current}/${file}`);
        }
        for (const rel of changed) {
          mkdirSync(path.dirname(path.join(starterRoot, rel)), { recursive: true });
          copyFileSync(path.join(stage, rel), path.join(starterRoot, rel));
          written.push(`${STARTER_DIR}/${rel}`);
        }
        await generateAndCheck(REPO_ROOT, next);
        writeFileSync(path.join(REPO_ROOT, COMPATIBILITY_FILE), `${JSON.stringify(nextCompatibility, null, 2)}\n`, 'utf8');
        written.push(COMPATIBILITY_FILE);
        written.push(...[MANIFEST_FILE, BASELINE_ARCHIVE_FILE, FORK_CONTROL_FILE].map((file) => `${STARTER_DIR}/${file}`));
        for (const file of [MANIFEST_FILE, BASELINE_ARCHIVE_FILE]) {
          if (!sameBytes(path.join(stage, file), path.join(starterRoot, file))) throw new Error(`${STARTER_DIR}/${file} differs from the staged release`);
        }
      } catch (error) {
        console.error(`Release failed after writing these paths (restore them with git):\n${written.join('\n') || '(none)'}`);
        throw error;
      }
      console.log(`Wrote ${RELEASES_DIR}/${current}/ and ${STARTER_DIR} provenance for ${next}.`);
      const forkAfter = existsSync(forkPath) ? readFileSync(forkPath) : null;
      if (forkBefore && forkAfter && !forkBefore.equals(forkAfter)) console.log(`Note: .pipes/${FORK_CONTROL_FILE} was refreshed by the metadata generator.`);
    }

    console.log('\nPin these entries in RELEASES in scripts/check-pipes-framework-release-assets.mjs.');
    console.log(`Replace the bundled ${current} entry with the legacy entry, and add the bundled ${next} entry last:\n`);
    console.log(
      releaseEntry({
        label: `Pipes ${current} (legacy layout ${projectLayoutVersionFor(current)} release)`,
        root: `${RELEASES_DIR}/${current}`,
        version: current,
        manifestBytes: currentManifestBytes,
        archiveBytes: currentArchiveBytes,
        baselineDigest: currentManifest.baselineDigest,
      }),
    );
    console.log(
      releaseEntry({
        label: `Pipes ${next} (bundled upgrade target)`,
        root: STARTER_DIR,
        version: next,
        manifestBytes: stagedManifestBytes,
        archiveBytes: stagedArchiveBytes,
        baselineDigest: stagedDigest,
      }),
    );
    console.log('\nNext steps:');
    console.log('1. Paste the entries above, then run: node scripts/check-pipes-framework-release-assets.mjs');
    console.log(`2. Prove the release: npm run framework:evals, and node ${STARTER_DIR}/utils/scripts/verify-starter.cjs --version ${next}`);
    console.log('3. Run: npm run check and npm run framework:test');
    console.log(`4. Review the diff, including ${COMPATIBILITY_FILE}, then commit with approval.`);
    console.log(`5. After the commit is on main, push the tag ${'pipes-framework-v'}${next} with approval, then run npm run framework:publish-index -- --version ${next}.`);
  } finally {
    rmSync(stageRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
