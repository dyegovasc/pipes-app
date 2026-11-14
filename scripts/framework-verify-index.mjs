#!/usr/bin/env node
// Verifies the committed signed index, when one exists. `npm run check` runs it, so the integrity
// workflow checks every index commit. With no index yet, it passes.
//
// Checks: both index files exist together; the signature verifies with a key in frameworks/keys/*.pub
// and is prehashed; the trusted comment matches generatedAt; the signer is not revoked; the index
// schema is valid; and each entry's minAppVersion equals frameworks/compatibility.json. A released
// version's compatibility entry never changes, so a later edit of that file fails here.
//
// Usage: node scripts/framework-verify-index.mjs

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCompatibility } from './framework-release.mjs';
import { INDEX_PATH, SIGNATURE_PATH, assertSignerNotRevoked, trustedComment, validateIndex } from './lib/framework-index.mjs';
import { parsePublicKey, verifySignature } from './lib/minisign.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEYS_DIR = 'frameworks/keys';

export function verifyFrameworkIndex(root) {
  const indexPath = path.join(root, INDEX_PATH);
  const signaturePath = path.join(root, SIGNATURE_PATH);
  const hasIndex = existsSync(indexPath);
  const hasSignature = existsSync(signaturePath);
  if (!hasIndex && !hasSignature) return { published: false };
  if (!hasIndex || !hasSignature) throw new Error(`${INDEX_PATH} and ${SIGNATURE_PATH} must exist together`);

  const keysDir = path.join(root, KEYS_DIR);
  const keyFiles = existsSync(keysDir) ? readdirSync(keysDir).filter((name) => name.endsWith('.pub')).sort() : [];
  if (keyFiles.length === 0) throw new Error(`An index exists, but ${KEYS_DIR}/ has no public key`);
  const publicKeys = keyFiles.map((name) => parsePublicKey(readFileSync(path.join(keysDir, name), 'utf8')));
  if (new Set(publicKeys.map((key) => key.keyId)).size !== publicKeys.length) throw new Error(`${KEYS_DIR}/ has two keys with the same key id`);

  const message = readFileSync(indexPath);
  const { keyId, trustedComment: comment } = verifySignature({ message, signatureText: readFileSync(signaturePath, 'utf8'), publicKeys });
  const index = validateIndex(JSON.parse(message.toString('utf8')));
  if (comment !== trustedComment(index.generatedAt)) throw new Error('The index trusted comment does not match its generatedAt');
  assertSignerNotRevoked(index, keyId);

  const compatibility = readCompatibility(root);
  for (const entry of index.versions) {
    const expected = compatibility.versions[entry.frameworkVersion]?.minAppVersion;
    if (expected !== entry.minAppVersion) {
      throw new Error(`${entry.frameworkVersion}: the index says minAppVersion ${entry.minAppVersion}, but frameworks/compatibility.json says ${expected ?? 'nothing'}`);
    }
  }
  return { published: true, generatedAt: index.generatedAt, signer: keyId, versions: index.versions.map((entry) => entry.frameworkVersion) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = verifyFrameworkIndex(REPO_ROOT);
    console.log(result.published ? `Framework index verified: ${result.versions.join(', ') || 'no versions'} · generatedAt ${result.generatedAt} · signed by ${result.signer}` : 'No framework index is published yet.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
