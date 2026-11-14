#!/usr/bin/env node
const { createHash } = require('node:crypto');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { gunzipSync, gzipSync } = require('node:zlib');

const MANIFEST_SCHEMA_VERSION = 2;
// Layout 3 renames the intent area to `01-intents`, adds `02-specs`, and renumbers the later areas.
// Layout 2 manifests stay readable, so an install from an earlier release can still be compared.
const PROJECT_LAYOUT_VERSION = 3;
const SUPPORTED_PROJECT_LAYOUT_VERSIONS = [2, 3];
const BASELINE_ARCHIVE_SCHEMA_VERSION = 1;
const FORK_CONTROL_SCHEMA_VERSION = 1;
const FRAMEWORK = 'pipes';
const MANIFEST_FILE = 'manifest.json';
const BASELINE_ARCHIVE_FILE = 'framework-baseline.json.gz';
const FORK_CONTROL_FILE = 'framework-fork.json';
const BASELINE_DOMAIN = 'pipes-framework-baseline-v1';
const FORK_DOMAIN = 'pipes-framework-fork-v1';
const RELATIONS = ['origin', 'adopted', 'unresolved'];
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const OWNERSHIP = Object.freeze({
  trackedRoots: [
    'ai-instructions',
    'team',
    'utils/fragments',
    'utils/pipelines',
    'utils/rules',
    'utils/scripts',
    'utils/loops',
  ],
  trackedFiles: ['README.md', 'utils/issues/.gitkeep', 'utils/issues/README.md', 'utils/mapping/README.md'],
  opaqueRoots: ['project', 'utils/configs', 'utils/state', 'utils/issues'],
  ignoredNames: ['.DS_Store', MANIFEST_FILE, BASELINE_ARCHIVE_FILE, FORK_CONTROL_FILE],
});
const decoder = new TextDecoder('utf-8', { fatal: true });

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'));
}

