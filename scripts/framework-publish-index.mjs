#!/usr/bin/env node
// Publishes a change to the signed framework index `frameworks/index.json` on the maintainer's machine.
//
// One run can revoke a key, withdraw a version, and add a version, in that order:
//   --revoke-key ID   adds ID to `revokedKeyIds` (it can never be removed)
//   --withdraw X      marks version X withdrawn (it can never be undone)
//   --version X       adds the released bundle of version X
// For --version, the script reads the release asset metadata with `gh api`, downloads the bundle from
// its fixed release URL (or reads --bundle-file), checks its size and SHA-256 against the asset
// metadata, verifies the bundle, and compares its decompressed content with a local rebuild after it
// confirms that `.pipes.example` equals the tag tree.
//
// The new index gets a later `generatedAt` and is signed with the maintainer's `minisign` CLI and the
// active secret key; minisign asks for the password. The script never reads the secret key. The first
// --public-key is the active key: signing stops when it is revoked, and the new signature must verify
// with it. Every --public-key is trusted to verify the current committed index.
// --commit commits only the two index files. The script never pushes.
//
// Usage: npm run framework:publish-index -- --secret-key PATH --public-key PATH [--public-key PATH]
//        [--revoke-key ID] [--withdraw X] [--version X] [--bundle-file PATH] [--commit] [--dry-run]

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INDEX_PATH,
  REPOSITORY,
  SIGNATURE_PATH,
  TAG_PREFIX,
  addVersion,
  assertSignerNotRevoked,
  bundleUrl,
  canonicalIndexJson,
  emptyIndex,
  finalizeIndex,
  isRfc3339Utc,
  makeEntry,
  revokeKey,
  trustedComment,
  validateIndex,
  withdrawVersion,
} from './lib/framework-index.mjs';
import { cliSigner, parsePublicKey, verifySignature } from './lib/minisign.mjs';
import { isStrictSemver } from './lib/semver.mjs';
import {
  MAX_BUNDLE_BYTES,
  STARTER_DIR,
  buildStarterBundle,
  bundleContentEquals,
  bundleFileName,
  sha256,
  verifyStarterBundle,
} from './lib/starter-bundle.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE_TIMEOUT_MS = 60_000;

export function parseArgs(argv) {
  const options = { secretKey: null, publicKeys: [], revokeKey: null, withdraw: null, version: null, bundleFile: null, commit: false, dryRun: false };
  const values = { '--secret-key': 'secretKey', '--revoke-key': 'revokeKey', '--withdraw': 'withdraw', '--version': 'version', '--bundle-file': 'bundleFile' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg in values || arg === '--public-key') {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      if (arg === '--public-key') options.publicKeys.push(value);
      else options[values[arg]] = value;
      index += 1;
    } else if (arg === '--commit') {
      options.commit = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!options.version && !options.withdraw && !options.revokeKey) throw new Error('Give at least one of --version, --withdraw, or --revoke-key');
  if (options.publicKeys.length === 0) throw new Error('--public-key PATH is required');
  if (!options.dryRun && !options.secretKey) throw new Error('--secret-key PATH is required unless --dry-run');
  if (options.dryRun && options.commit) throw new Error('--commit cannot be combined with --dry-run');
  if (options.bundleFile && !options.version) throw new Error('--bundle-file needs --version');
  for (const flag of ['version', 'withdraw']) {
    if (options[flag] && !isStrictSemver(options[flag])) throw new Error(`--${flag} ${options[flag]} is not a strict SemVer version without build metadata`);
  }
  return options;
}

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

