import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createTestSigner,
  keyIdFromText,
  keyIdToText,
  parsePublicKey,
  parseSignature,
  verifySignature,
} from './lib/minisign.mjs';

const MESSAGE = Buffer.from('{"indexSchemaVersion":1}\n');
const COMMENT = 'pipes-framework-index v1 generatedAt=2026-11-14T15:00:00Z';

function lines(text) {
  return text.split('\n');
}

test('key id text is the raw bytes in reverse order', () => {
  const raw = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
  assert.equal(keyIdToText(raw), '0807060504030201');
  assert.deepEqual(keyIdFromText('0807060504030201'), raw);
  assert.throws(() => keyIdFromText('abcdef0123456789'), /uppercase hex/);
  assert.equal(keyIdToText(keyIdFromText('ABCDEF0123456789')), 'ABCDEF0123456789');
  assert.throws(() => keyIdFromText('08070605'), /16 uppercase hex/);
});

test('a test signature round-trips and reports the key id and trusted comment', () => {
  const signer = createTestSigner({ keyIdBytes: Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]) });
  const publicKey = parsePublicKey(signer.publicKeyText);
  assert.equal(publicKey.keyId, '0807060504030201');
  const signatureText = signer.signMessage(MESSAGE, COMMENT);
  assert.equal(parseSignature(signatureText).algorithm, 'ED');
  assert.deepEqual(verifySignature({ message: MESSAGE, signatureText, publicKeys: [publicKey] }), { keyId: '0807060504030201', trustedComment: COMMENT });
});

test('a public key parses from its base64 line alone', () => {
  const signer = createTestSigner();
  assert.equal(parsePublicKey(lines(signer.publicKeyText)[1]).keyId, signer.keyId);
});

test('tampering with the message, trusted comment, or signatures is rejected', () => {
  const signer = createTestSigner();
  const publicKeys = [parsePublicKey(signer.publicKeyText)];
  const signatureText = signer.signMessage(MESSAGE, COMMENT);
  assert.throws(() => verifySignature({ message: Buffer.from('{}\n'), signatureText, publicKeys }), /signature does not verify/);

  const comment = lines(signatureText);
  comment[2] = 'trusted comment: pipes-framework-index v1 generatedAt=2030-01-01T00:00:00Z';
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText: comment.join('\n'), publicKeys }), /trusted comment signature does not verify/);

  const global = lines(signatureText);
  const globalBytes = Buffer.from(global[3], 'base64');
  globalBytes[0] ^= 1;
  global[3] = globalBytes.toString('base64');
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText: global.join('\n'), publicKeys }), /trusted comment signature does not verify/);

  const body = lines(signatureText);
  const bodyBytes = Buffer.from(body[1], 'base64');
  bodyBytes[20] ^= 1;
  body[1] = bodyBytes.toString('base64');
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText: body.join('\n'), publicKeys }), /signature does not verify/);
});

test('a signature from an untrusted key or with a changed key id is rejected', () => {
  const signer = createTestSigner();
  const other = createTestSigner();
  const signatureText = signer.signMessage(MESSAGE, COMMENT);
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText, publicKeys: [parsePublicKey(other.publicKeyText)] }), /no trusted public key has key id/);

  // Same key id, different key: the signature must not verify.
  const impostor = createTestSigner({ keyIdBytes: parsePublicKey(signer.publicKeyText).keyIdBytes });
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText, publicKeys: [parsePublicKey(impostor.publicKeyText)] }), /signature does not verify/);
});

test('the legacy Ed algorithm and unknown algorithms are refused', () => {
  const signer = createTestSigner();
  const publicKeys = [parsePublicKey(signer.publicKeyText)];
  const legacy = signer.signMessage(MESSAGE, COMMENT, 'Ed');
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText: legacy, publicKeys }), /legacy Ed algorithm/);
  const unknown = signer.signMessage(MESSAGE, COMMENT, 'XX');
  assert.throws(() => verifySignature({ message: MESSAGE, signatureText: unknown, publicKeys }), /unknown signature algorithm/);
});

test('malformed signature and public key text is rejected', () => {
  const signer = createTestSigner();
  const signatureText = signer.signMessage(MESSAGE, COMMENT);
  assert.throws(() => parseSignature(lines(signatureText).slice(0, 3).join('\n')), /4 lines/);
  const badBase64 = lines(signatureText);
  badBase64[1] = `${badBase64[1].slice(0, -4)}!!!!`;
  assert.throws(() => parseSignature(badBase64.join('\n')), /not base64/);
  const noTrusted = lines(signatureText);
  noTrusted[2] = noTrusted[2].replace('trusted comment: ', 'comment: ');
  assert.throws(() => parseSignature(noTrusted.join('\n')), /trusted comment/);
  assert.throws(() => parsePublicKey('RWQ='), /bytes; expected 42/);
  assert.throws(() => parsePublicKey('a\nb\nc'), /one base64 line/);
});

// Runs only when the maintainer has installed minisign. It never touches a production key: it
// generates a throwaway, password-less key in a temporary folder and deletes it afterwards.
const minisignInstalled = spawnSync('minisign', ['-v'], { encoding: 'utf8' }).status === 0;
test('interop: a minisign CLI signature verifies with this module', { skip: minisignInstalled ? false : 'minisign is not installed' }, (context) => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'pipes-minisign-interop-'));
  context.after(() => rmSync(dir, { recursive: true, force: true }));
  const pub = path.join(dir, 'test.pub');
  const sec = path.join(dir, 'test.key');
  const message = path.join(dir, 'index.json');
  writeFileSync(message, MESSAGE);
  assert.equal(spawnSync('minisign', ['-G', '-W', '-p', pub, '-s', sec], { encoding: 'utf8' }).status, 0);
  assert.equal(spawnSync('minisign', ['-S', '-s', sec, '-m', message, '-t', COMMENT], { encoding: 'utf8' }).status, 0);
  const result = verifySignature({
    message: MESSAGE,
    signatureText: readFileSync(`${message}.minisig`, 'utf8'),
    publicKeys: [parsePublicKey(readFileSync(pub, 'utf8'))],
  });
  assert.equal(result.trustedComment, COMMENT);
});

// Real minisign output: public test vectors from the minisign-verify crate (scripts/fixtures/minisign).
const FIXTURES = new URL('./fixtures/minisign/', import.meta.url);
const fixture = (name) => readFileSync(new URL(name, FIXTURES));

test('a real minisign prehashed signature verifies, and the key id text equals what minisign prints', () => {
  const publicKey = parsePublicKey(fixture('public.pub').toString('utf8'));
  assert.equal(publicKey.keyId, 'E7620F1842B4E81F');
  const result = verifySignature({ message: fixture('message.txt'), signatureText: fixture('prehashed.minisig').toString('utf8'), publicKeys: [publicKey] });
  assert.deepEqual(result, { keyId: 'E7620F1842B4E81F', trustedComment: 'timestamp:1556193335\tfile:test' });
  assert.throws(
    () => verifySignature({ message: Buffer.from('Test'), signatureText: fixture('prehashed.minisig').toString('utf8'), publicKeys: [publicKey] }),
    /signature does not verify/,
  );
});

test('a real minisign legacy signature is refused', () => {
  const publicKey = parsePublicKey(fixture('public.pub').toString('utf8'));
  assert.throws(
    () => verifySignature({ message: fixture('message.txt'), signatureText: fixture('legacy.minisig').toString('utf8'), publicKeys: [publicKey] }),
    /legacy Ed algorithm/,
  );
});
