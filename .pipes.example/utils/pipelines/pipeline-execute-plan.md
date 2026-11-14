---
title: Execute Approved Plan
description: Executes a bounded approved plan, validates the result, and reports factual closure.
version: 2.7
domain: project
category: delivery
fragments:
  - fragment-read-plan-record
  - fragment-assess-plan-execution-readiness
  - fragment-route-supporting-artifacts
  - fragment-apply-plan-lifecycle-transition
  - fragment-execute-approved-plan
  - fragment-capture-execution-outcome
  - fragment-format-outcome-record
  - fragment-create-outcome-file
  - fragment-sync-record-statuses
---
# Pipeline: Execute Approved Plan

Execute the work described by an approved plan without silently re-planning or expanding scope.

## Entry Points

Use when the user identifies an approved plan or clearly approves a complete plan presented in the current conversation. Use planning first when scope or acceptance criteria remain materially ambiguous.

## Loop Use

A feature-delivery, investigation-and-recovery, artifact-production, or framework-maintenance loop may invoke this pipeline when an exact approved plan is the best deterministic next action. Pass the recorded plan path or exact inline content, approval evidence, current state, intervention-to-autonomy mapping, known prior effects, authority limits, pending gate, and mission resume action. Direct and mission-bound invocations share one lifecycle and outcome contract while preserving their applicable authority source and exact return route. After an immediate gate decision, return directly to the active mission action when approval remains valid. After a cold or stale pause, inspect actual targets, source-plan lifecycle, outcome relationships, prior effects, and approval validity before resuming from the first incomplete safe step.

## Control Rules

- Treat the approved plan as the scope and acceptance contract.
- Do not treat a pipeline invocation as approval of incomplete, stale, or unidentified plan content.
- Require plan-execution approval or a receipt whose subject is plan execution; a plan-content decision remains distinct and cannot authorize implementation.
- Preserve unrelated user changes.
- Reuse matching effects and reconcile partial or uncertain effects before retry.
- Classify the source as `recorded` or `inline`; never invent plan state, relationships, or mandatory outcome closure for inline content.
- Apply recorded-plan lifecycle transitions through `fragment-apply-plan-lifecycle-transition`: activate immediately before the first remaining execution effect, synchronize resumable blockers before pause, and resume only with resolved evidence and valid authority.
- For terminal recorded execution, create or reuse exactly one validated related outcome and verify reciprocal linkage before applying `active` to `done`.
- Ask before a material deviation, broader scope, or protected action whose governing authority has not explicitly approved it.
- Inside an active mission, resolve each plan gate through the recorded intervention-to-autonomy mapping and governing contracts; human-mandatory gates remain user-owned.
- Before pausing, record active workflow, pending gate, deciding authority, invalidation conditions, exact resume trigger, and next action in the mission.
- Validate in proportion to risk and inspect real user-visible surfaces.
- Keep mission and other related-record status changes as proposals unless separately authorized; this does not replace the executing source plan's owned lifecycle transitions.
- Preserve distinct plan and mission outcomes. Completing one plan does not by itself close its invoking mission.
- For a mission-bound `spec-driven` plan, require the approved, validated plan set to collectively cover the complete confirmed mission scope before execution; do not infer a missing-plan condition from classification or theme count.

## Team Contract

`full-stack-tech-lead` coordinates execution continuity and preserves the approved technical boundary. `roadmapper` owns plan interpretation, output routing, and status proposals. `e2e-tester` owns validation recommendations. Domain roles participate only when the approved plan names their work; they do not gain authority over plan changes or protected effects.

## Output

- implementation, record, and artifact effects in canonical destinations
- reused effects, changed paths, validation evidence, deviations, and blockers
- source kind, lifecycle transitions, result classification, exactly-one recorded-plan outcome evidence, remaining steps, and conservative other-record status proposals

## Phases

### Phase 1: Load The Plan

**Objective:** Resolve one complete plan and its current approval boundary into an execution brief without performing any plan effect.

**Acting Role:** `roadmapper`

**Entry Conditions:** The user or an active loop requests execution and identifies a plan path or exact plan content.

**Inputs:**
- Plan path or displayed content, current request, and approval evidence.
- Mission or loop state, relevant rules, and known authority limits.

**Fragments:**
- `fragment-read-plan-record`

**Instructions:**
1. Resolve exactly one plan; stop for selection when multiple records remain plausible.
2. Use `fragment-read-plan-record` to classify `plan_source_kind` as `recorded` or `inline` and extract outcome, users, scope, non-goals, implementation order, verified preconditions, blockers, risks, acceptance criteria, outputs, protected actions, and related paths. For a recorded plan, also extract its exact path, version, status, related outcome candidates, and reciprocal-link state.
3. Identify the exact approved content or recorded version and who supplied the approval. When mission-bound, verify the mission's active workflow, gate authority, invalidation conditions, resume trigger, and post-plan action. Do not infer approval from plan existence, `draft` status, or a generic request to run this pipeline.
4. Confirm the plan is complete enough to execute without inventing architecture, scope, acceptance, or durable direction.
5. Record execution exclusions and authority limits before readiness analysis. Inline content has no source lifecycle target and no mandatory plan outcome; do not manufacture either.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the unchanged approved execution brief to Check Readiness And Route.

