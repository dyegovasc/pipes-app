---
title: Framework Provenance
description: Defines deterministic framework release metadata, ownership, versioning, and installed-provenance safety.
version: 1.9
rule_type: governance
enforcement: binding
enforced_by: [model, hook, ci]
hooks:
  - event: PreToolUse
    matcher: Edit|Write|MultiEdit|NotebookEdit
    script: hook-protect-paths.cjs
---
# Rule: Framework Provenance

## Requirement

The staged Pipes framework is a versioned release source. Its provenance metadata must be derived deterministically from canonical owned content, use the manifest and project-layout schema versions declared by the current framework major, and preserve an installed workspace's existing provenance until an approved upgrade or explicit initialization owns that change.

## Framework Identity And Schemas

- The framework identity is `pipes`.
- This repository's current staged provenance baseline is framework version `2.2.1`.
- `manifest.json` uses `manifestSchemaVersion: 2`. A manifest that this framework writes uses `projectLayoutVersion: 3`: areas `00-notes`, `01-intents`, `02-specs`, `03-missions`, `04-plans`, `05-decisions`, `06-outcomes`, and `07-artifacts`, each record named `{type}-{number}-{slug}`. The manifest validator also reads `projectLayoutVersion: 2`, so that an install from an earlier release can be compared and migrated. The record validator and the other scripts read only the layout 3 areas; an install on layout 2 is migrated first.
- `framework-baseline.json.gz` contains canonical JSON using `baselineArchiveSchemaVersion: 1`.
- `framework-fork.json` uses `forkControlSchemaVersion: 1`.
- `frameworkVersion` is valid semantic versioning and remains independent from any host application version.

## Ownership

Tracked roots are:

- `ai-instructions/`
- `team/`
- `utils/fragments/`
- `utils/pipelines/`
- `utils/rules/`
- `utils/scripts/`
- `utils/loops/`

Explicit tracked files are:

- `README.md`
- `utils/issues/README.md`
- `utils/issues/.gitkeep`
- `utils/mapping/README.md`

Opaque roots are:

- `project/`
- `utils/configs/`
- `utils/state/`
- `utils/issues/` except for its two explicit tracked files

Ignored names are:

- `.DS_Store`
- `manifest.json`
- `framework-baseline.json.gz`
- `framework-fork.json`

Unlisted top-level roots are excluded. Project tracking includes only sorted real immediate child-directory names under `project/`; nested directories and every project file path, content, size, and hash remain opaque.

## Canonical Inventory And Digests

- Reject framework-owned symbolic links and non-UTF-8 tracked file content.
- Normalize relative paths to forward slashes and sort paths and project-area names by UTF-8 byte order.
- Each tracked file snapshot contains its normalized path, literal encoding `utf-8`, raw byte size, and lowercase SHA-256 digest of the raw bytes.
- The baseline digest uses domain separator `pipes-framework-baseline-v1`; the fork digest uses `pipes-framework-fork-v1`.
- Digest input contains each domain separator followed by the canonical tracked-file inventory and immediate project-area names.
- Encode path and area-name lengths and raw file sizes as unsigned 64-bit big-endian integers; encode SHA-256 values as their raw 32 bytes.
- Canonical JSON is serialized deterministically with stable schema field construction, sorted inventories, two-space indentation, UTF-8, and one trailing newline.

## Manifest And Baseline Archive

- The compact manifest contains framework identity and version, `baselineDigest`, a bound `baselineArchive` descriptor, literal `forkControlPath: "framework-fork.json"`, the complete ownership policy, sorted immediate `projectAreas`, and sorted file snapshots.
- The archive payload contains framework identity and version, the matching baseline digest, and sorted file snapshots with exact original UTF-8 `content` in addition to path, encoding, size, and SHA-256.
- Compress the canonical archive JSON as deterministic gzip with no variable timestamp.
- The manifest binds the archive by literal path `framework-baseline.json.gz`, format `gzip-json-v1`, compressed size, uncompressed size, and compressed SHA-256.
- Archive recovery must reproduce every manifest-indexed baseline byte and verify each file hash, size, identity, version, and baseline digest.

