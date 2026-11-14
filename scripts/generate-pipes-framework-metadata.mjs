#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

export const MANIFEST_SCHEMA_VERSION = 2;
export const PROJECT_LAYOUT_VERSION = 3;
export const SUPPORTED_PROJECT_LAYOUT_VERSIONS = Object.freeze([2, 3]);

/** Framework 2.2.0 and later use project layout 3; earlier 2.x releases use layout 2. */
export function projectLayoutVersionFor(frameworkVersion) {
  const [major, minor] = String(frameworkVersion).split('.').map((part) => Number.parseInt(part, 10));
  if (major !== 2) return undefined;
  return minor >= 2 ? 3 : 2;
}
export const FORK_CONTROL_SCHEMA_VERSION = 1;
export const FRAMEWORK = 'pipes';
export const MANIFEST_FILE = 'manifest.json';
export const FORK_CONTROL_FILE = 'framework-fork.json';
export const BASELINE_ARCHIVE_FILE = 'framework-baseline.json.gz';

export const OWNERSHIP = Object.freeze({
  trackedRoots: [
    'ai-instructions',
    'team',
    'utils/fragments',
    'utils/pipelines',
    'utils/rules',
    'utils/scripts',
  ],
  trackedFiles: ['README.md', 'utils/issues/.gitkeep', 'utils/issues/README.md'],
  opaqueRoots: ['project', 'utils/configs', 'utils/state', 'utils/issues'],
  ignoredNames: ['.DS_Store', MANIFEST_FILE, BASELINE_ARCHIVE_FILE, FORK_CONTROL_FILE],
});

export const V2_OWNERSHIP = Object.freeze({
  ...OWNERSHIP,
  trackedRoots: [...OWNERSHIP.trackedRoots, 'utils/loops'],
  trackedFiles: [...OWNERSHIP.trackedFiles, 'utils/mapping/README.md'],
});

export function ownershipForVersion(version) {
  const major = String(version).split('.', 1)[0];
  if (major === '1') return OWNERSHIP;
  if (major === '2') return V2_OWNERSHIP;
  throw new Error(`Unsupported framework major: ${major}`);
}

const textDecoder = new TextDecoder('utf-8', { fatal: true });
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'));
}

function sortUtf8(values) {
  return [...values].sort(compareUtf8);
}

function u64(value) {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(BigInt(value));
  return bytes;
}

function updateLengthPrefixed(hash, value) {
  const bytes = Buffer.from(value, 'utf8');
  hash.update(u64(bytes.length));
  hash.update(bytes);
}

export function inventoryDigest(domain, files, projectAreas) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(domain, 'utf8'));
  hash.update(Buffer.from([0]));
  for (const file of [...files].sort((left, right) => compareUtf8(left.path, right.path))) {
    hash.update(Buffer.from([1]));
    updateLengthPrefixed(hash, file.path);
    hash.update(u64(file.size));
    hash.update(Buffer.from(file.sha256, 'hex'));
  }
  for (const area of sortUtf8(projectAreas)) {
    hash.update(Buffer.from([2]));
    updateLengthPrefixed(hash, area);
  }
  return hash.digest('hex');
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function normalizeRelativePath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (
    normalized.length === 0
    || normalized.startsWith('/')
    || normalized.includes('\\')
    || normalized.split('/').some((segment) => segment.length === 0 || segment === '.' || segment === '..')
  ) {
    throw new Error(`Unsafe framework path: ${relativePath}`);
  }
  return normalized;
}