**Outputs:**
- Exact plan source kind, recorded path and version or inline content boundary, and approval evidence.
- Execution brief, acceptance criteria, ordered work, outputs, and exclusions.
- Missing approval, ambiguity, or incomplete-plan findings.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** Stop when no complete exact plan or valid execution approval can be identified. Planning approval and plan execution approval must not be manufactured from context.

**Exit Conditions:**
- Exactly one complete recorded or inline plan source and its current approval boundary are explicit.
- No plan effect, repository write, or related-record update has occurred.

### Phase 2: Check Readiness And Route

**Objective:** Determine whether the approved plan still fits actual state, classify prior effects, route outputs, and identify every remaining gate.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `roadmapper`

**Entry Conditions:** Phase 1 produced one complete approved execution brief.

**Inputs:**
- Execution brief, approval evidence, current relevant repository and record state.
- Existing outputs, dependencies, worktree changes, configured record areas, and protected-action rules.

**Fragments:**
- `fragment-assess-plan-execution-readiness`
- `fragment-route-supporting-artifacts`

**Instructions:**
1. Use `fragment-assess-plan-execution-readiness` to compare approval, source kind, recorded lifecycle when applicable, verified preconditions, targets, dependencies, prior effects, blockers, contradictions, and protected actions with current reality.
2. Classify each planned effect as not started, already matching, partial, changed since approval, or uncertain and identify the safe resume boundary.
3. Use `fragment-route-supporting-artifacts` to place each output in its owning canonical record or workspace path, using `07-artifacts` only as a justified fallback.
4. Identify the primary execution owner, participating roles, validation surfaces, ordered remaining work, and every current gate.
5. Classify readiness as `ready`, `needs_correction`, or `blocked`; do not edit the plan or apply a lifecycle transition during readiness.
6. For a recorded source, reject `done`, accept `draft` or current `active` according to the remaining work, and accept `blocked` only when the blocker is resolved and resume authority is current. Return the exact next transition as `draft -> active`, `blocked -> active`, `already active`, or `none`.
7. When routing or drift changes approved scope, acceptance, authority, or risk, return the exact correction for approval instead of continuing.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `roadmapper` for scope, record routing, and approval interpretation.
- Preserve routing semantics: A `ready` package passes to Execute. Correction or blocker findings return to the user, plan owner, or invoking loop without plan effects.

**Outputs:**
- Readiness classification, evidence, execution ownership, output routing, source kind, and next lifecycle transition.
- Effect-state map, remaining steps, validation surfaces, blockers, contradictions, protected gates, and safe resume boundary.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** Continue under the exact Phase 1 approval only when the plan still fits and a safe remaining step exists. Ask when correction, material drift, or an unapproved protected effect changes the execution boundary.

**Exit Conditions:**
- Readiness, routing, ownership, prior effects, and remaining gates are explicit.
- The package is `ready`, or the pipeline stops with an exact correction or blocker.

### Phase 3: Execute

**Objective:** Perform only ready remaining plan steps in canonical destinations, while preserving unrelated work and stopping before unauthorized consequences.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 2 produced `readiness_status: ready`, canonical routing, known prior effects, at least one safe remaining step, and an exact source-kind and lifecycle package.

**Inputs:**
- Approved execution brief and readiness package.
- Current targets, output routes, validation commands, gates, and authority limits.

**Fragments:**
- `fragment-apply-plan-lifecycle-transition`
- `fragment-execute-approved-plan`

**Instructions:**
1. Immediately before the first remaining execution effect, use `fragment-apply-plan-lifecycle-transition` to apply `draft -> active` or an approved resolved `blocked -> active` transition for a recorded source, or reuse an already matching `active` state. Require `not_applicable` for inline content.
2. Re-read the next targets and use `fragment-execute-approved-plan` to reuse matching effects, reconcile partial or uncertain state, and execute only remaining approved steps.
3. Preserve unrelated user changes and refuse an unmanaged overwrite or destructive recovery outside approval.
4. Treat implementation details inside the approved approach as agent-owned; surface any change to scope, acceptance, architecture, order, persistence, or material risk as a deviation.
5. Stop before a material deviation, durable decision, or protected action lacking current authority.
6. When a resumable blocker prevents every meaningful remaining action, use `fragment-apply-plan-lifecycle-transition` to apply `active -> blocked` before returning the resume package. Do not block an inline source or terminal result by inventing record state.
7. Validate prerequisites incrementally and stop rather than building later work on a failed dependency.
8. Keep a factual log of changed and reused effects, artifacts, checks, lifecycle transitions, deviations, blockers, and remaining steps.
9. If a gate pauses an active mission, update its orchestration fields before asking. After an immediate decision, append the compact gate receipt and continue with the exact recorded resume action when approval remains valid.

