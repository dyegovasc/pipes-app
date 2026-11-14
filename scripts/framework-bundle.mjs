#!/usr/bin/env node
// Builds the starter bundle of `.pipes.example` and writes it to `dist/pipes-starter-<version>.json.gz`.
// With --check it then reads the written file back, decompresses it, verifies it, and compares every
// file with the source. The version defaults to the `.pipes.example` manifest version.
//
// Usage: npm run framework:bundle -- [--version X] [--out dir] [--check]

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STARTER_DIR,
  buildStarterBundle,
  bundleFileName,
  compareWithStarterTree,
  sha256,
  verifyStarterBundle,
} from './lib/starter-bundle.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseArgs(argv) {
  const options = { version: null, out: 'dist', check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--version' || arg === '--out') {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      options[arg.slice(2)] = value;
      index += 1;
    } else if (arg === '--check') {
      options.check = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

export function bundleAndCheck({ root, version, out, check }) {
  const resolvedVersion = version ?? JSON.parse(readFileSync(path.join(root, STARTER_DIR, 'manifest.json'), 'utf8')).frameworkVersion;
  const { compressed } = buildStarterBundle({ root, version: resolvedVersion });
  const target = path.resolve(root, out, bundleFileName(resolvedVersion));
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, compressed);
  let fileCount = null;
  if (check) {
    const written = readFileSync(target);
    const verified = verifyStarterBundle(written, { version: resolvedVersion });
    const problems = compareWithStarterTree(verified, root);
    if (problems.length) throw new Error(`The bundle does not match ${STARTER_DIR}:\n${problems.join('\n')}`);
    fileCount = verified.files.size;
  }
  return { target, version: resolvedVersion, size: compressed.length, sha256: sha256(compressed), fileCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = bundleAndCheck({ root: REPO_ROOT, ...options });
    console.log(`Pipes starter bundle ${result.version}: ${path.relative(REPO_ROOT, result.target)} · ${result.size} bytes · sha256 ${result.sha256}`);
    if (result.fileCount !== null) console.log(`Verified ${result.fileCount} files against ${STARTER_DIR}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
