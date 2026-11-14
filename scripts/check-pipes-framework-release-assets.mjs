#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import {
  FRAMEWORK,
  MANIFEST_FILE,
  BASELINE_ARCHIVE_FILE,
  FORK_CONTROL_FILE,
  ownershipForVersion,
  inventoryDigest,
} from './generate-pipes-framework-metadata.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MANIFEST_SCHEMA_VERSION = 2;
const BASELINE_ARCHIVE_SCHEMA_VERSION = 1;
const BASELINE_DIGEST_DOMAIN = 'pipes-framework-baseline-v1';
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const HEX64 = /^[0-9a-f]{64}$/;
const LAYOUT_2_PROJECT_AREAS = [
  '00-notes',
  '01-objectives',
  '02-missions',
  '03-plans',
  '04-decisions',
  '05-outcomes',
  '06-artifacts',
];
const LAYOUT_3_PROJECT_AREAS = [
  '00-notes',
  '01-intents',
  '02-specs',
  '03-missions',
  '04-plans',
  '05-decisions',
  '06-outcomes',
  '07-artifacts',
];

const RELEASES = [
  {
    label: 'Pipes 1.0.1 (adopted legacy comparison baseline)',
    releaseRoot: path.join(REPO_ROOT, 'framework-releases/1.0.1'),
    manifestPath: path.join(REPO_ROOT, 'framework-releases/1.0.1', MANIFEST_FILE),
    archivePath: path.join(REPO_ROOT, 'framework-releases/1.0.1', BASELINE_ARCHIVE_FILE),
    expectedVersion: '1.0.1',
    expectedManifestSha256: 'f9801e2a23d3b9ec7366209c12addd67795eda10bc9c03f26dba47c84f257ac3',
    expectedArchiveSha256: '1488eb95250d552565a2e7c78f95b653fb2d04c67a0c72d8b0b84920c04ef9dd',
    expectedBaselineDigest: '7d1e6e2ee9b6b210c1bfeaadbbabc9c287ec7b6fd83480b529a3a135c3dea18a',
    expectedManifestSchemaVersion: 1,
    expectedProjectLayoutVersion: undefined,
    expectedProjectAreas: undefined,
  },
  {
    label: 'Pipes 2.1.3 (legacy layout 2 release)',
    releaseRoot: path.join(REPO_ROOT, 'framework-releases/2.1.3'),
    manifestPath: path.join(REPO_ROOT, 'framework-releases/2.1.3', MANIFEST_FILE),
    archivePath: path.join(REPO_ROOT, 'framework-releases/2.1.3', BASELINE_ARCHIVE_FILE),
    expectedVersion: '2.1.3',
    expectedManifestSha256: '48b136ffe3f595027b7aaa96b4b122eb3646d6f3d7158137889477430574bd28',
    expectedArchiveSha256: '41abc6b81a4e2a926104895c28723ca5faac1e981fd5339c64bffae8e7b39af5',
    expectedBaselineDigest: '5c84cb05830ad8b2466f2b584e59b50a6d7e1d095d0d4c6deb06fc711a50a08a',
    expectedManifestSchemaVersion: MANIFEST_SCHEMA_VERSION,
    expectedProjectLayoutVersion: 2,
    expectedProjectAreas: LAYOUT_2_PROJECT_AREAS,
  },
  {
    label: 'Pipes 2.2.0 (legacy layout 3 release)',
    releaseRoot: path.join(REPO_ROOT, 'framework-releases/2.2.0'),
    manifestPath: path.join(REPO_ROOT, 'framework-releases/2.2.0', MANIFEST_FILE),
    archivePath: path.join(REPO_ROOT, 'framework-releases/2.2.0', BASELINE_ARCHIVE_FILE),
    expectedVersion: '2.2.0',
    expectedManifestSha256: 'a2e8c694a1b7e36d1e6f3362f6cd23197a4ce5781661f164f5b4d50a03f198da',
    expectedArchiveSha256: 'e25b17954abd49f7959dcd60729366e7ab55c99e5542527b245352da3f5db0cb',
    expectedBaselineDigest: 'bcc9b6cdbdf7fc8fb934387f7ae262ab5102809864e59fcc30cd89f04c47828f',
    expectedManifestSchemaVersion: MANIFEST_SCHEMA_VERSION,
    expectedProjectLayoutVersion: 3,
    expectedProjectAreas: LAYOUT_3_PROJECT_AREAS,
  },
  {
    label: 'Pipes 2.2.1 (bundled upgrade target)',
    releaseRoot: path.join(REPO_ROOT, '.pipes.example'),
    manifestPath: path.join(REPO_ROOT, '.pipes.example', MANIFEST_FILE),
    archivePath: path.join(REPO_ROOT, '.pipes.example', BASELINE_ARCHIVE_FILE),
    expectedVersion: '2.2.1',
    expectedManifestSha256: '47b6323c6e73b74e5deffc7961c05ba0ccba58180cfec77d7817f2eb2f0378a7',
    expectedArchiveSha256: '63d1c7cbb9e1139879610707295f3296188852122c7df9ee0604cbb427466793',
    expectedBaselineDigest: 'c8ffe3bcb11b4e03db4d35f91034825e793839bedb6b041ea809b230d7ffb42d',
    expectedManifestSchemaVersion: MANIFEST_SCHEMA_VERSION,
    expectedProjectLayoutVersion: 3,
    expectedProjectAreas: LAYOUT_3_PROJECT_AREAS,
  },
];

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function isTracked(relativePath, ownership) {
  return (
    ownership.trackedFiles.includes(relativePath) ||
    ownership.trackedRoots.some((root) => relativePath === root || relativePath.startsWith(`${root}/`))
  );
}

