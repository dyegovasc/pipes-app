---
title: Commit Guardrails
description: Protects staging, commits, pushes, publishing, and deployments from happening without explicit scope and approval.
version: 1.5
rule_type: safety
applies_to:
  - scripts
  - records
enforcement: binding
enforced_by: [model, hook]
hooks:
  - event: PreToolUse
    matcher: Bash
    script: hook-guard-protected-actions.cjs
gate_relevance:
  evaluates_gates: true
  required_for_gate_types:
    - deterministic
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Commit Guardrails

## Requirement

Staging, committing, pushing, publishing, and deployment are protected actions. Do not perform them silently or as an implied side effect of framework work.

## Enforcement

`binding`. The `hook-guard-protected-actions.cjs` PreToolUse hook enforces the command-level checks deterministically in Claude Code sessions.

## Checks

- Inspect the working tree before staging or committing when a VCS exists.
- Do not revert, overwrite, or discard unrelated user changes.
- Stage only files that belong to the approved scope.
- Obtain explicit user approval before commits, pushes, releases, publishing, or production deployment.
- Include verification evidence and known residual risk in any commit or release summary.
- Never push to a protected branch (the branches in `.pipes/ai-instructions/delivery.md` when it exists, otherwise `main` and `master`), force-push, merge a pull request, or approve a pull request; changes reach shared branches only through a reviewed pull request.
- Without a delivery profile, every release or promotion needs the confirmation of the holder of gate G5 (core.md Gates). When `.pipes/ai-instructions/delivery.md` exists, apply its environment autonomy to releases and promotions: `auto` environments deploy without an agent dispatch, `ask` environments only after a human confirms the exact dispatch, and `ticket` environments only with an approved change ticket that matches the profile's pattern and its approver.
- Never apply infrastructure directly with tools such as Terraform, kubectl, Helm, or GitOps controllers; infrastructure changes through pull requests to its source repositories.
- Follow the commit and pull request attribution policy of the project when a project rule declares one.
- Link each pull request to its plan in `.pipes/project/04-plans/` when a plan exists.
- Stop and ask when unrelated dirty files make a clean commit scope ambiguous.
