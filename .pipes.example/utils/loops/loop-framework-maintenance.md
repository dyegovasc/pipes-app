---
title: Framework Maintenance Loop
description: Evolve Pipes Markdown contracts and keep their generated discovery surfaces current.
version: 2.13
domain: all
loop_type: maintenance
status: active
primary_role: roadmapper
consulting_roles:
  - full-stack-tech-lead
  - e2e-tester
fragments:
  - fragment-mission-framing
  - fragment-observation
  - fragment-understanding
  - fragment-strategy
  - fragment-action-selection
  - fragment-execution
  - fragment-validation
  - fragment-reflection
  - fragment-state-update
  - fragment-mission-journal-contract
  - fragment-gate-evaluation
  - fragment-capture-execution-outcome
  - fragment-format-outcome-record
  - fragment-create-outcome-file
pipelines:
  - pipeline-create-loop
  - pipeline-create-pipeline
  - pipeline-create-team-member
  - pipeline-define-codebase-stack
  - pipeline-define-system-architecture
  - pipeline-plan-new-feature
  - pipeline-execute-plan
  - pipeline-record-decision
  - pipeline-add-eval
  - pipeline-define-policies
  - pipeline-bootstrap-workspace
  - pipeline-bootstrap-greenfield
rules:
  - rule-pure-markdown-writing
  - rule-starter-kit-integrity
  - rule-scope-control
  - rule-evidence-and-validation
  - rule-auto-update-catalog
  - rule-mission-state-integrity
  - rule-plan-state-integrity
---
# Framework Maintenance Loop

## Use When

Use this loop to change Pipes instructions, records, fragments, pipelines, loops, rules, roles, generators, or generated entrypoints.

## Operating Envelope

The loop may inspect framework sources, edit approved Markdown contracts, update static generators, regenerate managed surfaces, and run development tests. When the repository has a separate starter source tree, change it first, then reconcile the installed `.pipes` copy.

Ask before widening the framework contract beyond the approved change, removing user-owned records, publishing a starter, or performing version-control actions.

## Roles

`roadmapper` owns framework coherence and routing. Consult `full-stack-tech-lead` for cross-surface contracts and `e2e-tester` for clean generation and installation evidence.

## Cycle

| Phase | Work | Fragment |
| --- | --- | --- |
| Frame | Bind the contract change, affected sources, generated outputs, and limits | `fragment-mission-framing` |
| Observe | Inventory current canonical and managed surfaces | `fragment-observation` |
| Understand | Identify source ownership, drift, references, and risk | `fragment-understanding` |
| Choose | Select a direct edit or deterministic creation pipeline | `fragment-strategy`, `fragment-action-selection` |
| Act | Change canonical Markdown or a static generator | `fragment-execution` |
| Validate | Regenerate, test inventories, and inspect paths and content | `fragment-validation` |
| Reflect | Resolve drift, stale managed files, and scope deviations | `fragment-reflection` |
| Update | Refresh mission state and continue until the contract is coherent | `fragment-state-update`, `fragment-gate-evaluation` |

## Mission Integration

Use a recorded mission when this framework change needs durable objective, scope, authority, evidence, or next-action state. Read its selected `loop` ID before work, refresh only its run-specific Current State and Next Actions, and keep reusable loop roles and operating rules here.

Treat the mission as the orchestration map until conclusion. Resolve pipeline and loop gates through its recorded `user_mediated`, `delegated_until_escalation`, or `mixed` profile and corresponding human-intervention level; the preference may narrow but never widen authority, and human-mandatory remains user-owned. Keep delegated authority, user authority, active workflow, pending gate, resume trigger, validation target, and next action readable. Before pausing at a gate, record its deciding authority, invalidation conditions, and exact resume action. After an immediate valid decision, append the compact gate receipt and continue the mission directly; use a new readiness boundary for a cold or stale resume.

When the mission has `## Delivery`, choose the next action from its current theme and selected approach. Declared pipelines remain capability inventory, but the selected persisted route is obligatory after mission execution approval. Under `spec-driven`, require at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and every additional plan needs an evidence-backed split rationale. Under `adaptive`, still plan each `plan-required` theme while allowing other themes to proceed incrementally unless evidence promotes them. Preserve the exact post-subworkflow resume action.

