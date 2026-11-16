---
title: Define System Architecture
description: Builds or refreshes an evidence-backed architecture instruction with explicit ownership, write context, and preservation gates.
version: 2.5
domain: architecture
category: definition
fragments:
  - fragment-source-tree-execution-context
  - fragment-instruction-surface-ownership
  - fragment-ask-system-architecture
  - fragment-check-existing-architecture-instruction
  - fragment-map-system-boundaries
  - fragment-survey-workspace-repositories
  - fragment-draft-architecture-instruction
  - fragment-format-architecture-instruction
  - fragment-validate-architecture-instruction
  - fragment-request-approval
  - fragment-write-architecture-instruction
---
# Pipeline: Define System Architecture

Create or refresh the canonical architecture reference from current repository evidence and explicitly authorized product boundaries.

## Entry Points

Use during onboarding, after a material architecture change, or when the architecture instruction is missing, placeholder, incomplete, stale, or contradicted by current evidence.

## Loop Use

A framework-maintenance, concept-development, or feature-delivery loop may invoke this pipeline with execution context, project instructions, repository evidence, decisions, current architecture content, and unresolved user-owned boundaries. It returns exact architecture content, targets, approval state, wrapper effects, and validation. Installed projects write canonical `.pipes/` only; starter maintenance writes the starter source tree first and reconciles `.pipes/` second. Resume from the first incomplete phase after inspecting actual targets and generated wrappers.

## Control Rules

- Describe the real system and distinguish current facts, accepted constraints, planned evolution, and unresolved items.
- Inspect project instructions, code, configuration, data contracts, operations, and decisions before asking for architecture information.
- Keep identity and stack summary in `project.md` and binding conventions in `rule-codebase-conventions.md`.
- Preserve established architecture commitments unless their exact change is approved by the proper authority.
- Determine idempotency from actual current content and the approved proposal; do not require a second persisted workflow-state model.

## Output

- Installed-project mode: `.pipes/ai-instructions/architecture.md`
- Starter-maintenance mode: the matching `ai-instructions/architecture.md` in the starter source tree, when the repository has one, followed by its equivalent installed `.pipes/` mirror
- Refreshed configured instruction wrappers and validation evidence

## Phases

### Phase 1: Establish Context And Boundaries

**Objective:** Resolve write context and produce an evidence-backed map of the current system, preserved commitments, and only genuinely user-owned choices.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `roadmapper`

**Entry Conditions:** A request or active loop identifies a missing, stale, placeholder, or materially changed architecture instruction.

**Inputs:**
- Project root, invocation context, current project and architecture instructions.
- Repository structure, code, configuration, data contracts, operations, integrations, decisions, and relevant evidence.

**Fragments:**
- `fragment-source-tree-execution-context`
- `fragment-instruction-surface-ownership`
- `fragment-check-existing-architecture-instruction`
- `fragment-map-system-boundaries`
- `fragment-survey-workspace-repositories`
- `fragment-ask-system-architecture`

**Instructions:**
1. Use `fragment-check-existing-architecture-instruction` to resolve `installed_project` or `starter_maintenance`, exact targets, mode, current version, preserved commitments, and wrapper effects.
2. When `.pipes/ai-instructions/delivery.md` declares the `multi-repo` layout, use `fragment-survey-workspace-repositories` first to list every repository with its purpose, role, owners, store, and integrations; the architecture then describes the system across those repositories.
3. Use `fragment-map-system-boundaries` with `mapping_scope: system_definition` to map components, ownership, workflows, data, state, and integrations from evidence. Preserve its `feature_change` behavior for planning consumers.
4. Inspect current project instructions and decisions and keep their ownership boundaries separate from architecture content.
5. Use `fragment-ask-system-architecture` only for a product boundary, workflow, operational constraint, or intended evolution that evidence cannot determine.
6. Present evidence and a recommendation when authority must resolve a conflict.
7. Stop on an unmanaged target, unresolved execution context, or contradiction that would make a draft misleading.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `roadmapper` for product or repository ownership boundaries.
- Preserve routing semantics: `full-stack-tech-lead` passes the complete architecture baseline to Draft The Architecture.

**Outputs:**
- Execution context, mode, exact targets, current version, and wrapper set.
- System-boundary map, evidence sources, preserved commitments, and conflicts.
- User-confirmed choices and remaining blocking unknowns.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user or declared product authority decides only a material architecture boundary, intended direction, or established-commitment change that cannot be resolved from authoritative evidence.

**Exit Conditions:**
- Execution context, targets, current state, and preservation constraints are clear.
- Current architecture is evidenced and remaining choices have proper authority.
- No source or wrapper has changed.

### Phase 2: Draft The Architecture

**Objective:** Produce one concise complete architecture instruction that preserves established truth and labels future or uncertain content accurately.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 1 produced a complete evidence baseline with no unresolved choice that blocks accurate drafting.

**Inputs:**
- System map, evidence, decisions, confirmed choices, and preserved commitments.
- Current architecture content, mode, version, target set, and live format.

