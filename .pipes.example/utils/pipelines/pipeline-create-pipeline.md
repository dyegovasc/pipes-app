---
title: Create Pipeline
description: Designs and creates a deterministic fragment-driven Pipes workflow.
version: 2.3
domain: framework
category: creation
fragments:
  - fragment-source-tree-execution-context
  - fragment-ask-pipeline-intent
  - fragment-identify-fragments
  - fragment-define-phases
  - fragment-validate-reuse-opportunities
  - fragment-request-approval
  - fragment-create-files
---
# Pipeline: Create Pipeline

Create a deterministic Markdown workflow from reusable fragments and explicit approval gates.

## Entry Points

Use when the user asks for `pipeline-{id}` or when a repeatable workflow has a known phase order. Use a loop instead when action selection must stay adaptive.

## Loop Use

A framework-maintenance loop may invoke this pipeline with a bounded workflow brief and target path. It returns the pipeline Markdown, any genuinely new fragments, the refreshed catalog, and managed pipeline skills. The user owns approval of the exact new workflow. Resume by inspecting which proposed files exist and continuing from the first incomplete phase.

## Control Rules

- Prefer existing fragments; create only atomic missing units.
- Keep phase order deterministic and gates explicit.
- Include `## Loop Use` in every pipeline.
- Do not hide orchestration logic in a script.
- Write staged source first during starter-kit maintenance.

## Output

- `.pipes/utils/pipelines/pipeline-{id}.md`
- optional new fragments
- refreshed catalog and managed pipeline skills

## Phases

### Phase 1: Clarify Intent

**Objective:** Establish a bounded deterministic workflow brief and confirm that a pipeline, rather than a loop or direct action, is the correct abstraction.

**Acting Role:** `roadmapper`

**Entry Conditions:** A user request or framework-maintenance brief names a repeatable outcome whose phase order can be known in advance.

**Inputs:**
- Requested outcome, users, known inputs and outputs, constraints, and evidence.
- Current pipeline, loop, fragment, role, and rule inventories.

**Fragments:**
- `fragment-ask-pipeline-intent`

**Instructions:**
1. Inspect current pipelines and loops before proposing a new workflow.
2. Use `fragment-ask-pipeline-intent` to capture triggers, users, domain, current category, delivery mode, inputs, outputs, phases, gates, protected effects, failure behavior, resumption, and validation.
3. Redirect adaptive work to a loop and clear one-off low-risk work to direct action when no reusable pipeline is justified.
4. For starter maintenance, surface the exact-ten-pipeline inventory contract as a separate scope decision rather than silently widening it.
5. After a pause, inspect the current request and inventory before re-asking.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes a bounded deterministic brief to Compose The Workflow, or returns the redirect recommendation to the requester.

**Outputs:**
- Deterministic pipeline brief or evidence-backed redirect recommendation.
- Classified user-owned, discoverable, and agent-owned unknowns.
- Initial phase order, ownership mode, gate set, and validation target.

**Handoff To:** `roadmapper`

**Approval Gate:** Ask only for a missing choice that changes outcome, phase order, authority, persistence, starter inventory, or validation.

**Exit Conditions:**
- Trigger, output, phase order, gates, protected effects, and completion evidence are explicit enough to compose the complete workflow.
- No source or generated file has changed.

### Phase 2: Compose The Workflow

**Objective:** Turn the brief into a complete phase-connected pipeline contract using the smallest valid set of reusable fragments.

**Acting Role:** `roadmapper`

**Support Team:** `full-stack-tech-lead`

**Entry Conditions:** Phase 1 produced a deterministic brief with no blocking scope, inventory, or authority choice.

**Inputs:**
- Pipeline brief and current project, architecture, convention, and framework context.
- Fragment catalog, type rule, reuse validation, roles, and managed generators.

**Fragments:**
- `fragment-source-tree-execution-context`
- `fragment-define-phases`
- `fragment-identify-fragments`
- `fragment-validate-reuse-opportunities`

**Instructions:**
1. Use `fragment-define-phases` to define every phase with a title in `### Phase N:`, Objective, accountable Acting Role, Inputs, Outputs, Handoff To, Approval Gate, Entry Conditions, optional Support Team, Fragments, Instructions, and Exit Conditions.
2. Use `fragment-identify-fragments` to map exact reusable fragment IDs to phase responsibilities and compute the frontmatter union.
3. Run `fragment-validate-reuse-opportunities`; propose new fragments only for atomic missing responsibilities with valid type contracts and target paths.
4. Draft concise frontmatter, Entry Points, Loop Use, Control Rules, optional Team Contract, Output, and complete Phases.
5. Connect each phase output to the next entry condition and name recovery from the first incomplete phase.
6. Keep scripts limited to static generation and tests.

