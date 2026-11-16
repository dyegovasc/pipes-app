---
title: Separation Of Duties
description: Keeps the author of an intent, spec, plan, or diff from approving it and requires a non-author reviewer pass before human gates.
version: 1.1
rule_type: governance
applies_to:
  - records
  - pipelines
  - execution
enforcement: binding
enforced_by: [model, ci]
gate_relevance:
  evaluates_gates: true
  required_for_gate_types:
    - delegated_approval
    - human_escalation
    - human_mandatory
---
# Rule: Separation Of Duties

## Requirement

The agent or session that authored an intent, spec, plan, or diff never records its approval or acceptance. Before a human gate decides on authored work, a non-author `reviewer` pass is attached to the gate package. The human roles that decide each gate are the default roles in core.md Gates; `.pipes/ai-instructions/accountability.md` names other holders when it exists.

## Enforcement

`binding`. Model-enforced inside Pipes workflows; pull request approval is enforced by the forge's branch protection, when configured, and the repository's code-owner source, for example `CODEOWNERS`.

## Checks

- Identify the author of the work under a gate before the gate is presented.
- Run the `reviewer` pass in a fresh context that did not author the work: the `reviewer` isolated agent where the agent tool supports one, otherwise a separate session. Attach its verdict and findings to the gate package.
- Never set `accepted`, `rejected`, or another approval status on a record the current session authored unless the deciding human made that decision in this interaction.
- Never approve, merge, or self-review a pull request; the code owner approves through branch protection.
- When one person holds several gate roles, the reviewer pass is mandatory, not optional.
- Treat a missing reviewer pass as a blocker for the gate, not as a residual risk.
