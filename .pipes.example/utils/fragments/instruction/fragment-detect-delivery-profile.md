---
title: Detect Delivery Profile
description: Derives the project's delivery facts from repository evidence so the delivery profile is evidence-backed, not invented.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Detect Delivery Profile

## Instructions

1. Detect the layout. When the workspace root holds sibling directories that are separate git repositories and the root has little or no product code, propose `multi-repo` with that root as the services root; otherwise propose `single-repo`.
2. Detect protected branches from the default branch, branch names that pull requests target, contribution docs, and read-only `gh api repos/{owner}/{repo}/branches/{branch}/protection` when available. When nothing is found, propose the default branch only.
3. Detect environments from CI and deployment configuration: workflow inputs such as `environment`, GitHub environments, and deployment directories such as per-environment folders. For each environment, propose an autonomy: `auto` when it deploys on merge without a manual dispatch, `ask` for a manually dispatched non-production environment, and `ticket` for production and for the `*` row of unlisted environments.
4. Detect release workflows that dispatch releases, promotions, or deployments, and record the dispatch command for each environment as the workflow expects it.
5. Detect the change-ticket pattern and approver from contribution docs, workflow inputs, or release notes. When none exists and an environment needs `ticket`, ask the user; never invent a pattern.
6. Detect build, verify, and format commands from build files, CI steps, and agent docs, with what a healthy run prints.
7. Detect the issue-tracker key pattern from branch names, commit messages, and pull request titles.
8. Mark every value as `detected` with its evidence path, or `asked` with the user's answer. Leave nothing unmarked.

## Output

- Proposed values for every section of the delivery profile, each with its evidence path or the user's answer
- Open questions for values that evidence cannot establish