async function pathMetadata(target) {
  try {
    return await lstat(target);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function assertRealEntry(metadata, relativePath) {
  if (metadata.isSymbolicLink()) {
    throw new Error(`Framework metadata does not allow symlinks: ${relativePath}`);
  }
}

async function snapshotFile(root, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const absolutePath = path.join(root, ...normalized.split('/'));
  const metadata = await pathMetadata(absolutePath);
  if (!metadata) return null;
  assertRealEntry(metadata, normalized);
  if (!metadata.isFile()) {
    throw new Error(`Tracked framework path is not a file: ${normalized}`);
  }
  const bytes = await readFile(absolutePath);
  let content;
  try {
    content = textDecoder.decode(bytes);
  } catch {
    throw new Error(`Tracked framework file is not valid UTF-8: ${normalized}`);
  }
  return {
    path: normalized,
    encoding: 'utf-8',
    size: bytes.length,
    sha256: sha256(bytes),
    content,
  };
}

async function walkTrackedRoot(root, relativeRoot, snapshots, ownership) {
  const normalizedRoot = normalizeRelativePath(relativeRoot);
  const absoluteRoot = path.join(root, ...normalizedRoot.split('/'));
  const metadata = await pathMetadata(absoluteRoot);
  if (!metadata) return;
  assertRealEntry(metadata, normalizedRoot);
  if (!metadata.isDirectory()) {
    throw new Error(`Tracked framework root is not a directory: ${normalizedRoot}`);
  }
  const entries = await readdir(absoluteRoot, { withFileTypes: true });
  entries.sort((left, right) => compareUtf8(left.name, right.name));
  for (const entry of entries) {
    if (ownership.ignoredNames.includes(entry.name)) continue;
    const relativePath = `${normalizedRoot}/${entry.name}`;
    const absolutePath = path.join(root, ...relativePath.split('/'));
    const childMetadata = await lstat(absolutePath);
    assertRealEntry(childMetadata, relativePath);
    if (childMetadata.isDirectory()) {
      await walkTrackedRoot(root, relativePath, snapshots, ownership);
    } else if (childMetadata.isFile()) {
      const snapshot = await snapshotFile(root, relativePath);
      if (snapshot) snapshots.push(snapshot);
    } else {
      throw new Error(`Unsupported framework entry type: ${relativePath}`);
    }
  }
}

export async function scanFramework(root, frameworkVersion = '1.0.0') {
  const ownership = ownershipForVersion(frameworkVersion);
  const files = [];
  for (const trackedRoot of ownership.trackedRoots) {
    await walkTrackedRoot(root, trackedRoot, files, ownership);
  }
  for (const trackedFile of ownership.trackedFiles) {
    const snapshot = await snapshotFile(root, trackedFile);
    if (snapshot) files.push(snapshot);
  }
  files.sort((left, right) => compareUtf8(left.path, right.path));
  const seen = new Set();
  for (const file of files) {
    if (seen.has(file.path)) throw new Error(`Duplicate framework path: ${file.path}`);
    seen.add(file.path);
  }

  const projectAreas = [];
  const projectRoot = path.join(root, 'project');
  const projectMetadata = await pathMetadata(projectRoot);
  if (projectMetadata) {
    assertRealEntry(projectMetadata, 'project');
    if (!projectMetadata.isDirectory()) throw new Error('Project root is not a directory: project');
    const entries = await readdir(projectRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (ownership.ignoredNames.includes(entry.name)) continue;
      const entryMetadata = await lstat(path.join(projectRoot, entry.name));
      assertRealEntry(entryMetadata, `project/${entry.name}`);
      if (entryMetadata.isDirectory()) projectAreas.push(entry.name);
    }
  }

  return { files, projectAreas: sortUtf8(projectAreas) };
}

export function buildBaselineArchive(frameworkVersion, inventory) {
  if (!semverPattern.test(frameworkVersion)) {
    throw new Error(`Invalid framework semantic version: ${frameworkVersion}`);
  }
  const baselineDigest = inventoryDigest('pipes-framework-baseline-v1', inventory.files, inventory.projectAreas);
  const payload = {
    baselineArchiveSchemaVersion: 1,
    framework: FRAMEWORK,
    frameworkVersion,
    baselineDigest,
    files: inventory.files.map((file) => ({ ...file })),
  };
  const uncompressed = Buffer.from(canonicalJson(payload), 'utf8');
  const compressed = gzipSync(uncompressed, { level: 9, mtime: 0 });
  return { payload, uncompressed, compressed };
}

/**
 * Gzip output depends on the zlib build, so two machines can compress the same baseline to
 * different bytes. When the committed archive holds exactly the expected baseline, its bytes stay
 * canonical; a fresh compression is used only when the baseline content changed.
 */
export function reuseEquivalentArchive(expected, committedCompressed) {
  if (!committedCompressed) return expected;
  let uncompressed;
  try {
    uncompressed = gunzipSync(committedCompressed);
  } catch {
    return expected;
  }
  return uncompressed.equals(expected.uncompressed) ? { ...expected, compressed: Buffer.from(committedCompressed) } : expected;
}

async function readOptional(target) {
  try {
    return await readFile(target);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export function buildManifest(frameworkVersion, inventory, archive = buildBaselineArchive(frameworkVersion, inventory)) {
  if (!semverPattern.test(frameworkVersion)) {
    throw new Error(`Invalid framework semantic version: ${frameworkVersion}`);
  }
  const isV2 = String(frameworkVersion).split('.', 1)[0] === '2';
  return {
    manifestSchemaVersion: isV2 ? MANIFEST_SCHEMA_VERSION : 1,
    ...(isV2 ? { projectLayoutVersion: projectLayoutVersionFor(frameworkVersion) } : {}),
    framework: FRAMEWORK,
    frameworkVersion,
    baselineDigest: inventoryDigest('pipes-framework-baseline-v1', inventory.files, inventory.projectAreas),
    baselineArchive: {
      path: BASELINE_ARCHIVE_FILE,
      format: 'gzip-json-v1',
      size: archive.compressed.length,
      uncompressedSize: archive.uncompressed.length,
      sha256: sha256(archive.compressed),
    },
    forkControlPath: FORK_CONTROL_FILE,
    ownership: ownershipForVersion(frameworkVersion),
    projectAreas: [...inventory.projectAreas],
    files: inventory.files.map(({ path: filePath, encoding, size, sha256: digest }) => ({
      path: filePath,
      encoding,
      size,
      sha256: digest,
    })),
  };
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${label} must be a string array`);
  }
  const sorted = sortUtf8(value);
  if (new Set(value).size !== value.length || value.some((entry, index) => entry !== sorted[index])) {
    throw new Error(`${label} must be unique and sorted by UTF-8 bytes`);
  }
}

export function validateManifest(manifest) {
  assertObject(manifest, 'Manifest');
  if (
    !(
      (manifest.manifestSchemaVersion === 1 && manifest.projectLayoutVersion === undefined)
      || (manifest.manifestSchemaVersion === MANIFEST_SCHEMA_VERSION
        && SUPPORTED_PROJECT_LAYOUT_VERSIONS.includes(manifest.projectLayoutVersion))
    )
  ) throw new Error('Unsupported manifestSchemaVersion or projectLayoutVersion');
  if (manifest.framework !== FRAMEWORK) throw new Error('Manifest framework must be pipes');
  if (typeof manifest.frameworkVersion !== 'string' || !semverPattern.test(manifest.frameworkVersion)) throw new Error('Manifest frameworkVersion must be valid SemVer');
  if (manifest.forkControlPath !== FORK_CONTROL_FILE) throw new Error('Manifest forkControlPath is invalid');
  assertObject(manifest.baselineArchive, 'Manifest baselineArchive');
  if (
    manifest.baselineArchive.path !== BASELINE_ARCHIVE_FILE
    || manifest.baselineArchive.format !== 'gzip-json-v1'
    || !Number.isSafeInteger(manifest.baselineArchive.size)
    || manifest.baselineArchive.size < 0
    || !Number.isSafeInteger(manifest.baselineArchive.uncompressedSize)
    || manifest.baselineArchive.uncompressedSize < 0
    || !/^[0-9a-f]{64}$/.test(manifest.baselineArchive.sha256)
  ) throw new Error('Manifest baselineArchive is invalid');
  if (JSON.stringify(manifest.ownership) !== JSON.stringify(ownershipForVersion(manifest.frameworkVersion))) throw new Error('Manifest ownership policy is invalid');
  assertStringArray(manifest.projectAreas, 'Manifest projectAreas');
  if (!Array.isArray(manifest.files)) throw new Error('Manifest files must be an array');
  let previousPath = null;
  const digestFiles = [];
  for (const file of manifest.files) {
    assertObject(file, 'Manifest file');
    const normalized = normalizeRelativePath(file.path);
    if (normalized !== file.path) throw new Error(`Manifest path is not normalized: ${file.path}`);
    if (previousPath !== null && compareUtf8(previousPath, file.path) >= 0) throw new Error('Manifest file paths must be unique and sorted');
    previousPath = file.path;
    if (file.encoding !== 'utf-8') throw new Error(`Manifest file encoding is invalid: ${file.path}`);
    if (!Number.isSafeInteger(file.size) || file.size < 0) throw new Error(`Manifest file size is invalid: ${file.path}`);
    if (!/^[0-9a-f]{64}$/.test(file.sha256)) throw new Error(`Manifest file hash is invalid: ${file.path}`);
    digestFiles.push({ path: file.path, size: file.size, sha256: file.sha256 });
  }
  const expectedDigest = inventoryDigest('pipes-framework-baseline-v1', digestFiles, manifest.projectAreas);
  if (manifest.baselineDigest !== expectedDigest) throw new Error('Manifest baselineDigest is invalid');
  return manifest;
}

export function validateBaselineArchive(manifest, compressed) {
  validateManifest(manifest);
  if (!Buffer.isBuffer(compressed)) compressed = Buffer.from(compressed);
  if (compressed.length !== manifest.baselineArchive.size || sha256(compressed) !== manifest.baselineArchive.sha256) {
    throw new Error('Baseline archive compressed hash or size is invalid');
  }
  let uncompressed;
  try {
    uncompressed = gunzipSync(compressed);
  } catch (error) {
    throw new Error(`Baseline archive gzip is invalid: ${error.message}`);
  }
  if (uncompressed.length !== manifest.baselineArchive.uncompressedSize) throw new Error('Baseline archive uncompressed size is invalid');
  const archive = JSON.parse(uncompressed.toString('utf8'));
  assertObject(archive, 'Baseline archive');
  if (
    archive.baselineArchiveSchemaVersion !== 1
    || archive.framework !== manifest.framework
    || archive.frameworkVersion !== manifest.frameworkVersion
    || archive.baselineDigest !== manifest.baselineDigest
    || !Array.isArray(archive.files)
    || archive.files.length !== manifest.files.length
  ) throw new Error('Baseline archive binding is invalid');
  for (let index = 0; index < archive.files.length; index += 1) {
    const archived = archive.files[index];
    const indexed = manifest.files[index];
    assertObject(archived, 'Baseline archive file');
    if (typeof archived.content !== 'string') throw new Error(`Baseline archive content is invalid: ${archived.path}`);
    const bytes = Buffer.from(archived.content, 'utf8');
    if (
      archived.path !== indexed.path
      || archived.encoding !== indexed.encoding
      || archived.size !== indexed.size
      || archived.sha256 !== indexed.sha256
      || bytes.length !== archived.size
      || sha256(bytes) !== archived.sha256
    ) throw new Error(`Baseline archive file does not match the manifest: ${archived.path}`);
  }
  return archive;
}

export function buildForkControl(manifest, inventory, baselineRelation) {
  validateManifest(manifest);
  if (!['origin', 'adopted', 'unresolved'].includes(baselineRelation)) {
    throw new Error(`Invalid baseline relation: ${baselineRelation}`);
  }
  const baselineByPath = new Map(manifest.files.map((file) => [file.path, file]));
  const currentByPath = new Map(inventory.files.map((file) => [file.path, file]));
  const created = [];
  const modified = [];
  const deleted = [];
  let unchanged = 0;
  for (const current of inventory.files) {
    const baseline = baselineByPath.get(current.path);
    if (!baseline) {
      created.push({ path: current.path, size: current.size, sha256: current.sha256 });
    } else if (baseline.size !== current.size || baseline.sha256 !== current.sha256) {
      modified.push({ path: current.path, size: current.size, sha256: current.sha256 });
    } else {
      unchanged += 1;
    }
  }
  for (const baseline of manifest.files) {
    if (!currentByPath.has(baseline.path)) deleted.push(baseline.path);
  }
  const baselineAreas = new Set(manifest.projectAreas);
  const currentAreas = new Set(inventory.projectAreas);
  return {
    forkControlSchemaVersion: FORK_CONTROL_SCHEMA_VERSION,
    framework: FRAMEWORK,
    frameworkVersion: manifest.frameworkVersion,
    baselineDigest: manifest.baselineDigest,
    baselineRelation,
    forkDigest: inventoryDigest('pipes-framework-fork-v1', inventory.files, inventory.projectAreas),
    summary: {
      unchanged,
      created: created.length,
      modified: modified.length,
      deleted: deleted.length,
    },
    created,
    modified,
    deleted,
    projectAreaChanges: {
      created: inventory.projectAreas.filter((area) => !baselineAreas.has(area)),
      deleted: manifest.projectAreas.filter((area) => !currentAreas.has(area)),
    },
  };
}

export function validateForkControl(control, manifest) {
  assertObject(control, 'Fork control');
  if (control.forkControlSchemaVersion !== FORK_CONTROL_SCHEMA_VERSION) throw new Error('Unsupported forkControlSchemaVersion');
  if (control.framework !== manifest.framework || control.frameworkVersion !== manifest.frameworkVersion || control.baselineDigest !== manifest.baselineDigest) throw new Error('Fork control baseline binding is invalid');
  if (!['origin', 'adopted', 'unresolved'].includes(control.baselineRelation)) throw new Error('Fork control baselineRelation is invalid');
  return control;
}

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(target) {
  return JSON.parse(await readFile(target, 'utf8'));
}

async function atomicWrite(target, bytes) {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temporary, bytes, { flag: 'wx' });
  await rename(temporary, target);
}

async function writeIfChanged(target, content) {
  let current = null;
  try {
    current = await readFile(target);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const desired = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  if (current?.equals(desired)) return false;
  await atomicWrite(target, desired);
  return true;
}

function relationFromExistingControl(control, manifest, fallback = 'unresolved') {
  try {
    validateForkControl(control, manifest);
    return control.baselineRelation;
  } catch {
    return fallback;
  }
}

function parseArguments(argv) {
  const options = {
    mode: null,
    frameworkVersion: null,
    initializeInstalledOrigin: false,
    initializeInstalledAdopted: false,
    starterOnly: false,
    root: process.cwd(),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (['--write', '--check', '--bootstrap-starter'].includes(argument)) {
      if (options.mode) throw new Error('Choose exactly one of --write, --check, or --bootstrap-starter');
      options.mode = argument.slice(2);
    } else if (argument === '--framework-version') {
      options.frameworkVersion = argv[++index] ?? null;
    } else if (argument === '--initialize-installed-origin') {
      options.initializeInstalledOrigin = true;
    } else if (argument === '--initialize-installed-adopted') {
      options.initializeInstalledAdopted = true;
    } else if (argument === '--starter-only') {
      options.starterOnly = true;
    } else if (argument === '--root') {
      options.root = path.resolve(argv[++index] ?? '');
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (!options.mode) throw new Error('Choose one of --write, --check, or --bootstrap-starter');
  if (options.initializeInstalledOrigin && options.initializeInstalledAdopted) throw new Error('Installed initialization relation is ambiguous');
  if (options.starterOnly && (options.initializeInstalledOrigin || options.initializeInstalledAdopted)) {
    throw new Error('--starter-only cannot initialize an installed .pipes');
  }
  return options;
}

export async function run(options) {
  const starterRoot = path.join(options.root, '.pipes.example');
  const installedRoot = path.join(options.root, '.pipes');
  const starterManifestPath = path.join(starterRoot, MANIFEST_FILE);
  const starterArchivePath = path.join(starterRoot, BASELINE_ARCHIVE_FILE);
  const starterControlPath = path.join(starterRoot, FORK_CONTROL_FILE);
  const installedManifestPath = path.join(installedRoot, MANIFEST_FILE);
  const installedArchivePath = path.join(installedRoot, BASELINE_ARCHIVE_FILE);
  const installedControlPath = path.join(installedRoot, FORK_CONTROL_FILE);
  let committedStarter = null;
  try {
    committedStarter = await readJson(starterManifestPath);
  } catch (error) {
    if (error?.code !== 'ENOENT' && options.mode !== 'bootstrap-starter') throw error;
  }

  let frameworkVersion = options.frameworkVersion;
  if (options.mode === 'bootstrap-starter') {
    if (!frameworkVersion) throw new Error('--bootstrap-starter requires --framework-version');
  } else {
    if (!committedStarter || typeof committedStarter.frameworkVersion !== 'string') throw new Error('Starter manifest is missing a frameworkVersion');
    frameworkVersion ??= committedStarter.frameworkVersion;
  }
  const starterInventory = await scanFramework(starterRoot, frameworkVersion);
  const expectedArchive = reuseEquivalentArchive(buildBaselineArchive(frameworkVersion, starterInventory), await readOptional(starterArchivePath));
  const expectedStarter = buildManifest(frameworkVersion, starterInventory, expectedArchive);
  const expectedStarterControl = buildForkControl(expectedStarter, starterInventory, 'origin');

  if (options.mode === 'check') {
    validateManifest(committedStarter);
    const committedArchive = await readFile(starterArchivePath);
    validateBaselineArchive(committedStarter, committedArchive);
    const committedControl = validateForkControl(await readJson(starterControlPath), committedStarter);
    const expectedManifestBytes = canonicalJson(expectedStarter);
    const committedManifestBytes = await readFile(starterManifestPath, 'utf8');
    if (committedManifestBytes !== expectedManifestBytes) throw new Error('Starter manifest is stale; baseline changes require a framework-version bump and regeneration');
    if (!committedArchive.equals(expectedArchive.compressed)) throw new Error('Starter baseline archive is stale or non-deterministic');
    if (canonicalJson(committedControl) !== canonicalJson(expectedStarterControl)) throw new Error('Starter fork control is stale');
  } else {
    if (options.mode === 'write' && committedStarter?.baselineDigest && committedStarter.baselineDigest !== expectedStarter.baselineDigest && (!options.frameworkVersion || options.frameworkVersion === committedStarter.frameworkVersion)) {
      throw new Error('Bundled baseline changed; pass a new --framework-version before writing metadata');
    }
    await writeIfChanged(starterArchivePath, expectedArchive.compressed);
    await writeIfChanged(starterManifestPath, canonicalJson(expectedStarter));
    await writeIfChanged(starterControlPath, canonicalJson(expectedStarterControl));
  }

  // A framework source repository (pipes-app) holds no installed `.pipes`; skip the installed checks.
  if (options.starterOnly) {
    return { manifest: expectedStarter, archive: expectedArchive, starterControl: expectedStarterControl, installedControl: null };
  }

  let installedManifest = null;
  try {
    const candidate = validateManifest(await readJson(installedManifestPath));
    validateBaselineArchive(candidate, await readFile(installedArchivePath));
    installedManifest = candidate;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const initializationRelation = options.initializeInstalledOrigin
    ? 'origin'
    : options.initializeInstalledAdopted
      ? 'adopted'
      : null;
  if (!installedManifest && initializationRelation) {
    if (options.mode === 'check') throw new Error('Installed manifest is missing');
    await atomicWrite(installedArchivePath, expectedArchive.compressed);
    await atomicWrite(installedManifestPath, canonicalJson(expectedStarter));
    installedManifest = expectedStarter;
  }
  if (!installedManifest) {
    if (options.mode === 'check') throw new Error('Installed manifest is missing');
    return { manifest: expectedStarter, archive: expectedArchive, starterControl: expectedStarterControl, installedControl: null };
  }

  const installedInventory = await scanFramework(installedRoot, installedManifest.frameworkVersion);
  let existingInstalledControl = null;
  try {
    existingInstalledControl = await readJson(installedControlPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const relation = initializationRelation ?? relationFromExistingControl(existingInstalledControl, installedManifest);
  const expectedInstalledControl = buildForkControl(installedManifest, installedInventory, relation);
  if (options.mode === 'check') {
    validateForkControl(existingInstalledControl, installedManifest);
    if (canonicalJson(existingInstalledControl) !== canonicalJson(expectedInstalledControl)) throw new Error('Installed fork control is stale');
  } else {
    await writeIfChanged(installedControlPath, canonicalJson(expectedInstalledControl));
  }
  return { manifest: expectedStarter, archive: expectedArchive, starterControl: expectedStarterControl, installedControl: expectedInstalledControl };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const result = await run(parseArguments(process.argv.slice(2)));
    const installedSummary = result.installedControl?.summary;
    console.log(`Pipes framework ${result.manifest.frameworkVersion}: ${result.manifest.files.length} baseline files, ${Buffer.byteLength(canonicalJson(result.manifest))} manifest bytes, ${result.archive.compressed.length} compressed baseline bytes`);
    if (installedSummary) console.log(`Fork: ${installedSummary.unchanged} unchanged, ${installedSummary.created} created, ${installedSummary.modified} modified, ${installedSummary.deleted} deleted`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
