---
title: Create Loop
description: Designs and creates a distinct adaptive Pipes loop and refreshes its generated discovery surfaces.
version: 2.5
domain: framework
category: creation
fragments:
  - fragment-source-tree-execution-context
  - fragment-ask-loop-intent
  - fragment-define-loop-contract
  - fragment-bind-team-roles-to-loop
  - fragment-validate-loop-contract
  - fragment-request-approval
  - fragment-create-files
---
# Pipeline: Create Loop

Create a reusable Markdown loop for an adaptive mission class that is not already covered by an existing loop.

## Entry Points

Use when the user asks to create `loop-{id}` or when repeated adaptive work needs a durable orchestration contract. Do not create a renamed copy of an existing loop or use this pipeline for a deterministic workflow.

## Loop Use

A framework-maintenance loop may invoke this pipeline when the mission already defines the missing mission class and starter-kit scope. Pass the intended users, operating envelope, roles, available pipelines, validation, and stop conditions. The pipeline returns the loop Markdown plus refreshed catalog and managed loop skills. The user approves the complete loop before it is written. After a pause, inspect the proposed or written file and continue from the first incomplete phase.

## Control Rules

- The loop must represent a distinct adaptive mission class.
- Markdown owns orchestration; do not add an executable loop runner.
- Reuse existing atomic fragments and roles where they fit.
- The loop must continue until completion, a real user choice, a blocker, or a protected action.
- Every loop must define Mission Integration, shared non-terminal mission phases, and any permitted specialization.
- Write staged source first when maintaining the starter kit.

## Output

- `.pipes/utils/loops/loop-{id}.md`
- refreshed framework catalog
- one managed loop skill per configured target

## Phases

### Phase 1: Clarify The Mission Class

**Objective:** Establish whether the requested adaptive work represents a distinct mission class and define the boundary a new loop would govern.

**Acting Role:** `roadmapper`

**Entry Conditions:** A user request or approved framework-maintenance brief names repeated work whose next action may depend on evidence.

**Inputs:**
- Requested outcome, users, recurring adaptive decisions, and known constraints.
- Current loop inventory, project instructions, and relevant framework rules.

**Fragments:**
- `fragment-ask-loop-intent`

**Instructions:**
1. Inspect the five installed loop definitions before proposing a new one.
2. Use `fragment-ask-loop-intent` to capture users, scope, adaptive decisions, authority limits, available evidence, validation, and real stop conditions.
3. Distinguish a new mission class from a renamed loop, deterministic pipeline, role specialization, or one-off mission.
4. Recommend reuse or extension when an existing loop already owns the work.
5. After a pause, re-read the request and inventory before repeating questions.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes a distinct, bounded loop brief to Draft The Loop, or returns the evidence-backed reuse recommendation to the requester.

**Outputs:**
- Bounded loop brief with distinct mission-class rationale.
- Reuse, redirect, or stop recommendation when creation is not justified.
- Classified unknowns and protected choices.

**Handoff To:** `roadmapper`

**Approval Gate:** Ask only when an undiscoverable user-owned choice changes the mission class, authority, inventory, or validation contract.

**Exit Conditions:**
- A distinct adaptive mission class and its limits are explicit, or creation has stopped with a supported reuse or redirect recommendation.
- No source file has been changed.

### Phase 2: Draft The Loop

**Objective:** Produce one complete readable loop contract from the approved or otherwise settled mission-class brief.

**Acting Role:** `roadmapper`

**Support Team:** `full-stack-tech-lead`

**Entry Conditions:** Phase 1 produced a distinct loop brief with no blocking mission-class or authority ambiguity.

**Inputs:**
- Loop brief, current inventory, relevant roles, pipelines, fragments, and rules.
- Starter-maintenance versus installed-project execution context.

**Fragments:**
- `fragment-source-tree-execution-context`
- `fragment-define-loop-contract`
- `fragment-bind-team-roles-to-loop`

**Instructions:**
1. Use `fragment-define-loop-contract` to draft frontmatter, mission class, operating envelope, adaptive cycle, Mission Integration, available pipelines, validation, stop conditions, and mission prompt.
2. Use `fragment-bind-team-roles-to-loop` to assign one accountable role per phase and bounded consultation, handoff, and gate-authority relationships.
3. Reuse existing fragments, rules, roles, and pipelines by exact ID.
4. Keep scripts outside adaptive action selection and durable mission state.
5. Name staged and installed write behavior without performing either write.

