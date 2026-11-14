// The signed framework index `frameworks/index.json` that Pipes Local reads to find published
// framework versions. Every function here is pure: it validates or returns a new index object.
//
// {
//   "indexSchemaVersion": 1,
//   "generatedAt": "YYYY-MM-DDThh:mm:ssZ",
//   "revokedKeyIds": ["<16 uppercase hex digits>"],
//   "versions": [{
//     "frameworkVersion", "manifestSchemaVersion", "projectLayoutVersion", "minAppVersion",
//     "releasedAt", "withdrawn", "bundle": { "url", "size", "sha256" }, "manifestSha256"
//   }]
// }
//
// Rules: versions are unique and sorted by SemVer; a withdrawal cannot be undone; a revoked key id
// cannot be removed; each new index has a later `generatedAt`; the signature's trusted comment is
// exactly `pipes-framework-index v1 generatedAt=<generatedAt>`.

import { canonicalJson } from '../generate-pipes-framework-metadata.mjs';
import { compareSemver } from '../framework-release.mjs';
import { isKeyIdText } from './minisign.mjs';
import { isStrictSemver } from './semver.mjs';
import { MAX_BUNDLE_BYTES, bundleFileName } from './starter-bundle.mjs';

export const INDEX_SCHEMA_VERSION = 1;
export const INDEX_PATH = 'frameworks/index.json';
export const SIGNATURE_PATH = 'frameworks/index.json.minisig';
export const REPOSITORY = 'dyegovasc/pipes-app';
export const TAG_PREFIX = 'pipes-framework-v';

const INDEX_KEYS = ['indexSchemaVersion', 'generatedAt', 'revokedKeyIds', 'versions'];
const ENTRY_KEYS = [
  'frameworkVersion',
  'manifestSchemaVersion',
  'projectLayoutVersion',
  'minAppVersion',
  'releasedAt',
  'withdrawn',
  'bundle',
  'manifestSha256',
];
const BUNDLE_KEYS = ['url', 'size', 'sha256'];
const RFC3339_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const HEX64 = /^[0-9a-f]{64}$/;

function fail(message) {
  throw new Error(`Framework index: ${message}`);
}

function sameKeys(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && JSON.stringify(Object.keys(value)) === JSON.stringify(keys);
}

