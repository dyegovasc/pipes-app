// The starter bundle contract `pipes-starter-gzip-json-v1`: one gzip JSON file that holds every
// file of `.pipes.example` for one framework version. Pipes Local installs and upgrades from it.
//
// {
//   "starterSchemaVersion": 1,
//   "framework": "pipes",
//   "frameworkVersion": "X",
//   "files": [{ "path": "...", "encoding": "utf8" | "base64", "sha256": "<raw bytes>", "content": "..." }]
// }
//
// Files are sorted by UTF-8 byte order. `manifest.json` and `framework-baseline.json.gz` are copied
// byte for byte, so a bundle keeps the published provenance hashes of its version.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gunzipSync, gzipSync, inflateRawSync } from 'node:zlib';
import {
  BASELINE_ARCHIVE_FILE,
  FORK_CONTROL_FILE,
  FRAMEWORK,
  MANIFEST_FILE,
  canonicalJson,
  validateBaselineArchive,
  validateForkControl,
  validateManifest,
} from '../generate-pipes-framework-metadata.mjs';
import { isStrictSemver } from './semver.mjs';

export const STARTER_DIR = '.pipes.example';
export const STARTER_FORMAT = 'pipes-starter-gzip-json-v1';
export const STARTER_SCHEMA_VERSION = 1;
export const MAX_BUNDLE_BYTES = 16 * 1024 * 1024;
export const MAX_UNCOMPRESSED_BYTES = 64 * 1024 * 1024;
export const REQUIRED_FILES = Object.freeze([MANIFEST_FILE, BASELINE_ARCHIVE_FILE, FORK_CONTROL_FILE]);

const HEX64 = /^[0-9a-f]{64}$/;
const BUNDLE_KEYS = ['starterSchemaVersion', 'framework', 'frameworkVersion', 'files'];
const FILE_KEYS = ['path', 'encoding', 'sha256', 'content'];

export function bundleFileName(version) {
  return `pipes-starter-${version}.json.gz`;
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'));
}

export function isSafeRelativePath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.startsWith('/') &&
    !value.includes('\\') &&
    !value.includes('\0') &&
    value.split('/').every((segment) => segment.length > 0 && segment !== '.' && segment !== '..')
  );
}

function fail(message) {
  throw new Error(`Starter bundle: ${message}`);
}

function sameKeys(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && JSON.stringify(Object.keys(value)) === JSON.stringify(keys);
}

/** True when the bytes are valid UTF-8 and survive a decode and encode round trip unchanged. */
function isRoundTripUtf8(bytes) {
  try {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
    return Buffer.from(text, 'utf8').equals(bytes);
  } catch {
    return false;
  }
}

/**
 * Lists the starter files that git tracks or does not ignore, relative to `.pipes.example`, sorted
 * by UTF-8 byte order. Uncommitted files count; ignored files such as `.DS_Store` do not.
 */
export function listStarterFiles(root) {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', STARTER_DIR], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`git ls-files failed in ${root}: ${result.stderr}`);
  const prefix = `${STARTER_DIR}/`;
  const files = [...new Set(result.stdout.split('\0').filter(Boolean))]
    .filter((rel) => rel.startsWith(prefix) && existsSync(path.join(root, rel)))
    .map((rel) => rel.slice(prefix.length));
  for (const rel of files) {
    if (!isSafeRelativePath(rel)) throw new Error(`Unsafe starter path: ${rel}`);
    if (!lstatSync(path.join(root, prefix, ...rel.split('/'))).isFile()) throw new Error(`Starter path is not a regular file (a symlink is refused): ${rel}`);
  }
  return files.sort(compareUtf8);
}