function normalizeRelativePath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  assert(
    normalized.length > 0 &&
      !normalized.startsWith('/') &&
      !normalized.includes('\\') &&
      normalized.split('/').every((segment) => segment.length > 0 && segment !== '.' && segment !== '..'),
    `Unsafe framework path: ${relativePath}`,
  );
  return normalized;
}

function validateAreaName(area) {
  return area.length > 0 && !area.includes('/') && !area.includes('\\') && area !== '.' && area !== '..';
}

function validateManifest(manifest, expectedVersion, expectedBaselineDigest) {
  const release = RELEASES.find((candidate) => candidate.expectedVersion === expectedVersion);
  assert(manifest.manifestSchemaVersion === release.expectedManifestSchemaVersion, 'Unsupported manifestSchemaVersion');
  assert(manifest.projectLayoutVersion === release.expectedProjectLayoutVersion, 'Unsupported projectLayoutVersion');
  assert(manifest.framework === FRAMEWORK, 'Manifest framework must be "pipes"');
  assert(typeof manifest.frameworkVersion === 'string' && SEMVER.test(manifest.frameworkVersion), 'Manifest frameworkVersion must be valid SemVer');
  assert(manifest.frameworkVersion === expectedVersion, `Manifest frameworkVersion must be ${expectedVersion}`);
  assert(manifest.forkControlPath === FORK_CONTROL_FILE, 'Manifest forkControlPath is invalid');
  assert(
    manifest.baselineArchive.path === BASELINE_ARCHIVE_FILE && manifest.baselineArchive.format === 'gzip-json-v1',
    'Manifest baselineArchive descriptor is invalid',
  );
  assert(HEX64.test(manifest.baselineArchive.sha256), 'Manifest baselineArchive.sha256 is invalid');
  assert(HEX64.test(manifest.baselineDigest), 'Manifest baselineDigest is invalid');

  const ownership = ownershipForVersion(manifest.frameworkVersion);
  assert(
    JSON.stringify(manifest.ownership.trackedRoots) === JSON.stringify([...ownership.trackedRoots]) &&
      JSON.stringify(manifest.ownership.trackedFiles) === JSON.stringify([...ownership.trackedFiles]) &&
      JSON.stringify(manifest.ownership.opaqueRoots) === JSON.stringify([...ownership.opaqueRoots]) &&
      JSON.stringify(manifest.ownership.ignoredNames) === JSON.stringify([...ownership.ignoredNames]),
    'Manifest ownership policy does not match the canonical policy for its version',
  );

  assert(
    manifest.projectAreas.every(validateAreaName) &&
      manifest.projectAreas.every((area, index) => index === 0 || manifest.projectAreas[index - 1] < area),
    'Manifest projectAreas must be safe, unique, and sorted',
  );

  assert(
    manifest.files.every((file, index) => index === 0 || manifest.files[index - 1].path < file.path),
    'Manifest file paths must be unique and sorted',
  );

  for (const file of manifest.files) {
    const normalized = normalizeRelativePath(file.path);
    assert(normalized === file.path && !file.path.includes('\\'), `Manifest contains a non-canonical path: ${file.path}`);
    assert(isTracked(file.path, ownership), `Manifest contains an unowned or unsafe path: ${file.path}`);
    assert(file.encoding === 'utf-8', `Manifest encoding is invalid: ${file.path}`);
    assert(HEX64.test(file.sha256), `Manifest file sha256 is invalid: ${file.path}`);
  }

  const recomputed = inventoryDigest(
    BASELINE_DIGEST_DOMAIN,
    manifest.files.map((file) => ({ path: file.path, size: file.size, sha256: file.sha256 })),
    manifest.projectAreas,
  );
  assert(recomputed === manifest.baselineDigest, 'Manifest baselineDigest does not match the indexed files');
  if (expectedBaselineDigest) {
    assert(manifest.baselineDigest === expectedBaselineDigest, `Manifest baselineDigest must be pinned to ${expectedBaselineDigest}`);
  }
}