export function isRfc3339Utc(value) {
  if (typeof value !== 'string' || !RFC3339_UTC.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().replace('.000Z', 'Z') === value;
}

export function formatGeneratedAt(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function bundleUrl(version) {
  return `https://github.com/${REPOSITORY}/releases/download/${TAG_PREFIX}${version}/${bundleFileName(version)}`;
}

export function trustedComment(generatedAt) {
  if (!isRfc3339Utc(generatedAt)) fail(`generatedAt is not YYYY-MM-DDThh:mm:ssZ: ${String(generatedAt)}`);
  return `pipes-framework-index v1 generatedAt=${generatedAt}`;
}

export function emptyIndex() {
  return { indexSchemaVersion: INDEX_SCHEMA_VERSION, generatedAt: null, revokedKeyIds: [], versions: [] };
}

export function makeEntry({ manifest, manifestSha256, minAppVersion, releasedAt, size, sha256 }) {
  // Only manifests with a project layout (schema 2 and later) are published through the index.
  if (!Number.isSafeInteger(manifest.projectLayoutVersion)) fail(`${manifest.frameworkVersion}: the manifest has no projectLayoutVersion`);
  return {
    frameworkVersion: manifest.frameworkVersion,
    manifestSchemaVersion: manifest.manifestSchemaVersion,
    projectLayoutVersion: manifest.projectLayoutVersion,
    minAppVersion,
    releasedAt,
    withdrawn: false,
    bundle: { url: bundleUrl(manifest.frameworkVersion), size, sha256 },
    manifestSha256,
  };
}

export function validateEntry(entry) {
  if (!sameKeys(entry, ENTRY_KEYS)) fail(`entry keys must be ${ENTRY_KEYS.join(', ')}`);
  const version = entry.frameworkVersion;
  if (!isStrictSemver(version)) fail(`frameworkVersion is not a strict SemVer version without build metadata: ${String(version)}`);
  if (!Number.isSafeInteger(entry.manifestSchemaVersion) || entry.manifestSchemaVersion < 1) fail(`${version}: manifestSchemaVersion is invalid`);
  if (!Number.isSafeInteger(entry.projectLayoutVersion) || entry.projectLayoutVersion < 1) fail(`${version}: projectLayoutVersion is invalid`);
  if (!isStrictSemver(entry.minAppVersion)) fail(`${version}: minAppVersion is not a strict SemVer version without build metadata`);
  if (!isRfc3339Utc(entry.releasedAt)) fail(`${version}: releasedAt is not YYYY-MM-DDThh:mm:ssZ`);
  if (typeof entry.withdrawn !== 'boolean') fail(`${version}: withdrawn must be a boolean`);
  if (!sameKeys(entry.bundle, BUNDLE_KEYS)) fail(`${version}: bundle keys must be ${BUNDLE_KEYS.join(', ')}`);
  if (entry.bundle.url !== bundleUrl(version)) fail(`${version}: bundle.url must be ${bundleUrl(version)}`);
  if (!Number.isSafeInteger(entry.bundle.size) || entry.bundle.size < 1 || entry.bundle.size > MAX_BUNDLE_BYTES) fail(`${version}: bundle.size is invalid`);
  if (!HEX64.test(entry.bundle.sha256)) fail(`${version}: bundle.sha256 is invalid`);
  if (!HEX64.test(entry.manifestSha256)) fail(`${version}: manifestSha256 is invalid`);
  return entry;
}

export function validateIndex(index) {
  if (!sameKeys(index, INDEX_KEYS)) fail(`top-level keys must be ${INDEX_KEYS.join(', ')}`);
  if (index.indexSchemaVersion !== INDEX_SCHEMA_VERSION) fail('unsupported indexSchemaVersion');
  if (!isRfc3339Utc(index.generatedAt)) fail('generatedAt is not YYYY-MM-DDThh:mm:ssZ');
  if (!Array.isArray(index.revokedKeyIds)) fail('revokedKeyIds must be an array');
  for (const keyId of index.revokedKeyIds) if (!isKeyIdText(keyId)) fail(`revoked key id is invalid: ${String(keyId)}`);
  if (new Set(index.revokedKeyIds).size !== index.revokedKeyIds.length) fail('revokedKeyIds must be unique');
  if (!Array.isArray(index.versions)) fail('versions must be an array');
  index.versions.forEach(validateEntry);
  for (let i = 1; i < index.versions.length; i += 1) {
    if (compareSemver(index.versions[i - 1].frameworkVersion, index.versions[i].frameworkVersion) >= 0) fail('versions must be unique and sorted by SemVer');
  }
  return index;
}

export function canonicalIndexJson(index) {
  return canonicalJson(validateIndex(index));
}

function clone(index) {
  return JSON.parse(JSON.stringify(index));
}

export function addVersion(index, entry) {
  validateEntry(entry);
  if (entry.withdrawn) fail(`${entry.frameworkVersion}: a new entry cannot be withdrawn`);
  if (index.versions.some((existing) => existing.frameworkVersion === entry.frameworkVersion)) fail(`${entry.frameworkVersion} is already in the index`);
  const next = clone(index);
  next.versions.push(entry);
  next.versions.sort((a, b) => compareSemver(a.frameworkVersion, b.frameworkVersion));
  return next;
}

export function withdrawVersion(index, version) {
  const position = index.versions.findIndex((entry) => entry.frameworkVersion === version);
  if (position < 0) fail(`${version} is not in the index`);
  if (index.versions[position].withdrawn) fail(`${version} is already withdrawn`);
  const next = clone(index);
  next.versions[position].withdrawn = true;
  return next;
}

export function revokeKey(index, keyId) {
  if (!isKeyIdText(keyId)) fail(`key id must be 16 uppercase hex digits: ${String(keyId)}`);
  if (index.revokedKeyIds.includes(keyId)) fail(`${keyId} is already revoked`);
  const next = clone(index);
  next.revokedKeyIds.push(keyId);
  return next;
}

/** `next` must be strictly later than `previous`; the app rejects an older index (R21). */
export function checkGeneratedAt(previous, next) {
  if (!isRfc3339Utc(next)) fail(`generatedAt is not YYYY-MM-DDThh:mm:ssZ: ${String(next)}`);
  if (previous !== null && previous !== undefined && Date.parse(next) <= Date.parse(previous)) {
    fail(`generatedAt ${next} is not later than the previous index ${previous}`);
  }
}

/**
 * Refuses a change that removes history: a removed or changed version (other than a withdrawal), an
 * undone withdrawal, or a removed revoked key id.
 */
export function assertAppendOnly(previous, next, allowedRemovals = []) {
  for (const keyId of previous.revokedKeyIds) if (!next.revokedKeyIds.includes(keyId)) fail(`revoked key id ${keyId} cannot be removed`);
  for (const before of previous.versions) {
    const after = next.versions.find((entry) => entry.frameworkVersion === before.frameworkVersion);
    if (!after && allowedRemovals.includes(before.frameworkVersion)) continue;
    if (!after) fail(`${before.frameworkVersion} cannot be removed; withdraw it instead`);
    if (before.withdrawn && !after.withdrawn) fail(`the withdrawal of ${before.frameworkVersion} cannot be undone`);
    if (JSON.stringify({ ...before, withdrawn: null }) !== JSON.stringify({ ...after, withdrawn: null })) fail(`${before.frameworkVersion} cannot be changed`);
  }
}

export function assertSignerNotRevoked(index, keyId) {
  if (index.revokedKeyIds.includes(keyId)) fail(`the signing key ${keyId} is revoked`);
}

/** Returns the new index with its `generatedAt`, after every rule passes. */
export function finalizeIndex(previous, next, now, { allowedRemovals = [] } = {}) {
  if (previous) validateIndex(previous);
  const generatedAt = formatGeneratedAt(now);
  checkGeneratedAt(previous?.generatedAt ?? null, generatedAt);
  const result = { ...clone(next), generatedAt };
  validateIndex(result);
  if (previous) assertAppendOnly(previous, result, allowedRemovals);
  return result;
}

/**
 * Removes a version from the index. Only a revocation run may do this (R22 recovery): it drops
 * versions that a compromised key published, so that apps remove their cached bundles.
 */
export function dropVersion(index, version) {
  if (!index.versions.some((entry) => entry.frameworkVersion === version)) fail(`${version} is not in the index`);
  const next = clone(index);
  next.versions = next.versions.filter((entry) => entry.frameworkVersion !== version);
  return next;
}