/** Builds the bundle for `version` from `<root>/.pipes.example`. Returns its JSON and gzip bytes. */
export function buildStarterBundle({ root, version }) {
  const starterRoot = path.join(root, STARTER_DIR);
  const manifest = JSON.parse(readFileSync(path.join(starterRoot, MANIFEST_FILE), 'utf8'));
  if (manifest.frameworkVersion !== version) {
    throw new Error(`Version ${version} does not match the ${STARTER_DIR} manifest version ${manifest.frameworkVersion}`);
  }
  const files = listStarterFiles(root).map((rel) => {
    const bytes = readFileSync(path.join(starterRoot, ...rel.split('/')));
    const utf8 = isRoundTripUtf8(bytes);
    return {
      path: rel,
      encoding: utf8 ? 'utf8' : 'base64',
      sha256: sha256(bytes),
      content: utf8 ? bytes.toString('utf8') : bytes.toString('base64'),
    };
  });
  const bundle = { starterSchemaVersion: STARTER_SCHEMA_VERSION, framework: FRAMEWORK, frameworkVersion: version, files };
  const json = Buffer.from(canonicalJson(bundle), 'utf8');
  // Node writes gzip header mtime 0, so the output depends only on the content and the zlib build.
  const compressed = gzipSync(json, { level: 9 });
  if (compressed.length > MAX_BUNDLE_BYTES) throw new Error(`Bundle is ${compressed.length} bytes; the limit is ${MAX_BUNDLE_BYTES}`);
  return { bundle, json, compressed };
}

/**
 * Returns the end offset of the first gzip member. A Rust gzip decoder reads only the first member,
 * so a bundle with trailing data is refused.
 */
function firstGzipMemberEnd(bytes) {
  if (bytes.length < 18 || bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes[2] !== 8) fail('gzip header is invalid');
  const flags = bytes[3];
  let offset = 10;
  const skipZeroTerminated = () => {
    while (offset < bytes.length && bytes[offset] !== 0) offset += 1;
    offset += 1;
  };
  if (flags & 4) offset += 2 + bytes.readUInt16LE(offset);
  if (flags & 8) skipZeroTerminated();
  if (flags & 16) skipZeroTerminated();
  if (flags & 2) offset += 2;
  if (offset >= bytes.length) fail('gzip header is invalid');
  const { engine } = inflateRawSync(bytes.subarray(offset), { info: true, maxOutputLength: MAX_UNCOMPRESSED_BYTES });
  return offset + engine.bytesWritten + 8;
}

/** Key for collisions on a case-insensitive, normalizing file system such as APFS. */
function collisionKey(value) {
  return value.normalize('NFC').toLowerCase();
}

function decodeContent(file) {
  if (file.encoding === 'utf8') return Buffer.from(file.content, 'utf8');
  const bytes = Buffer.from(file.content, 'base64');
  if (bytes.toString('base64') !== file.content) fail(`base64 content is not canonical: ${file.path}`);
  return bytes;
}

/**
 * Verifies bundle bytes. `expected` may hold `version`, `size`, `sha256`, and `manifestSha256`
 * (from a signed index entry). Returns the parsed bundle, its files as bytes, and its manifest.
 */