**Fragments:**
- `fragment-draft-architecture-instruction`
- `fragment-format-architecture-instruction`

**Instructions:**
1. Use `fragment-draft-architecture-instruction` to synthesize System Summary, Product Boundaries, Primary Workflows, Components And Responsibilities, Data And State, External Integrations, Operational Constraints, and Planned Evolution.
2. Use `fragment-format-architecture-instruction` to produce complete `assembly: reference` Markdown for the resolved context.
3. Retain established commitments unless their proposed change is explicit.
4. Link facts to evidence, identify assumptions, and label planned elements so they cannot be mistaken for current architecture.
5. Use `1.0` for a new instruction or one minor version increment for a substantive update; do not bump unchanged content.
6. Produce exact staged and installed content when starter maintenance applies; do not write either target yet.

- Preserve acting-role context: `full-stack-tech-lead`, consulting relevant architecture roles only when the active loop assigns them a bounded domain question.
- Preserve routing semantics: `full-stack-tech-lead` passes the complete proposal to Validate And Approve.

**Outputs:**
- Complete architecture proposal for every approved-context target.
- Preserved commitments, proposed changes, assumptions, and evidence map.
- Version transition, wrapper effects, and blocking findings.

**Handoff To:** `e2e-tester`

**Approval Gate:** None. Return to Phase 1 if drafting exposes a material boundary, commitment, or execution-context choice.

**Exit Conditions:**
- Every canonical section is complete, factual, and correctly scoped.
- Current, planned, and uncertain statements are distinguishable.
- Exact contents, targets, versions, and generated effects are readable.

### Phase 3: Validate And Approve

**Objective:** Prove the proposal is structurally complete, evidence-consistent, context-correct, and safe to write, then bind approval to the exact package.

**Acting Role:** `e2e-tester`

**Support Team:** `full-stack-tech-lead`, `roadmapper`

**Entry Conditions:** Phase 2 produced exact proposals, targets, versions, preservation changes, and wrapper effects.

**Inputs:**
- Complete proposal package and current target contents.
- Project instructions, decisions, repository evidence, and execution context.

**Fragments:**
- `fragment-validate-architecture-instruction`
- `fragment-request-approval`

**Instructions:**
1. Use `fragment-validate-architecture-instruction` to check structure, ownership, evidence, consistency, preservation, execution context, write order, version transition, and wrapper plan.
2. Compare staged and installed proposals for exact content equivalence when starter maintenance applies.
3. Present complete content, exact targets, lasting boundary changes, wrapper effects, and excluded effects.
4. Use `fragment-request-approval` once for the unchanged valid proposal.
5. Return corrections to their owning phase and repeat full validation after a material change.

- Preserve acting-role context: `e2e-tester`, with `full-stack-tech-lead` resolving technical findings and `roadmapper` preserving authority boundaries.
- Preserve routing semantics: A valid, approved, unchanged package passes to Write And Assemble; findings return to the phase that owns them.

**Outputs:**
- `valid` or `blocking` architecture validation with evidence.
- Exact approved package or requested corrections.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** Human approval covers the displayed architecture commitments, exact targets, write order, version change, and configured wrapper effects. It does not authorize unrelated implementation or external actions.

**Exit Conditions:**
- No structural, evidence, preservation, context, or target blocker remains.
- Approval is explicit and current, or the pipeline is paused for corrections.

### Phase 4: Write And Assemble

**Objective:** Apply only approved architecture content in the correct context, refresh wrappers, and return reproducible validation evidence.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 approved unchanged exact content, targets, write order, version transition, and wrapper effects.

**Inputs:**
- Approved package, current targets, execution context, generators, and tests.

**Fragments:**
- `fragment-write-architecture-instruction`

**Instructions:**
1. Re-read every target and return to Phase 3 if current content or ownership changed after approval.
2. Use `fragment-write-architecture-instruction` to write canonical `.pipes/` only in an installed project, or the starter source tree first and `.pipes/` second in starter-maintenance context.
3. Report an already matching target as unchanged and never overwrite unmanaged or unapproved established content.
4. Regenerate configured instruction wrappers from the active source context.
5. Re-read source and wrappers, validate staged/installed equivalence when applicable, canonical paths, section structure, and preserved commitments.
6. Run generator and clean-install tests and report deviations or limitations.

- Preserve acting-role context: `full-stack-tech-lead`, with `e2e-tester` recommending final validation closure.
- Preserve routing semantics: Return exact paths and evidence to the invoking loop or user; architecture definition does not execute product changes.

**Outputs:**
- Written architecture source and optional installed mirror.
- Refreshed wrappers, validation evidence, deviations, and residual risk.

**Handoff To:**

**Approval Gate:** No additional gate for approved effects. Stop on target drift, unmanaged overwrite, material deviation, or another protected action.

**Exit Conditions:**
- Sources match approved content and execution context.
- Wrappers are reproducible, use canonical `.pipes/` paths, and validation passes or failures are reported without claiming completion.