## Fork Control And Relations

- Fork control is derived and replaceable; the manifest and bound baseline archive are immutable installed provenance.
- Fork control contains matching framework identity, version, and baseline digest; `baselineRelation`; the fork digest; unchanged, created, modified, and deleted counts; sorted created, modified, and deleted entries; and immediate project-area changes.
- Created and modified entries contain only path, raw size, and SHA-256. Deleted entries contain only baseline paths. Customized file contents never appear in fork control.
- `origin` means direct evidence proves the workspace was copied or upgraded from the installed manifest.
- `adopted` means a pre-existing manifest-less workspace uses the current starter manifest only as its comparison baseline without claiming historical origin.
- `unresolved` means a valid manifest exists but trustworthy matching relation evidence is unavailable.
- Preserve a relation only when framework identity, version, and baseline digest match the installed manifest.

## Version And Immutability

- Every change to tracked baseline bytes or the immediate project-area inventory requires a different valid framework SemVer before starter metadata is replaced.
- Use a patch increment for compatible baseline maintenance unless new capability or incompatibility warrants a minor or major increment.
- Changes limited to opaque or ignored content do not require a framework-version increment.
- Generation or checking must fail before overwrite when baseline input changed but framework version did not.
- Never silently replace an existing valid installed manifest or baseline archive, including this repository's adopted `.pipes/manifest.json` and `.pipes/framework-baseline.json.gz`.
- Preserve invalid installed provenance byte-for-byte and report it; do not repair or replace it automatically.
- Missing-provenance initialization, relation changes, and successful upgrades require the authority and write ordering declared by their governing workflow.

## Tooling Boundary

Deterministic static tooling may scan canonical framework content, generate or validate the three release metadata files, compare freshness, and enforce version changes. It must not select work, own mission state, schedule execution, infer historical origin, expose project contents, or overwrite installed provenance without explicit authority.

## Static Tool Contract

- `utils/scripts/generate-framework-provenance.cjs` is a root-scoped CommonJS library and CLI using only Node.js built-ins.
- Every CLI invocation requires `--root` and exactly one of `--check`, `--bootstrap`, `--write`, or `--refresh-fork`.
- `--check` is read-only and validates canonical manifest bytes, bound deterministic archive bytes, current baseline freshness, and current fork-control bytes.
- `--bootstrap` additionally requires `--allow-baseline-initialization --framework-version {semver}`, refuses any existing provenance file, and writes archive, manifest, then clean origin control.
- `--write` additionally requires `--allow-baseline-replacement --framework-version {semver}`, validates existing immutable provenance, rejects changed baseline input without a different version, and writes only changed archive, manifest, and clean origin control bytes.
- `--refresh-fork` validates immutable provenance, preserves a trustworthy matching relation or uses `unresolved`, and can write only changed fork-control bytes.
- The exported runner enforces the same root, mode, version, and write-authority rules as CLI parsing so library callers cannot bypass protected boundaries.
- All writes use exclusive temporary siblings, atomic rename, and byte-identical no-op detection. A validation or authority failure happens before the first governed write.
- Success summaries may report framework version, baseline file count, manifest and archive sizes, fork counts, relation, and changed paths; they never report tracked contents.

## Checks

- Verify all three schema identifiers, framework identity, and version are consistent.
- Verify ownership admits only the declared paths and immediate project-area names.
- Verify canonical ordering, hashes, digest encodings, deterministic JSON and gzip, and complete archive binding.
- Verify fork control contains no customized contents or project-file metadata.
- Verify tracked baseline changes require a framework-version change and excluded-only changes do not.
- Verify clean starter metadata uses `origin`, adoption uses `adopted`, and missing trustworthy relation evidence uses `unresolved`.
- Verify installed provenance remains unchanged unless a separately authorized initialization or upgrade owns the write.
- Verify CLI and library modes enforce identical authority, effect, atomicity, no-op, and reporting contracts.
