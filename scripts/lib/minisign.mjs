// minisign signatures for the framework index, with Node built-ins only.
//
// Public key: base64("Ed" | key id (8 bytes) | Ed25519 public key (32 bytes)).
// Signature file, four lines:
//   untrusted comment: <text>
//   base64("ED" | key id (8 bytes) | Ed25519 signature of BLAKE2b-512(message) (64 bytes))
//   trusted comment: <text>
//   base64(Ed25519 signature of (the 64 signature bytes | trusted comment bytes))
//
// Only prehashed `ED` signatures are accepted; the legacy `Ed` algorithm is refused.
// Key id text: minisign reads the 8 raw key id bytes as a little-endian u64 and prints 16
// uppercase hex digits, so the text is the raw bytes in reverse order.
//
// Production signing runs the maintainer's `minisign` CLI (`cliSigner`), so the secret key and its
// password never pass through this code. `createTestSigner` makes a throwaway key in memory for tests.

import { spawnSync } from 'node:child_process';
import { createHash, createPublicKey, generateKeyPairSync, randomBytes, sign, verify } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const PUBLIC_KEY_ALGORITHM = 'Ed';
const SIGNATURE_ALGORITHM = 'ED';
const LEGACY_SIGNATURE_ALGORITHM = 'Ed';
const UNTRUSTED_PREFIX = 'untrusted comment: ';
const TRUSTED_PREFIX = 'trusted comment: ';

function fail(message) {
  throw new Error(`minisign: ${message}`);
}

function strictBase64(text, expectedLength, label) {
  if (typeof text !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(text)) fail(`${label} is not base64`);
  const bytes = Buffer.from(text, 'base64');
  if (bytes.toString('base64') !== text) fail(`${label} is not canonical base64`);
  if (bytes.length !== expectedLength) fail(`${label} has ${bytes.length} bytes; expected ${expectedLength}`);
  return bytes;
}

export function keyIdToText(keyIdBytes) {
  if (!Buffer.isBuffer(keyIdBytes) || keyIdBytes.length !== 8) fail('key id must be 8 bytes');
  return Buffer.from(keyIdBytes).reverse().toString('hex').toUpperCase();
}

export function keyIdFromText(text) {
  if (typeof text !== 'string' || !/^[0-9A-F]{16}$/.test(text)) fail(`key id text must be 16 uppercase hex digits: ${String(text)}`);
  return Buffer.from(text, 'hex').reverse();
}

export function isKeyIdText(text) {
  return typeof text === 'string' && /^[0-9A-F]{16}$/.test(text);
}

export function blake2b512(bytes) {
  return createHash('blake2b512').update(bytes).digest();
}

function nonEmptyLines(text) {
  return text.replace(/\r\n/g, '\n').split('\n').filter((line) => line.length > 0);
}

/** Parses a public key file (two lines) or its base64 line alone. */
export function parsePublicKey(text) {
  if (typeof text !== 'string') fail('public key text is required');
  const lines = nonEmptyLines(text);
  const keyLine = lines.length === 2 && lines[0].startsWith(UNTRUSTED_PREFIX) ? lines[1] : lines.length === 1 ? lines[0] : null;
  if (!keyLine) fail('public key must be one base64 line, optionally after an untrusted comment');
  const bytes = strictBase64(keyLine, 42, 'public key');
  if (bytes.subarray(0, 2).toString('latin1') !== PUBLIC_KEY_ALGORITHM) fail('public key algorithm must be Ed');
  const keyIdBytes = Buffer.from(bytes.subarray(2, 10));
  const publicKey = Buffer.from(bytes.subarray(10, 42));
  return { keyId: keyIdToText(keyIdBytes), keyIdBytes, publicKey };
}

export function formatPublicKey({ keyIdBytes, publicKey }) {
  const bytes = Buffer.concat([Buffer.from(PUBLIC_KEY_ALGORITHM, 'latin1'), keyIdBytes, publicKey]);
  return `${UNTRUSTED_PREFIX}minisign public key ${keyIdToText(keyIdBytes)}\n${bytes.toString('base64')}\n`;
}