- Preserve acting-role context: `full-stack-tech-lead`, coordinating only the domain roles named by the approved plan.
- Preserve routing semantics: Completed, partial, blocked, or failed execution evidence passes to Validate And Close; a gate pauses with the evidence needed to resume safely, then returns to the active mission after an immediate valid decision without requiring another pipeline command.

**Outputs:**
- Changed files and artifacts, reused effects, lifecycle transitions, and validation runs.
- Deviations, blockers, pending protected actions, remaining steps, and resume point.

**Handoff To:** `e2e-tester`

**Approval Gate:** Stop on absent authority, material deviation, scope expansion, blocker, or protected effect not explicitly covered by governing approval. Do not perform it speculatively.

**Exit Conditions:**
- All safe approved work is complete, or execution stopped at an exact gate.
- Actual effects, validation, deviations, and remaining work are factual and readable.

### Phase 4: Validate And Close

**Objective:** Compare actual effects with acceptance criteria, classify the result, close terminal recorded execution through exactly one validated outcome, and propose only other-record status changes conservatively.

**Acting Role:** `e2e-tester`

**Support Team:** `roadmapper`, `full-stack-tech-lead`

**Entry Conditions:** Phase 3 returned execution evidence or stopped at a gate with enough actual state to classify progress.

**Inputs:**
- Approved plan and acceptance criteria.
- Changed and reused effects, artifacts, checks, deviations, blockers, and gates.

**Fragments:**
- `fragment-capture-execution-outcome`
- `fragment-format-outcome-record`
- `fragment-create-outcome-file`
- `fragment-apply-plan-lifecycle-transition`
- `fragment-sync-record-statuses`

**Instructions:**
1. Run or re-run validation affected by the final changes and inspect real outputs where the acceptance criteria require it.
2. Use `fragment-capture-execution-outcome` to classify terminal work as `succeeded`, `partial`, `failed`, or `cancelled`, or resumable work as `active` or `blocked`. Result belongs to the outcome; lifecycle belongs to the source plan.
3. Compare every acceptance criterion with concrete evidence and state skipped checks, deviations, residual risk, and safe follow-up.
4. For resumable recorded work, verify that Phase 3 left the plan accurately `active` or `blocked` and return its safe resume package. For inline work, report factual closure or resumption without a lifecycle effect.
5. For terminal recorded work, inspect current plan relationships and outcome records. Reuse exactly one matching validated outcome or use `fragment-format-outcome-record` and `fragment-create-outcome-file` to apply one authorized closure package; stop on zero unapproved, multiple, contradictory, stale, or broken-reciprocal candidates.
6. Re-read the recorded plan and exactly one outcome, verify reciprocal linkage and validation, then use `fragment-apply-plan-lifecycle-transition` to apply `active -> done`. A `failed` or `cancelled` result can still close the lifecycle after factual outcome validation.
7. Use `fragment-sync-record-statuses` only to propose mission and other related-record changes conservatively. It does not own the executing source plan.
8. For terminal inline content, do not require or invent a plan record, status, relationship, or plan outcome. Recommend a durable outcome only when a separate request and authority own that write.
9. Report actual changed paths, reused outputs, generated artifacts, checks, lifecycle and outcome effects, and remaining gates without claiming more than the evidence supports.

- Preserve acting-role context: `e2e-tester`, consulting `roadmapper` for record routing and status proposals and `full-stack-tech-lead` for implementation findings.
- Preserve routing semantics: Return factual closure or a safe resume package to the invoking loop or user. Separately approved record updates may follow as their own effects.

**Outputs:**
- Result classification, acceptance evidence, changed and reused paths, source kind, and lifecycle evidence.
- Deviations, blockers, residual risk, remaining steps, and next action.
- Exactly-one outcome and reciprocal-link evidence for a terminal recorded plan, or explicit inline non-applicability.
- Proposal-only mission and other related-record status changes.

**Handoff To:**

**Approval Gate:** Apply recorded-plan outcome, relationship, and lifecycle effects only when their governing authority is current. Ask before a human-mandatory or otherwise unauthorized closure effect, disputed closure, other-record update, or additional protected action.

**Exit Conditions:**
- Every acceptance criterion is evidenced, failed, deferred, or explicitly blocked.
- A terminal recorded plan has exactly one validated reciprocal outcome and is `done`, resumable recorded state is accurate, or inline lifecycle non-applicability is explicit.
- Result and remaining risk are accurate, and no mission or other related status changed implicitly.