Mission phases use `framed`, `observing`, `understanding`, `choosing`, `acting`, `validating`, `reflecting`, and `updating`; status alone owns `draft`, `active`, `blocked`, and `done`. Specialized mission phases: none.

When this loop invokes Execute Plan for a recorded source, preserve the pipeline's `draft`, `active`, `blocked`, resumed `active`, and outcome-backed `done` lifecycle boundaries. Require exactly one validated reciprocal plan outcome before terminal plan closure, keep inline plan content free of invented record state, and return to the mission's exact post-plan action without treating the plan outcome as the mission outcome.

After Validate and Reflect establish a terminal `succeeded`, `partial`, `failed`, or `cancelled` result for a recorded mission, but before setting its status to `done`, use `fragment-capture-execution-outcome`, `fragment-format-outcome-record`, and `fragment-create-outcome-file` to produce exactly one approved, validated related outcome. Keep resumable `active` and `blocked` missions open.

Check the mission’s existing `related` paths for a matching outcome before proposing a new file, and reuse that outcome when it already represents this closure. Otherwise present one closure package containing the exact outcome preview, mission terminal cleanup, `done` status change, and both reciprocal `related` links.

Apply only the approved closure package. When Pipes Local automatically adds the reciprocal `related` path and refreshes `.pipes/utils/state/related-sync-state.json` after an approved source-record relationship write, treat those changes as expected app-managed effects and do not repeat the reciprocal edit directly; direct agent-authored writes to related records remain governed by their own authority.

Only after the outcome and relationships are written, re-read, and validated may the loop clear active gates and Next Actions and mark the mission `done`. A lightweight loop run without a mission does not create a mission outcome.

## Available Pipelines

Use the creation pipelines for loops, pipelines, and roles; the definition pipelines for project or architecture instructions; `pipeline-add-eval` to turn an incident, a repeated agent mistake, or a new contract into an eval case; `pipeline-bootstrap-workspace` to set up a new workspace in order; `pipeline-bootstrap-greenfield` to set up a repository with no code from declared choices; `pipeline-define-policies` to derive project policy rules from repository evidence; and planning, execution, or decision pipelines when their deterministic contract fits.

## Generation Policy

Canonical Markdown owns behavior. Generators may emit wrappers, skills, agents, hook settings, catalogs, and maps only. A generated file must point back to its source and be safe to recreate.

## Validation

- The shipped starter baseline retains its approved loop and pipeline inventory, while installed workspace additions remain valid and generated surfaces reflect the active inventory.
- Referenced fragments, rules, roles, and paths resolve.
- Catalogs, mappings, wrappers, and managed skills match canonical sources.
- A clean temporary installation can regenerate the same surfaces.
- No staged-only path leaks into installed output.
- Every generator's `--check` mode, where it has one, reports no stale output, and the always-on instruction block is within its budget.
- Gate G6, decided by the holder of gate G6 (core.md Gates): before a human approves a change to `.pipes/**` other than the project records in `.pipes/project/**`, or to `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.claude/**`, or `.agents/**`, when `.pipes/ai-instructions/delivery.md` has an Evals table, eval results are required: run the eval tier the change needs and attach its result file. Without the table, an eval run is recommended: offer the tier and its cost estimate, and record in the approval receipt that no eval ran when the human approves without one. A failing case blocks the approval unless the human accepts the named failure as residual risk; an invalid case is rerun with `--rerun-failed`.
- Eval tiers, to keep usage low: for every such change, `node .pipes/utils/scripts/run-evals.cjs --changed` (the cases whose `covers` match the changed files; a broad change such as `core.md` or a generated entrypoint runs the starter scope); before the commit that completes a step, `--scope starter`; at a milestone, such as before a release or a port, all cases with `--milestone`. Routine tiers use the routine model and milestones the milestone model from the Evals table in `delivery.md` when it has one, otherwise the agent tool's default model. Never run two full suites in a row; rerun only failed or invalid cases.

## Stop Conditions

Stop only when sources and generated surfaces are coherent and tested, the user must choose a contract change, a blocker prevents validation, or the next action is protected. Otherwise reconcile and continue.

## Mission Prompt

```markdown
Use loop-framework-maintenance for {framework outcome}.
Scope: {canonical and generated surfaces}
Constraints: {compatibility and authority limits}
Validation: {inventory, generation, and clean-install evidence}
```
