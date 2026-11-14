---
title: Deterministic Enforcement
description: Requires every rule to declare how it is enforced and backs protected effects with hooks, CI checks, or managed settings.
version: 1.0
rule_type: governance
applies_to:
  - rules
  - scripts
enforcement: binding
enforced_by: [model, ci]
gate_relevance:
  evaluates_gates: false
  required_for_gate_types:
    - deterministic
---
# Rule: Deterministic Enforcement

## Requirement

Instructions and skills are advisory: an agent can miss them. A rule becomes deterministic only when a hook, a CI or pull request check, or a managed setting enforces it. Every rule declares `enforced_by` as a list drawn from `model`, `hook`, `ci`, and `managed-setting`, so enforcement gaps stay visible.

## Enforcement

`binding`. The script test suite verifies that every rule declares a valid `enforced_by` list.

## Checks

- Every `utils/rules/rule-*.md` declares `enforced_by` with at least one of `model`, `hook`, `ci`, or `managed-setting`.
- A binding rule that guards a protected effect, such as a commit, push, merge, promotion, deployment, or infrastructure change, and lists only `model` is a reportable gap.
- A rule that lists `hook` declares its hooks in frontmatter with `event`, `matcher`, and `script`; `assemble-hooks.cjs` generates `.claude/settings.json` from them.
- Hook scripts are fast, read-only, dependency-free, and return allow, ask, or deny without side effects. A protected effect fails closed.
- A hook on `Edit` or `Write` does not see shell-command file rewrites, so repeat the same check as a CI or pull request check.
- Regenerate hooks after a rule's hook declaration changes, and verify with `node .pipes/utils/scripts/assemble-hooks.cjs --check`.