function sortUtf8(values) {
  return [...values].sort(compareUtf8);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function u64(value) {
  const number = BigInt(value);
  if (number < 0n || number > 0xffffffffffffffffn) throw new Error(`Unsigned 64-bit value out of range: ${value}`);
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(number);
  return bytes;
}

function updateLengthPrefixed(hash, value) {
  const bytes = Buffer.from(value, 'utf8');
  hash.update(u64(bytes.length));
  hash.update(bytes);
}

function inventoryDigest(domain, files, projectAreas) {
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

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeRelativePath(relativePath) {
  const value = String(relativePath);
  const normalized = value.split(path.sep).join('/');
  if (
    !normalized
    || normalized.startsWith('/')
    || normalized.includes('\\')
    || normalized.split('/').some((segment) => !segment || segment === '.' || segment === '..')
  ) throw new Error(`Unsafe framework path: ${relativePath}`);
  return normalized;
}

async function metadata(target) {
  try {
    return await fsp.lstat(target);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function assertRealEntry(entry, relativePath) {
  if (entry.isSymbolicLink()) throw new Error(`Framework provenance does not allow symlinks: ${relativePath}`);
}

async function snapshotFile(root, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const absolute = path.join(root, ...normalized.split('/'));
  const entry = await metadata(absolute);
  if (!entry) return null;
  assertRealEntry(entry, normalized);
  if (!entry.isFile()) throw new Error(`Tracked framework path is not a file: ${normalized}`);
  const bytes = await fsp.readFile(absolute);
  let content;
  try {
    content = decoder.decode(bytes);
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

async function walkTrackedRoot(root, relativeRoot, snapshots) {
  const normalizedRoot = normalizeRelativePath(relativeRoot);
  const absoluteRoot = path.join(root, ...normalizedRoot.split('/'));
  const rootEntry = await metadata(absoluteRoot);
  if (!rootEntry) return;
  assertRealEntry(rootEntry, normalizedRoot);
  if (!rootEntry.isDirectory()) throw new Error(`Tracked framework root is not a directory: ${normalizedRoot}`);
  const entries = await fsp.readdir(absoluteRoot, { withFileTypes: true });
  entries.sort((left, right) => compareUtf8(left.name, right.name));
  for (const entry of entries) {
    if (OWNERSHIP.ignoredNames.includes(entry.name)) continue;
    const relativePath = `${normalizedRoot}/${entry.name}`;
    const child = await fsp.lstat(path.join(root, ...relativePath.split('/')));
    assertRealEntry(child, relativePath);
    if (child.isDirectory()) await walkTrackedRoot(root, relativePath, snapshots);
    else if (child.isFile()) snapshots.push(await snapshotFile(root, relativePath));
    else throw new Error(`Unsupported framework entry type: ${relativePath}`);
  }
}

async function scanFramework(root) {
  const absoluteRoot = path.resolve(root);
  const files = [];
  for (const trackedRoot of OWNERSHIP.trackedRoots) await walkTrackedRoot(absoluteRoot, trackedRoot, files);
  for (const trackedFile of OWNERSHIP.trackedFiles) {
    const snapshot = await snapshotFile(absoluteRoot, trackedFile);
    if (snapshot) files.push(snapshot);
  }
  files.sort((left, right) => compareUtf8(left.path, right.path));
  const seen = new Set();
  for (const file of files) {
    if (!file || seen.has(file.path)) throw new Error(`Duplicate framework path: ${file?.path}`);
    seen.add(file.path);
  }

  const projectAreas = [];
  const projectRoot = path.join(absoluteRoot, 'project');
  const projectEntry = await metadata(projectRoot);
  if (projectEntry) {
    assertRealEntry(projectEntry, 'project');
    if (!projectEntry.isDirectory()) throw new Error('Project root is not a directory: project');
    const entries = await fsp.readdir(projectRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (OWNERSHIP.ignoredNames.includes(entry.name)) continue;
      const child = await fsp.lstat(path.join(projectRoot, entry.name));
      assertRealEntry(child, `project/${entry.name}`);
      if (child.isDirectory()) projectAreas.push(entry.name);
    }
  }
  return { files, projectAreas: sortUtf8(projectAreas) };
}

function assertSemver(version) {
  if (typeof version !== 'string' || !SEMVER.test(version)) throw new Error(`Invalid framework semantic version: ${version}`);
}

function buildBaselineArchive(frameworkVersion, inventory) {
  assertSemver(frameworkVersion);
  const baselineDigest = inventoryDigest(BASELINE_DOMAIN, inventory.files, inventory.projectAreas);
  const payload = {
    baselineArchiveSchemaVersion: BASELINE_ARCHIVE_SCHEMA_VERSION,
    framework: FRAMEWORK,
    frameworkVersion,
    baselineDigest,
    files: inventory.files.map((file) => ({ ...file })),
  };
  const uncompressed = Buffer.from(canonicalJson(payload), 'utf8');
  const compressed = gzipSync(uncompressed, { level: 9, mtime: 0 });
  return { payload, uncompressed, compressed };
}

function buildManifest(frameworkVersion, inventory, archive = buildBaselineArchive(frameworkVersion, inventory)) {
  assertSemver(frameworkVersion);
  return {
    manifestSchemaVersion: MANIFEST_SCHEMA_VERSION,
    projectLayoutVersion: PROJECT_LAYOUT_VERSION,
    framework: FRAMEWORK,
    frameworkVersion,
    baselineDigest: inventoryDigest(BASELINE_DOMAIN, inventory.files, inventory.projectAreas),
    baselineArchive: {
      path: BASELINE_ARCHIVE_FILE,
      format: 'gzip-json-v1',
      size: archive.compressed.length,
      uncompressedSize: archive.uncompressed.length,
      sha256: sha256(archive.compressed),
    },
    forkControlPath: FORK_CONTROL_FILE,
    ownership: OWNERSHIP,
    projectAreas: [...inventory.projectAreas],
    files: inventory.files.map(({ path: filePath, encoding, size, sha256: digest }) => ({
      path: filePath,
      encoding,
      size,
      sha256: digest,
    })),
  };
}

function buildForkControl(manifest, inventory, baselineRelation) {
  validateManifest(manifest);
  if (!RELATIONS.includes(baselineRelation)) throw new Error(`Invalid baseline relation: ${baselineRelation}`);
  const baselineByPath = new Map(manifest.files.map((file) => [file.path, file]));
  const currentByPath = new Map(inventory.files.map((file) => [file.path, file]));
  const created = [];
  const modified = [];
  const deleted = [];
  let unchanged = 0;
  for (const current of inventory.files) {
    const baseline = baselineByPath.get(current.path);
    if (!baseline) created.push({ path: current.path, size: current.size, sha256: current.sha256 });
    else if (baseline.size !== current.size || baseline.sha256 !== current.sha256) modified.push({ path: current.path, size: current.size, sha256: current.sha256 });
    else unchanged += 1;
  }
  for (const baseline of manifest.files) if (!currentByPath.has(baseline.path)) deleted.push(baseline.path);
  const baselineAreas = new Set(manifest.projectAreas);
  const currentAreas = new Set(inventory.projectAreas);
  return {
    forkControlSchemaVersion: FORK_CONTROL_SCHEMA_VERSION,
    framework: FRAMEWORK,
    frameworkVersion: manifest.frameworkVersion,
    baselineDigest: manifest.baselineDigest,
    baselineRelation,
    forkDigest: inventoryDigest(FORK_DOMAIN, inventory.files, inventory.projectAreas),
    summary: { unchanged, created: created.length, modified: modified.length, deleted: deleted.length },
    created,
    modified,
    deleted,
    projectAreaChanges: {
      created: inventory.projectAreas.filter((area) => !baselineAreas.has(area)),
      deleted: manifest.projectAreas.filter((area) => !currentAreas.has(area)),
    },
  };
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertKeys(value, expected, label) {
  assertObject(value, label);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} fields are invalid`);
}

function assertHash(value, label) {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) throw new Error(`${label} must be a lowercase SHA-256 digest`);
}

function assertSortedStrings(value, label) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) throw new Error(`${label} must be a string array`);
  const sorted = sortUtf8(value);
  if (new Set(value).size !== value.length || value.some((entry, index) => entry !== sorted[index])) throw new Error(`${label} must be unique and sorted by UTF-8 bytes`);
}

function validateManifest(manifest) {
  assertKeys(manifest, ['manifestSchemaVersion', 'projectLayoutVersion', 'framework', 'frameworkVersion', 'baselineDigest', 'baselineArchive', 'forkControlPath', 'ownership', 'projectAreas', 'files'], 'Manifest');
  if (manifest.manifestSchemaVersion !== MANIFEST_SCHEMA_VERSION) throw new Error('Unsupported manifestSchemaVersion');
  if (!SUPPORTED_PROJECT_LAYOUT_VERSIONS.includes(manifest.projectLayoutVersion)) throw new Error('Unsupported projectLayoutVersion');
  if (manifest.framework !== FRAMEWORK) throw new Error('Manifest framework must be pipes');
  assertSemver(manifest.frameworkVersion);
  assertHash(manifest.baselineDigest, 'Manifest baselineDigest');
  if (manifest.forkControlPath !== FORK_CONTROL_FILE) throw new Error('Manifest forkControlPath is invalid');
  assertKeys(manifest.baselineArchive, ['path', 'format', 'size', 'uncompressedSize', 'sha256'], 'Manifest baselineArchive');
  if (manifest.baselineArchive.path !== BASELINE_ARCHIVE_FILE || manifest.baselineArchive.format !== 'gzip-json-v1') throw new Error('Manifest baselineArchive path or format is invalid');
  for (const field of ['size', 'uncompressedSize']) if (!Number.isSafeInteger(manifest.baselineArchive[field]) || manifest.baselineArchive[field] < 0) throw new Error(`Manifest baselineArchive ${field} is invalid`);
  assertHash(manifest.baselineArchive.sha256, 'Manifest baselineArchive sha256');
  if (JSON.stringify(manifest.ownership) !== JSON.stringify(OWNERSHIP)) throw new Error('Manifest ownership policy is invalid');
  assertSortedStrings(manifest.projectAreas, 'Manifest projectAreas');
  if (!Array.isArray(manifest.files)) throw new Error('Manifest files must be an array');
  let previous = null;
  const digestFiles = [];
  for (const file of manifest.files) {
    assertKeys(file, ['path', 'encoding', 'size', 'sha256'], 'Manifest file');
    const normalized = normalizeRelativePath(file.path);
    if (normalized !== file.path || (previous !== null && compareUtf8(previous, file.path) >= 0)) throw new Error('Manifest file paths must be normalized, unique, and sorted');
    previous = file.path;
    if (file.encoding !== 'utf-8') throw new Error(`Manifest file encoding is invalid: ${file.path}`);
    if (!Number.isSafeInteger(file.size) || file.size < 0) throw new Error(`Manifest file size is invalid: ${file.path}`);
    assertHash(file.sha256, `Manifest file hash ${file.path}`);
    digestFiles.push({ path: file.path, size: file.size, sha256: file.sha256 });
  }
  if (manifest.baselineDigest !== inventoryDigest(BASELINE_DOMAIN, digestFiles, manifest.projectAreas)) throw new Error('Manifest baselineDigest is invalid');
  return manifest;
}

function validateBaselineArchive(manifest, compressed) {
  validateManifest(manifest);
  const bytes = Buffer.isBuffer(compressed) ? compressed : Buffer.from(compressed);
  if (bytes.length !== manifest.baselineArchive.size || sha256(bytes) !== manifest.baselineArchive.sha256) throw new Error('Baseline archive compressed hash or size is invalid');
  let uncompressed;
  try {
    uncompressed = gunzipSync(bytes);
  } catch (error) {
    throw new Error(`Baseline archive gzip is invalid: ${error.message}`);
  }
  if (uncompressed.length !== manifest.baselineArchive.uncompressedSize) throw new Error('Baseline archive uncompressed size is invalid');
  let archive;
  try {
    archive = JSON.parse(uncompressed.toString('utf8'));
  } catch (error) {
    throw new Error(`Baseline archive JSON is invalid: ${error.message}`);
  }
  if (uncompressed.toString('utf8') !== canonicalJson(archive)) throw new Error('Baseline archive JSON is not canonical');
  assertKeys(archive, ['baselineArchiveSchemaVersion', 'framework', 'frameworkVersion', 'baselineDigest', 'files'], 'Baseline archive');
  if (archive.baselineArchiveSchemaVersion !== BASELINE_ARCHIVE_SCHEMA_VERSION || archive.framework !== manifest.framework || archive.frameworkVersion !== manifest.frameworkVersion || archive.baselineDigest !== manifest.baselineDigest) throw new Error('Baseline archive binding is invalid');
  if (!Array.isArray(archive.files) || archive.files.length !== manifest.files.length) throw new Error('Baseline archive file inventory is invalid');
  for (let index = 0; index < archive.files.length; index += 1) {
    const archived = archive.files[index];
    const indexed = manifest.files[index];
    assertKeys(archived, ['path', 'encoding', 'size', 'sha256', 'content'], 'Baseline archive file');
    if (typeof archived.content !== 'string') throw new Error(`Baseline archive content is invalid: ${archived.path}`);
    const content = Buffer.from(archived.content, 'utf8');
    if (archived.path !== indexed.path || archived.encoding !== indexed.encoding || archived.size !== indexed.size || archived.sha256 !== indexed.sha256 || content.length !== archived.size || sha256(content) !== archived.sha256) throw new Error(`Baseline archive file does not match the manifest: ${archived.path}`);
  }
  return archive;
}

function validateForkControl(control, manifest) {
  validateManifest(manifest);
  assertKeys(control, ['forkControlSchemaVersion', 'framework', 'frameworkVersion', 'baselineDigest', 'baselineRelation', 'forkDigest', 'summary', 'created', 'modified', 'deleted', 'projectAreaChanges'], 'Fork control');
  if (control.forkControlSchemaVersion !== FORK_CONTROL_SCHEMA_VERSION) throw new Error('Unsupported forkControlSchemaVersion');
  if (control.framework !== manifest.framework || control.frameworkVersion !== manifest.frameworkVersion || control.baselineDigest !== manifest.baselineDigest) throw new Error('Fork control baseline binding is invalid');
  if (!RELATIONS.includes(control.baselineRelation)) throw new Error('Fork control baselineRelation is invalid');
  assertHash(control.forkDigest, 'Fork control forkDigest');
  assertKeys(control.summary, ['unchanged', 'created', 'modified', 'deleted'], 'Fork control summary');
  for (const value of Object.values(control.summary)) if (!Number.isSafeInteger(value) || value < 0) throw new Error('Fork control summary is invalid');
  for (const field of ['created', 'modified']) {
    if (!Array.isArray(control[field])) throw new Error(`Fork control ${field} must be an array`);
    let previous = null;
    for (const entry of control[field]) {
      assertKeys(entry, ['path', 'size', 'sha256'], `Fork control ${field} entry`);
      normalizeRelativePath(entry.path);
      if (previous !== null && compareUtf8(previous, entry.path) >= 0) throw new Error(`Fork control ${field} paths must be unique and sorted`);
      previous = entry.path;
      if (!Number.isSafeInteger(entry.size) || entry.size < 0) throw new Error(`Fork control ${field} size is invalid`);
      assertHash(entry.sha256, `Fork control ${field} hash`);
    }
  }
  assertSortedStrings(control.deleted, 'Fork control deleted');
  assertKeys(control.projectAreaChanges, ['created', 'deleted'], 'Fork control projectAreaChanges');
  assertSortedStrings(control.projectAreaChanges.created, 'Fork control projectAreaChanges.created');
  assertSortedStrings(control.projectAreaChanges.deleted, 'Fork control projectAreaChanges.deleted');
  if (control.summary.created !== control.created.length || control.summary.modified !== control.modified.length || control.summary.deleted !== control.deleted.length) throw new Error('Fork control summary counts are invalid');
  return control;
}

async function readJson(target) {
  const text = await fsp.readFile(target, 'utf8');
  return { value: JSON.parse(text), text };
}

async function atomicWrite(target, content) {
  await fsp.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    await fsp.writeFile(temporary, content, { flag: 'wx' });
    await fsp.rename(temporary, target);
  } catch (error) {
    await fsp.rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

async function writeIfChanged(target, content) {
  const desired = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  let current = null;
  try {
    current = await fsp.readFile(target);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  if (current?.equals(desired)) return false;
  await atomicWrite(target, desired);
  return true;
}

function provenancePaths(root) {
  return {
    manifest: path.join(root, MANIFEST_FILE),
    archive: path.join(root, BASELINE_ARCHIVE_FILE),
    control: path.join(root, FORK_CONTROL_FILE),
  };
}

async function loadImmutableProvenance(root) {
  const paths = provenancePaths(root);
  let manifestRecord;
  let archive;
  try {
    [manifestRecord, archive] = await Promise.all([readJson(paths.manifest), fsp.readFile(paths.archive)]);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error('Manifest and baseline archive are both required');
    throw error;
  }
  const manifest = validateManifest(manifestRecord.value);
  if (manifestRecord.text !== canonicalJson(manifest)) throw new Error('Manifest JSON is not canonical');
  validateBaselineArchive(manifest, archive);
  return { paths, manifest, archive };
}

async function existingRelation(controlPath, manifest, fallback = 'unresolved') {
  try {
    const record = await readJson(controlPath);
    validateForkControl(record.value, manifest);
    return record.value.baselineRelation;
  } catch {
    return fallback;
  }
}

function parseArguments(argv) {
  const options = { root: null, mode: null, frameworkVersion: null, allowBaselineInitialization: false, allowBaselineReplacement: false, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--root') {
      if (options.root !== null) throw new Error('Specify --root exactly once');
      const value = argv[++index];
      if (!value) throw new Error('--root requires a path');
      options.root = path.resolve(value);
    } else if (['--check', '--bootstrap', '--write', '--refresh-fork'].includes(argument)) {
      if (options.mode) throw new Error('Choose exactly one mode');
      options.mode = argument.slice(2);
    } else if (argument === '--framework-version') {
      if (options.frameworkVersion !== null) throw new Error('Specify --framework-version exactly once');
      options.frameworkVersion = argv[++index] ?? null;
    } else if (argument === '--allow-baseline-initialization') options.allowBaselineInitialization = true;
    else if (argument === '--allow-baseline-replacement') options.allowBaselineReplacement = true;
    else if (argument === '--json') options.json = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.root) throw new Error('--root is required');
  if (!options.mode) throw new Error('Choose exactly one of --check, --bootstrap, --write, or --refresh-fork');
  if (options.mode === 'bootstrap') {
    if (!options.allowBaselineInitialization) throw new Error('--bootstrap requires --allow-baseline-initialization');
    if (!options.frameworkVersion) throw new Error('--bootstrap requires --framework-version');
    if (options.allowBaselineReplacement) throw new Error('--bootstrap does not accept --allow-baseline-replacement');
  } else if (options.mode === 'write') {
    if (!options.allowBaselineReplacement) throw new Error('--write requires --allow-baseline-replacement');
    if (!options.frameworkVersion) throw new Error('--write requires --framework-version');
    if (options.allowBaselineInitialization) throw new Error('--write does not accept --allow-baseline-initialization');
  } else if (options.frameworkVersion || options.allowBaselineInitialization || options.allowBaselineReplacement) {
    throw new Error(`${options.mode} does not accept baseline write authority or framework version flags`);
  }
  if (options.frameworkVersion) assertSemver(options.frameworkVersion);
  return options;
}

async function run(options) {
  if (!options || typeof options !== 'object' || !options.root) throw new Error('Runner requires an explicit root');
  if (!['check', 'bootstrap', 'write', 'refresh-fork'].includes(options.mode)) throw new Error('Runner requires one valid mode');
  if (options.mode === 'bootstrap') {
    if (!options.allowBaselineInitialization) throw new Error('Bootstrap runner requires explicit baseline initialization authority');
    assertSemver(options.frameworkVersion);
  } else if (options.mode === 'write') {
    if (!options.allowBaselineReplacement) throw new Error('Write runner requires explicit baseline replacement authority');
    assertSemver(options.frameworkVersion);
  } else if (options.frameworkVersion || options.allowBaselineInitialization || options.allowBaselineReplacement) {
    throw new Error(`${options.mode} runner does not accept baseline write authority or framework version`);
  }
  const root = path.resolve(options.root);
  const paths = provenancePaths(root);
  const inventory = await scanFramework(root);
  const changedPaths = [];

  if (options.mode === 'bootstrap') {
    for (const target of Object.values(paths)) if (await metadata(target)) throw new Error('Bootstrap requires manifest, baseline archive, and fork control to be absent');
    const archive = buildBaselineArchive(options.frameworkVersion, inventory);
    const manifest = buildManifest(options.frameworkVersion, inventory, archive);
    const control = buildForkControl(manifest, inventory, 'origin');
    await atomicWrite(paths.archive, archive.compressed); changedPaths.push(BASELINE_ARCHIVE_FILE);
    await atomicWrite(paths.manifest, canonicalJson(manifest)); changedPaths.push(MANIFEST_FILE);
    await atomicWrite(paths.control, canonicalJson(control)); changedPaths.push(FORK_CONTROL_FILE);
    return { mode: options.mode, root, manifest, archive, control, changedPaths };
  }

  const committed = await loadImmutableProvenance(root);
  if (options.mode === 'write') {
    const archive = buildBaselineArchive(options.frameworkVersion, inventory);
    const manifest = buildManifest(options.frameworkVersion, inventory, archive);
    if (manifest.baselineDigest !== committed.manifest.baselineDigest && options.frameworkVersion === committed.manifest.frameworkVersion) throw new Error('Tracked baseline changed; provide a different framework version before replacement');
    const control = buildForkControl(manifest, inventory, 'origin');
    if (await writeIfChanged(paths.archive, archive.compressed)) changedPaths.push(BASELINE_ARCHIVE_FILE);
    if (await writeIfChanged(paths.manifest, canonicalJson(manifest))) changedPaths.push(MANIFEST_FILE);
    if (await writeIfChanged(paths.control, canonicalJson(control))) changedPaths.push(FORK_CONTROL_FILE);
    return { mode: options.mode, root, manifest, archive, control, changedPaths };
  }

  if (options.mode === 'refresh-fork') {
    const relation = await existingRelation(paths.control, committed.manifest);
    const control = buildForkControl(committed.manifest, inventory, relation);
    if (await writeIfChanged(paths.control, canonicalJson(control))) changedPaths.push(FORK_CONTROL_FILE);
    return { mode: options.mode, root, manifest: committed.manifest, archive: { compressed: committed.archive }, control, changedPaths };
  }

  let controlRecord;
  try {
    controlRecord = await readJson(paths.control);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error('Fork control is required for check mode');
    throw error;
  }
  const control = validateForkControl(controlRecord.value, committed.manifest);
  if (controlRecord.text !== canonicalJson(control)) throw new Error('Fork control JSON is not canonical');
  const expectedArchive = buildBaselineArchive(committed.manifest.frameworkVersion, inventory);
  const expectedManifest = buildManifest(committed.manifest.frameworkVersion, inventory, expectedArchive);
  const expectedControl = buildForkControl(committed.manifest, inventory, control.baselineRelation);
  const committedManifestText = await fsp.readFile(paths.manifest, 'utf8');
  if (committedManifestText !== canonicalJson(expectedManifest)) throw new Error('Manifest is stale; tracked baseline changes require a framework-version change and replacement');
  if (!committed.archive.equals(expectedArchive.compressed)) throw new Error('Baseline archive is stale or non-deterministic');
  if (controlRecord.text !== canonicalJson(expectedControl)) throw new Error('Fork control is stale');
  return { mode: options.mode, root, manifest: committed.manifest, archive: expectedArchive, control, changedPaths };
}

function summary(result) {
  const data = {
    mode: result.mode,
    frameworkVersion: result.manifest.frameworkVersion,
    baselineFiles: result.manifest.files.length,
    manifestBytes: Buffer.byteLength(canonicalJson(result.manifest)),
    archiveBytes: result.archive.compressed.length,
    changedPaths: result.changedPaths,
    fork: result.control.summary,
    baselineRelation: result.control.baselineRelation,
  };
  return data;
}

async function runCli(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const result = await run(options);
  const data = summary(result);
  if (options.json) console.log(JSON.stringify(data));
  else {
    console.log(`Pipes framework ${data.frameworkVersion}: ${data.baselineFiles} baseline files, ${data.manifestBytes} manifest bytes, ${data.archiveBytes} archive bytes`);
    console.log(`Fork: ${data.fork.unchanged} unchanged, ${data.fork.created} created, ${data.fork.modified} modified, ${data.fork.deleted} deleted; relation ${data.baselineRelation}`);
    console.log(`Changed: ${data.changedPaths.length ? data.changedPaths.join(', ') : 'none'}`);
  }
  return data;
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

module.exports = {
  BASELINE_ARCHIVE_FILE,
  BASELINE_ARCHIVE_SCHEMA_VERSION,
  BASELINE_DOMAIN,
  FORK_CONTROL_FILE,
  FORK_CONTROL_SCHEMA_VERSION,
  FORK_DOMAIN,
  FRAMEWORK,
  MANIFEST_FILE,
  MANIFEST_SCHEMA_VERSION,
  PROJECT_LAYOUT_VERSION,
  SUPPORTED_PROJECT_LAYOUT_VERSIONS,
  OWNERSHIP,
  atomicWrite,
  buildBaselineArchive,
  buildForkControl,
  buildManifest,
  canonicalJson,
  compareUtf8,
  inventoryDigest,
  normalizeRelativePath,
  parseArguments,
  run,
  runCli,
  scanFramework,
  sha256,
  sortUtf8,
  summary,
  u64,
  validateBaselineArchive,
  validateForkControl,
  validateManifest,
  writeIfChanged,
};
