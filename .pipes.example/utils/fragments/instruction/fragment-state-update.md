---
title: State Update
description: Refreshes the readable mission sections and compact journal after meaningful progress.
version: 2.7
fragment_type: instruction
domain: project
---
# Fragment: State Update

## Instructions

1. Update `## Current State` with one permitted non-terminal phase, active workflow, pending gate, resume trigger, validation target, relevant facts, assumptions, constraints, and recent result; do not use a phase to duplicate lifecycle status.
2. When `## Delivery` exists, update only facts that meaningfully changed: current theme, theme route or completion, dependency satisfaction, plan relationship, or evidence-backed promotion to a stricter classification. Preserve the selected approach and never demote a planning requirement merely to bypass planning or an approval gate.
3. Choose the next action from the persisted route. Under `spec-driven`, obtain at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and every additional plan needs an evidence-backed split rationale. Under `adaptive`, still plan each `plan-required` theme while allowing other themes to continue incrementally unless promotion evidence exists. Treat loop pipeline declarations as capability inventory and the selected persisted route as obligatory.
4. For a readable legacy mission without `## Delivery`, preserve its existing scope and Next Actions; do not synthesize or require a migration during an unrelated state update.
5. Update `## Gates`, `## Validation`, and `## Next Actions` only where the mission meaningfully changed. Every pending gate names its subject, gate type, deciding authority, status, invalidation conditions, and exact resume action. Each validation entry names the check, result, scope relevance, and detailed-evidence path when available; name unrelated failures as residual risk.
6. Apply `fragment-mission-journal-contract` before appending one short Journal entry headed `YYYY-MM-DD hh:mm:ss` for a milestone, durable decision, blocker, important validation result, scope change, or closure. For a gate decision, append a compact receipt naming the subject and gate type, decision, deciding authority, mission version, invalidation conditions, and exact resume action. A scope or authority change names the affected scope, approving authority, and mission version.
7. Before setting a recorded mission to `done`, require exactly one approved, validated related outcome, verify both reciprocal `related` paths, and then clear active gates and Next Actions in the same approved closure package. Keep resumable `active` and `blocked` missions open, and do not create a mission outcome for a lightweight loop run without a mission.
8. Link detailed evidence or records by path instead of copying them.
9. Keep the mission readable and within 300 physical lines before `## Journal`; the Journal heading and content do not count. Remove stale duplicate state when replacing it.
10. Validate the exact mission update against `rule-pure-markdown-writing` before writing, then re-read the record and run the pure-Markdown validator after writing.

## Output

- Refreshed mission sections
- Optional compact journal entry
- Clear next action or stop reason
