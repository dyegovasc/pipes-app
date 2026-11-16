---
title: Starter Kit Integrity
description: Keeps canonical Markdown and its small generated discovery surfaces coherent.
version: 2.5
rule_type: validation
enforcement: binding
enforced_by: [model, ci]
---
# Rule: Starter Kit Integrity

## Requirement

A starter-kit change is complete only when staged source, installed Markdown, generated discovery surfaces, and development tests agree.

## Checks

- Keep exactly five starter loops and seventeen pipelines unless an approved framework decision changes the inventory.
- Project content is never starter content: rules with `scope: project`, eval cases with `scope: project`, project records, and the filled project instructions (`project.md`, `delivery.md`, `accountability.md`, `architecture.md`, `corrections.md`, and the filled conventions rule) ship as placeholders or not at all.
- Scope that exact inventory to the shipped `.pipes.example` baseline. Installed `.pipes` workspaces may add any number of valid pipelines, and reusable discovery, skill-generation, catalog, and clean-install tests must derive expectations from the active inventory rather than impose the starter count.
- Every pipeline has `## Loop Use`; every loop has real stop conditions.
- Referenced fragments, rules, roles, pipelines, and paths resolve.
- Scripts are limited to instruction, skill, catalog, hook-settings, and mapping generation, read-only Markdown and project-record validation, and read-only deterministic gate hooks that return allow, ask, or deny.
- Generate one managed skill per loop and one per pipeline for each target.
- Refresh catalog, source map, wrappers, and managed skills after source changes.
- Remove stale managed files whose canonical source no longer exists.
- Validate a clean temporary install using generators only.
- Installed outputs use canonical `.pipes/` paths and contain no staged-root leaks.
- Canonical Markdown and generated discovery surfaces pass `validate-pure-markdown.cjs`.
- Resolve and apply `rule-framework-provenance` whenever tracked starter baseline content, immediate project-area inventory, framework version, or provenance metadata changes.
- Require generated starter provenance to match the current tracked baseline and framework version before a release or clean installation is accepted.
- Preserve existing installed manifests, baseline archives, and their provenance relation unless a separately authorized initialization or upgrade owns the write.