/** Refuses when `.pipes.example` in the working tree differs from the tree of `tag`. */
export function checkSourceMatchesTag(root, tag) {
  if (!git(root, ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`]).ok) throw new Error(`Tag ${tag} does not exist in this repository`);
  if (!git(root, ['diff', '--quiet', tag, '--', STARTER_DIR]).ok) throw new Error(`${STARTER_DIR} differs from the tag ${tag}`);
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '--', STARTER_DIR]).output.trim();
  if (untracked) throw new Error(`${STARTER_DIR} has untracked files that the tag ${tag} does not hold:\n${untracked}`);
}

/** Reads `frameworks/compatibility.json` as the tag holds it, so a later edit cannot change the entry. */
export function compatibilityAtTag(root, tag) {
  const result = git(root, ['show', `${tag}:frameworks/compatibility.json`]);
  if (!result.ok) throw new Error(`frameworks/compatibility.json is missing at ${tag}`);
  return JSON.parse(result.output);
}

function releaseAsset(release, version) {
  const name = bundleFileName(version);
  const asset = release?.assets?.find((candidate) => candidate.name === name);
  if (!asset) throw new Error(`The release has no asset ${name}`);
  const match = /^sha256:([0-9a-f]{64})$/.exec(asset.digest ?? '');
  if (!match) throw new Error(`The release asset ${name} has no sha256 digest`);
  if (!Number.isSafeInteger(asset.size) || asset.size < 1 || asset.size > MAX_BUNDLE_BYTES) throw new Error(`The release asset ${name} has an invalid size`);
  if (!isRfc3339Utc(release.published_at)) throw new Error('The release has no valid published_at time');
  return { size: asset.size, sha256: match[1], releasedAt: release.published_at };
}

function readIndexState(root, publicKeys) {
  const indexPath = path.join(root, INDEX_PATH);
  const signaturePath = path.join(root, SIGNATURE_PATH);
  if (!existsSync(indexPath) && !existsSync(signaturePath)) return null;
  if (!existsSync(indexPath) || !existsSync(signaturePath)) throw new Error(`${INDEX_PATH} and ${SIGNATURE_PATH} must exist together`);
  const message = readFileSync(indexPath);
  const index = validateIndex(JSON.parse(message.toString('utf8')));
  const { keyId, trustedComment: comment } = verifySignature({ message, signatureText: readFileSync(signaturePath, 'utf8'), publicKeys });
  if (comment !== trustedComment(index.generatedAt)) throw new Error('The committed index trusted comment does not match its generatedAt');
  assertSignerNotRevoked(index, keyId);
  return index;
}

async function addReleasedVersion(index, { root, version, bundleFile, fetchRelease, fetchBundle, checkSource }) {
  const tag = `${TAG_PREFIX}${version}`;
  checkSource(root, tag);
  const asset = releaseAsset(await fetchRelease(tag), version);
  const bytes = bundleFile ? readFileSync(bundleFile) : await fetchBundle(bundleUrl(version), asset.size);
  if (bytes.length !== asset.size) throw new Error(`The bundle has ${bytes.length} bytes; the release asset has ${asset.size}`);
  if (sha256(bytes) !== asset.sha256) throw new Error('The bundle sha256 does not match the release asset digest');
  const verified = verifyStarterBundle(bytes, { version, size: asset.size, sha256: asset.sha256 });
  const rebuilt = buildStarterBundle({ root, version });
  if (!bundleContentEquals(bytes, rebuilt.compressed)) throw new Error(`The released bundle content differs from a rebuild of ${STARTER_DIR} at ${tag}`);
  const minAppVersion = compatibilityAtTag(root, tag).versions?.[version]?.minAppVersion;
  if (!minAppVersion) throw new Error(`frameworks/compatibility.json at ${tag} has no minAppVersion for ${version}`);
  return addVersion(
    index,
    makeEntry({ manifest: verified.manifest, manifestSha256: verified.manifestSha256, minAppVersion, releasedAt: asset.releasedAt, size: asset.size, sha256: asset.sha256 }),
  );
}

/**
 * Moves the new index and signature into place as a pair. When the second move fails, the first is
 * undone, so the index never sits next to a signature of another index.
 */
export function replacePair({ indexPath, signaturePath, nextIndexPath, nextSignaturePath, rename = renameSync }) {
  const oldIndex = existsSync(indexPath) ? readFileSync(indexPath) : null;
  rename(nextIndexPath, indexPath);
  try {
    rename(nextSignaturePath, signaturePath);
  } catch (error) {
    if (oldIndex) writeFileSync(indexPath, oldIndex);
    else rmSync(indexPath, { force: true });
    throw new Error(`Could not move the new signature into place; the previous index is restored: ${error.message}`);
  }
}

/**
 * Builds, signs, verifies, and writes the next index. Dependencies are injectable for tests.
 * Returns the new index; with `dryRun` nothing is written or signed.
 */
export async function publishIndex({
  root,
  version = null,
  withdraw = null,
  revokeKeyId = null,
  bundleFile = null,
  publicKeyTexts,
  signer = null,
  fetchRelease,
  fetchBundle,
  checkSource = checkSourceMatchesTag,
  now = () => new Date(),
  commit = false,
  dryRun = false,
}) {
  if (!version && !withdraw && !revokeKeyId) throw new Error('Give at least one of version, withdraw, or revokeKeyId');
  const publicKeys = publicKeyTexts.map(parsePublicKey);
  if (publicKeys.length === 0) throw new Error('At least one public key is required');
  const activeKey = publicKeys[0];

  const previous = readIndexState(root, publicKeys);
  let next = previous ?? emptyIndex();
  if (revokeKeyId) next = revokeKey(next, revokeKeyId);
  if (withdraw) next = withdrawVersion(next, withdraw);
  if (version) next = await addReleasedVersion(next, { root, version, bundleFile, fetchRelease, fetchBundle, checkSource });
  const finalIndex = finalizeIndex(previous, next, now());
  assertSignerNotRevoked(finalIndex, activeKey.keyId);
  const json = canonicalIndexJson(finalIndex);
  if (dryRun) return { index: finalIndex, json, written: false };
  if (!signer) throw new Error('A signer is required');

  const indexPath = path.join(root, INDEX_PATH);
  const signaturePath = path.join(root, SIGNATURE_PATH);
  const nextIndexPath = `${indexPath}.next`;
  const nextSignaturePath = `${signaturePath}.next`;
  mkdirSync(path.dirname(indexPath), { recursive: true });
  try {
    writeFileSync(nextIndexPath, json, { encoding: 'utf8', flag: 'wx' });
    const comment = trustedComment(finalIndex.generatedAt);
    signer.signFile({ messagePath: nextIndexPath, signaturePath: nextSignaturePath, trustedComment: comment });
    const result = verifySignature({ message: Buffer.from(json, 'utf8'), signatureText: readFileSync(nextSignaturePath, 'utf8'), publicKeys: [activeKey] });
    if (result.trustedComment !== comment) throw new Error('The new signature has a different trusted comment');
    replacePair({ indexPath, signaturePath, nextIndexPath, nextSignaturePath });
  } finally {
    rmSync(nextIndexPath, { force: true });
    rmSync(nextSignaturePath, { force: true });
  }

  if (commit) {
    const summary = [revokeKeyId && `revoke ${revokeKeyId}`, withdraw && `withdraw ${withdraw}`, version && `add ${version}`].filter(Boolean).join(', ');
    for (const args of [
      ['add', '--', INDEX_PATH, SIGNATURE_PATH],
      ['commit', '-m', `Publish framework index: ${summary}`, '--', INDEX_PATH, SIGNATURE_PATH],
    ]) {
      const result = git(root, args);
      if (!result.ok) throw new Error(`git ${args[0]} failed: ${result.output}`);
    }
  }
  return { index: finalIndex, json, written: true };
}

function ghReleaseByTag(tag) {
  const result = spawnSync('gh', ['api', `repos/${REPOSITORY}/releases/tags/${tag}`], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`gh api failed for ${tag}: ${result.stderr}`);
  return JSON.parse(result.stdout);
}

async function downloadBundle(url, expectedSize) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(BUNDLE_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}: ${url}`);
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > Math.min(expectedSize, MAX_BUNDLE_BYTES)) throw new Error(`The download passed ${expectedSize} bytes`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await publishIndex({
      root: REPO_ROOT,
      version: options.version,
      withdraw: options.withdraw,
      revokeKeyId: options.revokeKey,
      bundleFile: options.bundleFile,
      publicKeyTexts: options.publicKeys.map((file) => readFileSync(file, 'utf8')),
      signer: options.dryRun ? null : cliSigner({ secretKeyPath: options.secretKey }),
      fetchRelease: async (tag) => ghReleaseByTag(tag),
      fetchBundle: downloadBundle,
      commit: options.commit,
      dryRun: options.dryRun,
    });
    console.log(result.json);
    console.log(result.written ? `Wrote and verified ${INDEX_PATH} and ${SIGNATURE_PATH}${options.commit ? ' and committed them' : ''}.` : 'Dry run: nothing was written.');
    if (result.written && !options.commit) console.log(`Review, then commit both files together with approval: git commit -- ${INDEX_PATH} ${SIGNATURE_PATH}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