export function verifyStarterBundle(compressed, expected = {}) {
  if (!Buffer.isBuffer(compressed)) fail('bytes are required');
  if (compressed.length > MAX_BUNDLE_BYTES) fail(`size ${compressed.length} exceeds ${MAX_BUNDLE_BYTES}`);
  if (expected.size !== undefined && compressed.length !== expected.size) fail(`size ${compressed.length} does not equal ${expected.size}`);
  if (expected.sha256 !== undefined && sha256(compressed) !== expected.sha256) fail('sha256 does not match');

  let json;
  try {
    json = gunzipSync(compressed, { maxOutputLength: MAX_UNCOMPRESSED_BYTES });
  } catch (error) {
    fail(`gzip is invalid or too large: ${error.message}`);
  }
  let end;
  try {
    end = firstGzipMemberEnd(compressed);
  } catch (error) {
    fail(error.message.replace(/^Starter bundle: /, ''));
  }
  if (end !== compressed.length) fail('gzip has trailing data after the first member');
  let bundle;
  try {
    bundle = JSON.parse(json.toString('utf8'));
  } catch (error) {
    fail(`JSON is invalid: ${error.message}`);
  }
  // Canonical bytes only: this also refuses duplicate keys, which JSON.parse would silently drop.
  if (canonicalJson(bundle) !== json.toString('utf8')) fail('JSON is not canonical');
  if (!sameKeys(bundle, BUNDLE_KEYS)) fail(`top-level keys must be ${BUNDLE_KEYS.join(', ')}`);
  if (bundle.starterSchemaVersion !== STARTER_SCHEMA_VERSION) fail('unsupported starterSchemaVersion');
  if (bundle.framework !== FRAMEWORK) fail('framework must be pipes');
  if (!isStrictSemver(bundle.frameworkVersion)) fail('frameworkVersion must be a strict SemVer version without build metadata');
  if (expected.version !== undefined && bundle.frameworkVersion !== expected.version) {
    fail(`frameworkVersion ${bundle.frameworkVersion} does not equal ${expected.version}`);
  }
  if (!Array.isArray(bundle.files)) fail('files must be an array');

  const files = new Map();
  const collisions = new Set();
  let previous = null;
  for (const file of bundle.files) {
    if (!sameKeys(file, FILE_KEYS)) fail(`file keys must be ${FILE_KEYS.join(', ')}`);
    if (!isSafeRelativePath(file.path)) fail(`unsafe path: ${String(file.path)}`);
    if (previous !== null && compareUtf8(previous, file.path) >= 0) fail('file paths must be unique and sorted');
    previous = file.path;
    if (file.encoding !== 'utf8' && file.encoding !== 'base64') fail(`invalid encoding: ${file.path}`);
    if (typeof file.content !== 'string') fail(`content must be a string: ${file.path}`);
    if (!file.path.isWellFormed() || !file.content.isWellFormed()) fail(`string is not well-formed Unicode: ${file.path}`);
    const key = collisionKey(file.path);
    if (collisions.has(key)) fail(`path collides with another path by case or Unicode normalization: ${file.path}`);
    collisions.add(key);
    if (!HEX64.test(file.sha256)) fail(`invalid sha256: ${file.path}`);
    const bytes = decodeContent(file);
    if (sha256(bytes) !== file.sha256) fail(`content hash mismatch: ${file.path}`);
    files.set(file.path, bytes);
  }
  for (const required of REQUIRED_FILES) if (!files.has(required)) fail(`missing required file: ${required}`);

  const manifestBytes = files.get(MANIFEST_FILE);
  const manifestSha256 = sha256(manifestBytes);
  if (expected.manifestSha256 !== undefined && manifestSha256 !== expected.manifestSha256) fail('manifest sha256 does not match');
  let manifest;
  try {
    manifest = validateManifest(JSON.parse(manifestBytes.toString('utf8')));
    if (manifest.frameworkVersion !== bundle.frameworkVersion) throw new Error('manifest frameworkVersion does not match the bundle');
    validateBaselineArchive(manifest, files.get(BASELINE_ARCHIVE_FILE));
    validateForkControl(JSON.parse(files.get(FORK_CONTROL_FILE).toString('utf8')), manifest);
  } catch (error) {
    fail(error.message);
  }
  return { bundle, files, manifest, manifestSha256 };
}

/** Compares two bundles by decompressed content, so different zlib builds do not count as a difference. */
export function bundleContentEquals(left, right) {
  const decode = (bytes) => canonicalJson(JSON.parse(gunzipSync(bytes, { maxOutputLength: MAX_UNCOMPRESSED_BYTES }).toString('utf8')));
  return decode(left) === decode(right);
}

/** Returns the differences between a verified bundle and the starter files under `root`. */
export function compareWithStarterTree(verified, root) {
  const problems = [];
  const starterRoot = path.join(root, STARTER_DIR);
  const listed = listStarterFiles(root);
  const listedSet = new Set(listed);
  for (const rel of listed) {
    const bytes = verified.files.get(rel);
    if (!bytes) problems.push(`missing from bundle: ${rel}`);
    else if (!bytes.equals(readFileSync(path.join(starterRoot, ...rel.split('/'))))) problems.push(`differs from source: ${rel}`);
  }
  for (const rel of verified.files.keys()) if (!listedSet.has(rel)) problems.push(`not in source: ${rel}`);
  return problems;
}