/** Parses a four-line signature file without verifying it. */
export function parseSignature(text) {
  if (typeof text !== 'string') fail('signature text is required');
  const lines = nonEmptyLines(text);
  if (lines.length !== 4) fail(`signature must have 4 lines; found ${lines.length}`);
  if (!lines[0].startsWith(UNTRUSTED_PREFIX)) fail('line 1 must be an untrusted comment');
  if (!lines[2].startsWith(TRUSTED_PREFIX)) fail('line 3 must be a trusted comment');
  const bytes = strictBase64(lines[1], 74, 'signature');
  const globalSignature = strictBase64(lines[3], 64, 'global signature');
  const algorithm = bytes.subarray(0, 2).toString('latin1');
  const keyIdBytes = Buffer.from(bytes.subarray(2, 10));
  return {
    algorithm,
    keyIdBytes,
    keyId: keyIdToText(keyIdBytes),
    signature: Buffer.from(bytes.subarray(10, 74)),
    trustedComment: lines[2].slice(TRUSTED_PREFIX.length),
    globalSignature,
  };
}

function ed25519PublicKey(raw) {
  return createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: raw.toString('base64url') }, format: 'jwk' });
}

/**
 * Verifies `message` against a signature file and a list of parsed public keys. Accepts only `ED`.
 * Returns the signer key id and the trusted comment; throws on any failure.
 */
export function verifySignature({ message, signatureText, publicKeys }) {
  const parsed = parseSignature(signatureText);
  if (parsed.algorithm === LEGACY_SIGNATURE_ALGORITHM) fail('the legacy Ed algorithm is not accepted; only prehashed ED signatures are');
  if (parsed.algorithm !== SIGNATURE_ALGORITHM) fail(`unknown signature algorithm: ${JSON.stringify(parsed.algorithm)}`);
  const key = publicKeys.find((candidate) => candidate.keyIdBytes.equals(parsed.keyIdBytes));
  if (!key) fail(`no trusted public key has key id ${parsed.keyId}`);
  const publicKey = ed25519PublicKey(key.publicKey);
  if (!verify(null, blake2b512(message), publicKey, parsed.signature)) fail('signature does not verify');
  const globalMessage = Buffer.concat([parsed.signature, Buffer.from(parsed.trustedComment, 'utf8')]);
  if (!verify(null, globalMessage, publicKey, parsed.globalSignature)) fail('trusted comment signature does not verify');
  return { keyId: parsed.keyId, trustedComment: parsed.trustedComment };
}

function formatSignature({ algorithm, keyIdBytes, signature, trustedComment, globalSignature }) {
  const bytes = Buffer.concat([Buffer.from(algorithm, 'latin1'), keyIdBytes, signature]);
  return [
    `${UNTRUSTED_PREFIX}signature from minisign secret key`,
    bytes.toString('base64'),
    `${TRUSTED_PREFIX}${trustedComment}`,
    globalSignature.toString('base64'),
    '',
  ].join('\n');
}

/**
 * A throwaway signer for tests. The key exists only in memory; it is never written to disk and no
 * production build trusts it.
 */
export function createTestSigner({ keyIdBytes = randomBytes(8) } = {}) {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const rawPublicKey = Buffer.from(publicKey.export({ format: 'jwk' }).x, 'base64url');
  const signMessage = (message, trustedComment, algorithm = SIGNATURE_ALGORITHM) => {
    const signed = algorithm === SIGNATURE_ALGORITHM ? blake2b512(message) : message;
    const signature = sign(null, signed, privateKey);
    const globalSignature = sign(null, Buffer.concat([signature, Buffer.from(trustedComment, 'utf8')]), privateKey);
    return formatSignature({ algorithm, keyIdBytes, signature, trustedComment, globalSignature });
  };
  return {
    keyId: keyIdToText(keyIdBytes),
    publicKeyText: formatPublicKey({ keyIdBytes, publicKey: rawPublicKey }),
    signMessage,
    signFile({ messagePath, signaturePath, trustedComment }) {
      writeFileSync(signaturePath, signMessage(readFileSync(messagePath), trustedComment));
    },
  };
}

/**
 * Signs with the maintainer's `minisign` CLI. minisign asks for the key password on the terminal;
 * this code never reads the secret key file or the password.
 */
export function cliSigner({ secretKeyPath, minisignPath = 'minisign' }) {
  if (!secretKeyPath) fail('a secret key path is required');
  return {
    signFile({ messagePath, signaturePath, trustedComment }) {
      const result = spawnSync(minisignPath, ['-S', '-s', secretKeyPath, '-m', messagePath, '-x', signaturePath, '-t', trustedComment], {
        stdio: 'inherit',
      });
      if (result.error) fail(`cannot run ${minisignPath}: ${result.error.message}`);
      if (result.status !== 0) fail(`${minisignPath} exited with status ${result.status}`);
    },
  };
}