- Preserve acting-role context: `roadmapper`, consulting `full-stack-tech-lead` when shared pipeline, fragment, generator, or installed-path behavior is affected.
- Preserve routing semantics: `roadmapper` passes the complete proposal and target set to Validate And Approve.

**Outputs:**
- Complete proposed `loop-{id}.md`.
- Exact target path and affected managed discovery surfaces.
- Reuse list plus any explicitly justified new supporting contracts.

**Handoff To:** `roadmapper`

**Approval Gate:** None. Newly discovered mission-class, inventory, or authority changes return to Phase 1 rather than being decided during drafting.

**Exit Conditions:**
- The full loop is readable and every referenced contract is identifiable.
- The proposal contains real completion, user-decision, blocker, and protected action stops.

### Phase 3: Validate And Approve

**Objective:** Prove that the proposed loop is distinct, resolvable, governed, and safe to create, then bind approval to its exact content and effects.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 produced one complete proposal and exact target set.

**Inputs:**
- Proposed loop, source inventory, referenced paths, and execution context.
- Expected catalog, source-map, and managed-skill effects.

**Fragments:**
- `fragment-validate-loop-contract`
- `fragment-request-approval`

**Instructions:**
1. Run `fragment-validate-loop-contract` against distinctness, adaptiveness, references, authority, validation, and stop conditions.
2. Resolve every referenced fragment, rule, role, and pipeline and verify the proposed ID and target do not conflict with unmanaged content.
3. Present the complete loop, exact write paths, generated effects, and effects excluded from approval.
4. Use `fragment-request-approval` once for the displayed content and paths.
5. If content changes, rebuild and revalidate the full proposal before asking again; never carry approval across a material revision.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for inventory, generation, and clean-install validation expectations.
- Preserve routing semantics: An approved, unchanged proposal passes to Write And Generate; corrections return to the phase that owns them.

**Outputs:**
- Validated exact loop proposal and target set.
- Validation findings and explicit creation approval or requested corrections.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user or other declared human authority approves the exact loop contract, paths, and listed generation effects. Creation approval does not authorize execution, publication, or version-control actions.

**Exit Conditions:**
- Validation has no blocking finding.
- Exact content, paths, effects, and approval authority are identifiable.
- Approval is explicit and current, or the pipeline is paused for corrections.

### Phase 4: Write And Generate

**Objective:** Write only the approved loop and supporting contracts, refresh managed discovery surfaces, and return reproducible validation evidence.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `roadmapper`, `e2e-tester`

**Entry Conditions:** Phase 3 approved the unchanged content, exact targets, and listed generation effects.

**Inputs:**
- Approved proposal, approval record, source and target paths, and execution context.
- Current files, generators, tests, and managed-file markers.

**Fragments:**
- `fragment-create-files`

**Instructions:**
1. Re-read every target and return to Phase 3 if content or ownership changed.
2. Use `fragment-create-files` to write the approved staged source first during starter maintenance, then reconcile the installed `.pipes` counterpart.
3. Refuse to overwrite an unmanaged or different unapproved target.
4. Regenerate the catalog, source map, and loop skills for configured targets.
5. Re-read written and generated files, validate exact inventories and canonical installed paths, and run relevant full and clean-install tests.
6. Report actual changes, unchanged generated outputs, checks, and limitations.

- Preserve acting-role context: `full-stack-tech-lead`, with `roadmapper` preserving the approved scope and `e2e-tester` recommending validation closure.
- Preserve routing semantics: Return the created paths and evidence to the invoking loop or user; do not start the new loop unless separately approved.

**Outputs:**
- Written loop and any approved supporting source files.
- Refreshed managed surfaces and generation report.
- Validation evidence, deviations, and residual risk.

**Handoff To:**

**Approval Gate:** No additional gate for the approved effects. Stop before an unmanaged overwrite, material deviation, inventory change outside the approved proposal, or protected external action.

**Exit Conditions:**
- Approved sources are readable in their canonical locations.
- Managed surfaces match source and clean validation passes or failures are reported without a false completion claim.
- The created loop has not been executed implicitly.