- Preserve acting-role context: `roadmapper`, consulting `full-stack-tech-lead` when shared contracts, generators, or delivery ownership are affected.
- Preserve routing semantics: `roadmapper` passes the complete proposal set to Validate And Approve.

**Outputs:**
- Complete proposed `pipeline-{id}.md`.
- Exact phase-to-fragment mapping and optional proposed fragment files.
- Target paths, generation effects, and validation checklist.

**Handoff To:** `roadmapper`

**Approval Gate:** None. Return to Phase 1 if composition exposes a material workflow, inventory, role-authority, or persistence decision.

**Exit Conditions:**
- Every phase has the complete field set and connected handoffs.
- Every fragment reference is declared, resolvable or proposed, atomic, and explicitly assigned.
- Another agent can follow the proposal without reconstructing workflow intent.

### Phase 3: Validate And Approve

**Objective:** Prove determinism, reference integrity, connected phases, and safe creation effects, then bind approval to every proposed file.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 produced complete pipeline and optional fragment proposals with exact targets.

**Inputs:**
- Proposed pipeline, fragments, role references, source inventory, and targets.
- Applicable fragment, starter-integrity, scope, and evidence rules.

**Fragments:**
- `fragment-request-approval`

**Instructions:**
1. Verify the workflow is deterministic and every phase contains the app-native field contract with connected inputs, outputs, member handoffs, and exits.
2. Validate every fragment's ID, type, path, required sections, phase binding, and frontmatter declaration; validate every role and pipeline reference.
3. Confirm naming, target availability, Loop Use, protected stops, resumption, and delivery ownership when applicable.
4. Present the exact content of every proposed file, every target path, managed generation effects, and effects explicitly excluded from approval.
5. Use `fragment-request-approval` once for the complete unchanged proposal.
6. Recompose and revalidate the entire set after any requested material change.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for structural, generation, and clean-install evidence.
- Preserve routing semantics: The approved unchanged set passes to Write And Generate; corrections return to the phase that owns them.

**Outputs:**
- Validated pipeline and optional fragment proposal set.
- Structural and reference findings.
- Explicit approval or requested corrections for exact content and paths.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user or declared human authority approves all exact file contents, targets, and listed generated effects. Creation approval does not authorize executing the new pipeline or any protected external action.

**Exit Conditions:**
- No blocking structural, reference, determinism, or target finding remains.
- Approval is exact and current, or the pipeline is paused for corrections.

### Phase 4: Write And Generate

**Objective:** Write only approved sources, refresh managed discovery surfaces, and prove the resulting workflow is readable and reproducible.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `roadmapper`, `e2e-tester`

**Entry Conditions:** Phase 3 approved the unchanged pipeline, optional fragments, target paths, and listed generation effects.

**Inputs:**
- Approved content and approval scope.
- Current targets, execution context, generators, tests, and managed markers.

**Fragments:**
- `fragment-create-files`

**Instructions:**
1. Re-read targets and return to Phase 3 when content, ownership, or inventory changed after approval.
2. Use `fragment-create-files` to write staged source first during starter maintenance and reconcile the installed `.pipes` copy second.
3. Stop instead of overwriting unmanaged or different unapproved content.
4. Regenerate the catalog, source map, and configured pipeline skills.
5. Re-read sources and managed outputs; validate inventory, detailed phase fields, fragment references, canonical paths, and absence of staged-root leaks.
6. Run relevant full and clean-install tests and report actual changed paths.

- Preserve acting-role context: `full-stack-tech-lead`, with `roadmapper` preserving scope and `e2e-tester` recommending validation closure.
- Preserve routing semantics: Return sources and evidence to the invoking loop or user; execution of the created pipeline requires its own request and gates.

**Outputs:**
- Written pipeline and approved fragment files.
- Refreshed managed surfaces.
- Validation evidence, deviations, unchanged outputs, and residual risk.

**Handoff To:**

**Approval Gate:** No new gate for approved effects. Stop on an unmanaged overwrite, material deviation, unapproved inventory change, or protected action.

**Exit Conditions:**
- Approved sources exist and match the approved proposal.
- Managed discovery surfaces and installed paths are coherent.
- Relevant tests pass or failures and limitations are reported without claiming completion.