function validateBaselineArchive(manifest, compressed) {
  assert(compressed.length === manifest.baselineArchive.size, 'Baseline archive compressed size is invalid');
  assert(sha256(compressed) === manifest.baselineArchive.sha256, 'Baseline archive compressed sha256 is invalid');

  const uncompressed = gunzipSync(compressed);
  assert(uncompressed.length === manifest.baselineArchive.uncompressedSize, 'Baseline archive uncompressed size is invalid');

  const archive = JSON.parse(uncompressed.toString('utf8'));
  assert(archive.baselineArchiveSchemaVersion === BASELINE_ARCHIVE_SCHEMA_VERSION, 'Unsupported baselineArchiveSchemaVersion');
  assert(archive.framework === manifest.framework, 'Archive framework does not match manifest');
  assert(archive.frameworkVersion === manifest.frameworkVersion, 'Archive frameworkVersion does not match manifest');
  assert(archive.baselineDigest === manifest.baselineDigest, 'Archive baselineDigest does not match manifest');
  assert(Array.isArray(archive.files) && archive.files.length === manifest.files.length, 'Archive file count does not match manifest');

  for (const [archived, indexed] of archive.files.map((file, index) => [file, manifest.files[index]])) {
    const content = Buffer.from(archived.content, 'utf8');
    assert(archived.path === indexed.path, `Archive file path mismatch: ${archived.path}`);
    assert(archived.encoding === indexed.encoding, `Archive file encoding mismatch: ${archived.path}`);
    assert(archived.size === indexed.size, `Archive file size mismatch: ${archived.path}`);
    assert(archived.sha256 === indexed.sha256, `Archive file sha256 mismatch: ${archived.path}`);
    assert(content.length === archived.size, `Archive file content size mismatch: ${archived.path}`);
    assert(sha256(content) === archived.sha256, `Archive file content hash mismatch: ${archived.path}`);
  }
}

async function validateRelease(release) {
  const manifestBytes = await readFile(release.manifestPath);
  const archiveBytes = await readFile(release.archivePath);

  const manifestSha = sha256(manifestBytes);
  if (release.expectedManifestSha256) {
    assert(manifestSha === release.expectedManifestSha256, `${release.label}: manifest sha256 drifted from pinned value`);
  }

  const archiveSha = sha256(archiveBytes);
  if (release.expectedArchiveSha256) {
    assert(archiveSha === release.expectedArchiveSha256, `${release.label}: archive sha256 drifted from pinned value`);
  }

  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  validateManifest(manifest, release.expectedVersion, release.expectedBaselineDigest);
  validateBaselineArchive(manifest, archiveBytes);
  if (release.expectedProjectAreas) {
    assert(
      JSON.stringify(manifest.projectAreas) === JSON.stringify(release.expectedProjectAreas),
      `${release.label}: canonical project areas are incomplete or out of order`,
    );
    // Only a release that ships a templates tree is checked for area templates;
    // legacy releases keep only their manifest and baseline archive.
    const projectRoot = path.join(release.releaseRoot, 'project');
    if (await pathExists(projectRoot)) {
      for (const area of release.expectedProjectAreas) {
        for (const name of ['README.md', 'config.md']) {
          const templatePath = path.join(projectRoot, area, name);
          assert(await pathExists(templatePath), `${release.label}: canonical template is missing: ${area}/${name}`);
          const bytes = await readFile(templatePath);
          assert(bytes.length > 0, `${release.label}: canonical template is empty: ${area}/${name}`);
        }
      }
    }
  }

  return {
    label: release.label,
    version: manifest.frameworkVersion,
    files: manifest.files.length,
    baselineDigest: manifest.baselineDigest,
  };
}

async function main() {
  const results = [];
  for (const release of RELEASES) {
    try {
      results.push(await validateRelease(release));
    } catch (error) {
      console.error(`[check-pipes-framework-release-assets] FAILED: ${release.label}`);
      console.error(`  ${error.message}`);
      process.exit(1);
    }
  }

  for (const result of results) {
    console.log(
      `[check-pipes-framework-release-assets] OK ${result.label}: v${result.version} · ${result.files} files · baseline ${result.baselineDigest.slice(0, 12)}…`,
    );
  }
}

main();
