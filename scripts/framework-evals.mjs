#!/usr/bin/env node
// Runs the starter-scope framework evals against `.pipes.example`, the only framework source.
// It installs `.pipes.example` as `.pipes` into a temporary git repository with the starter's own
// `installStarter`, commits it, and runs the installed `run-evals.cjs --scope starter` there.
// A real run copies the result file to `framework-evals/<version>/` as gate G6 evidence.
//
// Usage: npm run framework:evals -- [--dry-run] [--case <id>]... [--model <model>]
//        [--budget <usd>] [--milestone] [--keep]

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STARTER_ROOT = path.join(REPO_ROOT, '.pipes.example');
const EVIDENCE_ROOT = path.join(REPO_ROOT, 'framework-evals');
const PASSTHROUGH_FLAGS = new Set(['--dry-run', '--milestone', '--keep']);
const PASSTHROUGH_VALUES = new Set(['--case', '--model', '--budget']);

export function parseArgs(argv) {
  const options = { forwarded: [], dryRun: false, keep: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (PASSTHROUGH_FLAGS.has(arg)) {
      options.forwarded.push(arg);
      if (arg === '--dry-run') options.dryRun = true;
      if (arg === '--keep') options.keep = true;
    } else if (PASSTHROUGH_VALUES.has(arg)) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value`);
      options.forwarded.push(arg, value);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function git(cwd, args) {
  const result = spawnSync(
    'git',
    ['-c', 'user.name=framework-evals', '-c', 'user.email=evals@localhost', '-c', 'commit.gpgsign=false', ...args],
    { cwd, encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
}

function resultFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.json')) : [];
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const version = JSON.parse(readFileSync(path.join(STARTER_ROOT, 'manifest.json'), 'utf8')).frameworkVersion;
  const require = createRequire(import.meta.url);
  const { installStarter } = require(path.join(STARTER_ROOT, 'utils/scripts/verify-starter.cjs'));

  const workspace = mkdtempSync(path.join(os.tmpdir(), 'pipes-framework-evals-'));
  let exitCode = 1;
  try {
    console.log(`Installing .pipes.example ${version} into ${workspace}`);
    const failed = [];
    installStarter(workspace, {
      dirName: '.pipes',
      version,
      step: (name, result) => {
        if (!result.ok) failed.push(`${name}: ${result.output.slice(0, 500)}`);
        return result.ok;
      },
    });
    if (failed.length) throw new Error(`Starter install failed:\n${failed.join('\n')}`);

    git(workspace, ['init', '-q', '-b', 'main']);
    git(workspace, ['add', '-A']);
    git(workspace, ['commit', '-q', '-m', 'framework starter install']);

    const resultsDir = path.join(workspace, '.pipes/utils/state/evals');
    const before = new Set(resultFiles(resultsDir));
    const run = spawnSync(
      process.execPath,
      [path.join(workspace, '.pipes/utils/scripts/run-evals.cjs'), '--scope', 'starter', ...options.forwarded],
      { cwd: workspace, stdio: 'inherit' },
    );
    exitCode = run.status ?? 1;

    if (!options.dryRun) {
      const created = resultFiles(resultsDir).filter((name) => !before.has(name)).sort();
      if (created.length !== 1) {
        console.error(`Expected one new eval result file, found ${created.length}; no evidence was copied.`);
        exitCode = exitCode || 1;
      } else {
        const target = path.join(EVIDENCE_ROOT, version, created[0]);
        mkdirSync(path.dirname(target), { recursive: true });
        copyFileSync(path.join(resultsDir, created[0]), target);
        console.log(`Eval evidence: ${path.relative(REPO_ROOT, target)}`);
      }
    }
  } finally {
    if (options.keep) console.log(`Kept ${workspace}`);
    else rmSync(workspace, { recursive: true, force: true });
  }
  process.exitCode = exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
