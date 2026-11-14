#!/usr/bin/env node
// Guards for the `framework-release` workflow. Each command checks one condition and exits non-zero
// when it fails:
//   tag-matches-manifest TAG  TAG is exactly `pipes-framework-v<.pipes.example manifest version>`
//   latest-is-app-release     the latest GitHub release has an app tag that Pipes Local can parse
//   release-absent TAG        no GitHub release exists for TAG yet
//
// `parseAppReleaseTag` mirrors `parse_release_version` in pipes-local `src-tauri/src/app_update.rs`:
// it strips `pipes-local-v` or `v` and requires a strict SemVer version.
//
// Usage: node scripts/framework-release-guard.mjs <command> [TAG]

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPOSITORY, TAG_PREFIX } from './lib/framework-index.mjs';
import { isStrictSemver } from './lib/semver.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Returns the app version of a release tag, or null when Pipes Local cannot parse it. */
export function parseAppReleaseTag(tag) {
  if (typeof tag !== 'string') return null;
  const normalized = tag.startsWith('pipes-local-v') ? tag.slice('pipes-local-v'.length) : tag.startsWith('v') ? tag.slice(1) : tag;
  return isStrictSemver(normalized, { allowBuild: true }) ? normalized : null;
}

export function assertLatestIsAppRelease(tag) {
  if (typeof tag === 'string' && tag.startsWith(TAG_PREFIX)) {
    throw new Error(`The latest release is the framework release ${tag}; the app update check would report it. Mark the latest app release as latest again.`);
  }
  if (parseAppReleaseTag(tag) === null) throw new Error(`The latest release tag ${JSON.stringify(tag)} is not an app release tag that Pipes Local can parse`);
}

export function assertTagMatchesManifest(tag, manifest) {
  const version = manifest?.frameworkVersion;
  if (!isStrictSemver(version)) throw new Error('The .pipes.example manifest has no valid frameworkVersion');
  if (tag !== `${TAG_PREFIX}${version}`) throw new Error(`Tag ${JSON.stringify(tag)} does not equal ${TAG_PREFIX}${version}`);
}

function gh(args) {
  return spawnSync('gh', args, { encoding: 'utf8' });
}

function repository() {
  return process.env.GITHUB_REPOSITORY || REPOSITORY;
}

function latestReleaseTag() {
  const result = gh(['api', `repos/${repository()}/releases/latest`, '--jq', '.tag_name']);
  if (result.status !== 0) throw new Error(`gh api releases/latest failed: ${result.stderr}`);
  return result.stdout.trim();
}

function assertReleaseAbsent(tag) {
  const result = gh(['release', 'view', tag, '--repo', repository(), '--json', 'tagName']);
  if (result.status === 0) throw new Error(`A release for ${tag} already exists; fix forward with a new version instead`);
  if (!/release not found/i.test(result.stderr)) throw new Error(`gh release view failed: ${result.stderr}`);
}

export function main(argv) {
  const [command, tag] = argv;
  if (command === 'tag-matches-manifest') {
    assertTagMatchesManifest(tag, JSON.parse(readFileSync(path.join(REPO_ROOT, '.pipes.example', 'manifest.json'), 'utf8')));
    return `Tag ${tag} matches the manifest.`;
  }
  if (command === 'latest-is-app-release') {
    const latest = latestReleaseTag();
    assertLatestIsAppRelease(latest);
    return `The latest release is the app release ${latest}.`;
  }
  if (command === 'release-absent') {
    if (!tag) throw new Error('release-absent needs a tag');
    assertReleaseAbsent(tag);
    return `No release exists for ${tag}.`;
  }
  throw new Error(`Unknown command: ${String(command)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
