---
title: Survey Workspace Repositories
description: Lists the repositories a workspace covers and reads their agent and architecture docs read-only as evidence.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Survey Workspace Repositories

## Instructions

1. Read the layout in `.pipes/ai-instructions/delivery.md` when it exists; otherwise the layout is `single-repo`. In `single-repo` layout, the only repository is this one. In `multi-repo` layout, list every direct child of the services root that is a git repository; exclude this repository's own `.pipes/` and records.
2. For each repository, read only documentation and configuration that describe it: `README.md`, `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `SECURITY.md`, other top-level design docs, the code-owner source, for example `.github/CODEOWNERS`, the build file, and CI workflow names. Never change a repository and never run its build in this step.
3. Record for each repository: its purpose in one sentence, its role (for example service, gateway, adapter, library, test suite, configuration, or archive), its owners from the code-owner source, its main store and integrations when stated, and which docs exist.
4. Mark repositories without agent or architecture docs, and pointers in docs that do not resolve.
5. For a large workspace, delegate the reading to a read-only research agent per group of repositories and keep only the summarized facts with their paths.

## Output

- Repository table: name, purpose, role, owners, store and integrations, docs present
- Evidence paths for each fact
- Repositories without docs and broken pointers
