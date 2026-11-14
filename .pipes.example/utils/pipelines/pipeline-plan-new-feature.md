---
title: New Feature Implementation Plan
description: Frames a feature, grounds it in live codebase evidence, selects a solution, and produces a validated executable plan before implementation begins.
version: 2.9
domain: codebase
category: planning
fragments:
  - fragment-instruction-surface-ownership
  - fragment-ask-feature-requirements
  - fragment-lint-feature-questions
  - fragment-classify-feature-unknowns
  - fragment-establish-scope-guardrails
  - fragment-reframe-intent
  - fragment-request-phase-approval
  - fragment-read-project-instruction
  - fragment-analyze-codebase-context
  - fragment-map-system-boundaries
  - fragment-assess-blast-radius
  - fragment-generate-solution-hypotheses
  - fragment-select-solution
  - fragment-clarify-shared-decisions
  - fragment-define-solution-architecture
  - fragment-define-implementation-steps
  - fragment-draft-test-strategy
  - fragment-assess-implementation-risks
  - fragment-confirm-acceptance-criteria
  - fragment-format-implementation-plan
  - fragment-create-plan-file
  - fragment-validate-plan-consistency
  - fragment-audit-plan-ambiguity
---
# Pipeline: New Feature Implementation Plan

Turn a feature request into an implementation-ready plan before application code is changed. The pipeline validates intent, discovers the live codebase, compares viable solutions, defines architecture and execution steps, and validates the resulting handoff against current evidence.

This is a planning pipeline. It owns phase sequencing, role handoffs, approval gates, and optional plan-record creation. It does not implement the feature. When mission-bound, it preserves the mission's active workflow, pending gate, resume trigger, validation target, and exact post-plan action.

## Entry Points

Use when the user asks for an implementation plan or when feature delivery is too broad or consequential for safe direct execution. Do not use for open-ended discovery without a delivery target or when a complete approved plan already exists and execution is the next action.

## Loop Use

An adaptive loop may invoke this pipeline after it has a bounded feature outcome. Pass the objective, users, scope, acceptance criteria, constraints, known decisions, relevant evidence, related paths, and persistence authority. For a delivery-aware mission, also pass the complete confirmed mission scope, theme labels, classifications, dependencies, existing approved coverage, selected delivery approach, current route, invoking mission path, and post-plan resume action. The pipeline returns an approved plan in conversation or a reciprocally linked plan record plus its coverage map, evidence-backed split rationale, and final consistency and ambiguity findings. Product choices, durable architecture commitments, and ungranted writes remain user-owned. Resume from the first phase whose declared exit conditions are not satisfied, using actual artifacts and approvals rather than replaying completed work.

## Control Rules

- Complete the six phases in order; do not design before Context or format the final artifact before Planning is complete.
- During Framing, ask only user-owned questions about intent, value, scope, constraints, and acceptance. Defer discoverable repository questions.
- Inspect current project instructions and live code before recommending an architecture or naming file-level steps.
- Compare genuinely distinct solution hypotheses and finish Design with one evidence-backed recommendation, even when it is provisional.
- Separate verified facts, user decisions, implementation risks, blockers, deferred work, and execution preconditions.
- Treat roles as responsibility and handoff contracts; role assignment does not imply spawning background agents.
- Stop only at declared material gates. Do not ask for approval of routine observations or repeat an approval already captured for the same content.
- Make tests and acceptance evidence concrete and proportional to the blast radius. Run consistency and ambiguity validation before handoff.
- Do not write application code or execute the plan in this pipeline.
- When mission-bound, choose the smallest coherent plan boundary that advances complete confirmed mission-scope coverage: one plan may cover multiple themes, `plan-required` does not require a dedicated plan, `plan-recommended` does not require an additional plan, and every split needs evidence. Preserve classifications and dependencies, return a coverage map and split rationale, and return to the exact recorded post-plan action rather than selecting a new mission route.
- For a mission-bound `spec-driven` route, keep planning until approved, validated plan coverage spans the complete confirmed mission scope; do not count plans by classification or theme.

## Team Contract

Primary owner: `roadmapper`

Participants:
- `visionaire` — product framing, users, outcomes, and scope guardrails.
- `full-stack-tech-lead` — context synthesis and solution coordination.
- `fe-architect` — frontend boundaries and trade-offs when affected.
- `be-architect` — backend boundaries and trade-offs when affected.

The primary owner preserves continuity across phases. Participants are consulted only when their boundary is affected or the acting role needs their evidence.

## Output

- approved implementation plan content
- optionally `.pipes/project/04-plans/plan-{number}-{slug}.md` with `status: draft`
- final consistency status, ambiguity status, verified preconditions, and blockers

## Phases

### Phase 1: Framing

**Objective:** Confirm the feature outcome, affected users, requirements, acceptance criteria, scope boundaries, and protected constraints without asking the user for facts the repository can provide.

**Acting Role:** `visionaire`

**Support Team:** `roadmapper`

**Entry Conditions:** A user request, mission, accepted spec, intent, note, or existing plan names a feature outcome worth planning.

**Inputs:**
- Feature request and available product context.
- The accepted spec in `.pipes/project/02-specs/` and its intent, when they exist.
- Known constraints, non-goals, success signals, and related paths.
- Complete mission scope, selected plan boundary, theme classifications and dependencies, existing coverage, selected approach, invoking mission path, and exact post-plan action when invoked from a delivery-aware mission.

**Fragments:**
- `fragment-ask-feature-requirements`
- `fragment-lint-feature-questions`
- `fragment-classify-feature-unknowns`
- `fragment-establish-scope-guardrails`
- `fragment-reframe-intent`

**Instructions:**
1. When an accepted spec exists, take its requirements `R1..Rn`, design, constraints, and risk class as the approved framing input and do not ask for them again; bind the plan boundary to the R-IDs it covers. When no accepted spec exists and the work is not `direct-capable`, recommend `pipeline-design-spec` before planning. Otherwise capture the desired behavior, users, requirements, measurable success, and non-goals with `fragment-ask-feature-requirements`. When mission-bound, bind framing to the approved plan boundary, which may cover one or more coherent themes, and show how it advances complete confirmed mission-scope coverage without silently absorbing uncovered scope.
2. Classify unresolved items as user-owned, repo-owned, agent-owned, or shared with `fragment-classify-feature-unknowns`.
3. Before asking a follow-up, run `fragment-lint-feature-questions`; defer repo-owned questions and safe agent defaults to later phases.
4. Establish in-scope, out-of-scope, protected, and deferred boundaries with `fragment-establish-scope-guardrails`.
5. Present one compact framing package with `fragment-reframe-intent`. Its confirmation is the phase approval; do not ask a duplicate approval question.

- Preserve acting-role context: `visionaire`, with `roadmapper` preserving scope and handoff clarity.
- Preserve routing semantics: `roadmapper` passes the approved framing and deferred repository questions to `full-stack-tech-lead` for Context.

**Outputs:**
- Approved feature framing and testable acceptance criteria, bound to the supplied mission theme when applicable.
- Scope guardrails, constraints, and protected areas.
- Classified unknowns and deferred Context or Design questions.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user approves product intent, scope, and acceptance criteria. Reuse an existing explicit approval when it covers the same complete framing package.

**Exit Conditions:**
- The outcome, users, scope, non-goals, and success criteria are explicit.
- Only discoverable repo questions or bounded future trade-offs remain.

### Phase 2: Context

**Objective:** Establish the feature's real codebase environment, affected system boundaries, integration points, existing patterns, and regression surface before proposing a solution.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `fe-architect`, `be-architect`

**Entry Conditions:** Phase 1 framing is approved and its deferred repository questions are available.

**Inputs:**
- Approved framing package and deferred repository questions.
- Project, architecture, conventions, manifests, tests, and relevant code.

**Fragments:**
- `fragment-instruction-surface-ownership`
- `fragment-read-project-instruction`
- `fragment-analyze-codebase-context`
- `fragment-map-system-boundaries`
- `fragment-assess-blast-radius`

**Instructions:**
1. Load established project, architecture, and convention context with `fragment-read-project-instruction`; identify placeholders and evidence gaps.
2. Use `fragment-analyze-codebase-context` to answer deferred repo questions through targeted inspection of current source, tests, and local patterns.
3. Map internal and external boundaries, data flow, integrations, shared contracts, and affected components with `fragment-map-system-boundaries`.
4. Assess dependents, regression risks, contract exposure, and overall impact with `fragment-assess-blast-radius`.
5. Keep unresolved facts visible and distinguish missing evidence from a user-owned decision.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `fe-architect` and `be-architect` only for affected boundaries.
- Preserve routing semantics: `full-stack-tech-lead` passes the Context evidence package to the Design phase and names any frontend or backend consultation still needed.

**Outputs:**
- Evidence-backed stack, architecture, convention, and relevant-file baseline.
- System-boundary and data-flow map with affected components.
- Resolved and unresolved repo questions plus blast-radius assessment.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** None for routine observation. Ask only when repository evidence contradicts approved scope or a missing fact would materially change the feature outcome and cannot be discovered safely.

**Exit Conditions:**
- Relevant boundaries, patterns, files, dependents, and risks are evidenced.
- Design can compare approaches without guessing where the feature belongs.

### Phase 3: Design

**Objective:** Compare viable implementations, select one recommendation, and define its architecture, data flow, file impact, verified preconditions, and deviations from existing patterns.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `fe-architect`, `be-architect`

**Entry Conditions:** The Context package is complete enough to evaluate solutions against actual repository constraints.

**Inputs:**
- Approved framing, Context evidence, affected boundaries, and blast radius.
- Agent-owned defaults and deferred shared decisions from Framing.

**Fragments:**
- `fragment-generate-solution-hypotheses`
- `fragment-select-solution`
- `fragment-clarify-shared-decisions`
- `fragment-define-solution-architecture`
- `fragment-request-phase-approval`

**Instructions:**
1. Generate two to four genuinely distinct approaches with `fragment-generate-solution-hypotheses`, grounding trade-offs in Context.
2. Evaluate fit, complexity, maintainability, risk, pattern alignment, and blast radius with `fragment-select-solution`; recommend one approach and explain why the alternatives are weaker.
3. Use `fragment-clarify-shared-decisions` only for high-impact trade-offs that remain unresolved after the recommendation.
4. Define component interactions, data flow, impacted files, new contracts, verified preconditions, and justified deviations with `fragment-define-solution-architecture`.
5. Invoke `fragment-request-phase-approval` only when the recommendation makes a material product or durable architecture choice not already authorized.

- Preserve acting-role context: `full-stack-tech-lead`, coordinating `fe-architect` and `be-architect` where their surfaces are affected.
- Preserve routing semantics: `full-stack-tech-lead` passes the selected design package to `roadmapper` for executable planning.

**Outputs:**
- Recommended solution and rejected alternatives with evidence-based rationale.
- Architecture, data flow, impacted-file view, verified preconditions, and deviations.
- Resolved decisions or a small explicit set of remaining user-owned choices.

**Handoff To:** `roadmapper`

**Approval Gate:** The user decides only material product or architecture trade-offs not already authorized. Otherwise the documented recommendation is provisional until the complete plan is approved in Phase 5.

**Exit Conditions:**
- One recommendation is selected and sufficiently defined for step planning.
- No hidden shared decision would force an implementer to redesign the feature.

### Phase 4: Planning

**Objective:** Convert the selected design into ordered file-level work, proportional test coverage, risk mitigations, verified execution preconditions, and final acceptance criteria.

**Acting Role:** `roadmapper`

**Support Team:** `full-stack-tech-lead`

**Entry Conditions:** A selected solution and solution architecture exist.

**Inputs:**
- Selected design, impacted files, verified preconditions, blast radius, and constraints.
- Approved acceptance criteria and any unresolved implementation risks.

**Fragments:**
- `fragment-define-implementation-steps`
- `fragment-draft-test-strategy`
- `fragment-assess-implementation-risks`
- `fragment-confirm-acceptance-criteria`

**Instructions:**
1. Define atomic ordered steps, file touchpoints, dependencies, expected results, and critical-path work with `fragment-define-implementation-steps`.
2. Draft unit, integration, end-to-end, regression, edge-case, and test-data coverage with `fragment-draft-test-strategy`.
3. Classify implementation and regression risks, mitigations, reversibility, verified execution preconditions, and blockers with `fragment-assess-implementation-risks`.
4. Compare the resulting plan with the approved success criteria. Use `fragment-confirm-acceptance-criteria` only when Design changed them, a blocker needs user resolution, or execution preconditions need confirmation.

- Preserve acting-role context: `roadmapper`, consulting `full-stack-tech-lead` when execution sequencing reveals a design contradiction.
- Preserve routing semantics: `roadmapper` passes the complete planning package to artifact formatting and approval.

**Outputs:**
- Sequenced implementation steps with files, dependencies, and expected results.
- Test strategy, risk register, mitigations, blockers, and deferred work.
- Final acceptance criteria and verified execution preconditions.

**Handoff To:** `roadmapper`

**Approval Gate:** None when the approved criteria remain intact and no blocker exists. Return to the relevant earlier phase when resolving a blocker changes scope or design.

**Exit Conditions:**
- Another capable implementer can execute the steps without making material product or architecture choices.
- Tests, risks, verified preconditions, blockers, and acceptance evidence are explicit.

### Phase 5: Approve And Record

**Objective:** Format the complete plan, present its exact content and optional target path, obtain one approval, and create a durable record only when useful and authorized.

**Acting Role:** `roadmapper`

**Entry Conditions:** The Planning package is complete and contains no known blocking ambiguity.

**Inputs:**
- Framing, Context, Design, and Planning outputs.
- Related paths plus whether persistence is requested or useful.

**Fragments:**
- `fragment-format-implementation-plan`
- `fragment-request-phase-approval`
- `fragment-create-plan-file`

**Instructions:**
1. Build one readable plan preview with `fragment-format-implementation-plan`, preserving evidence, alternatives, architecture, steps, tests, risks, verified preconditions, deferred work, and acceptance criteria.
2. When persistence is requested or useful, inspect the plans area and choose the exact next `plan-{number}-{slug}.md` target before requesting approval.
3. Display the full plan, persistence mode, exact target path if any, invoking mission path when mission-bound, coverage map, split rationale, and both reciprocal relationship effects.
4. Use `fragment-request-phase-approval` once for the displayed plan content; the same approval covers file creation only when the target and write are explicitly included. If user revision is required, say that the draft plan is ready for revision, invite iteration until it is implementation-ready, and state that the active mission will resume afterward.
5. After approval, use `fragment-create-plan-file` when persistence was authorized. A mission-bound plan must directly and reciprocally link the invoking mission before this phase completes; include both effects in the approval package, permit Pipes Local to apply its expected automatic reciprocal update, and re-read both records rather than assuming synchronization.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the approved plan content or record path to Final Validation, which then returns the implementation-ready handoff to the active mission when applicable.

**Outputs:**
- Approved implementation plan content.
- Optional readable plan record and confirmed path.
- Approval and persistence limitations for final validation.

**Handoff To:** `roadmapper`

**Approval Gate:** Approval of the complete plan by the active gate authority is required. Outside a mission that authority is the user; inside an active mission resolve it from the recorded intervention-to-autonomy mapping and governing contracts, while human-mandatory remains user-owned. Record this as a plan-content decision; it remains distinct from and does not authorize plan execution. Writing a plan record also requires approval of the exact target unless that write was already included in the same displayed approval package.

**Exit Conditions:**
- Exact plan content is approved and identifiable.
- Persistence state is explicit; any approved record exists and is readable.

### Phase 6: Final Validation

**Objective:** Verify that the approved plan still matches the live codebase and classify any remaining ambiguity before implementation handoff.

**Acting Role:** `roadmapper`

**Support Team:** `full-stack-tech-lead`

**Entry Conditions:** Approved plan content or a readable approved plan record is available from Phase 5.

**Inputs:**
- Exact approved plan content or record path.
- Current project records, codebase state, and affected repositories.

**Fragments:**
- `fragment-validate-plan-consistency`
- `fragment-audit-plan-ambiguity`

**Instructions:**
1. Run `fragment-validate-plan-consistency` against the approved plan and current project and codebase evidence.
2. Run `fragment-audit-plan-ambiguity` separately to verify that no execution caveat remains.
3. Give every contradiction or ambiguity a concrete correction and confirm every input, dependency, target, and acceptance criterion needed for execution.
4. If a correction materially changes approved scope, design, steps, or acceptance criteria, return to Phase 5 with a revised preview for approval.
5. Present the handoff only when validation is clear, all execution preconditions are verified, and no blocker remains.
6. When mission-bound, return the plan path or approved content, covered theme labels, classifications, dependencies, coverage map, split rationale, exact content-approval and final-validation receipts, verified reciprocal mission relationship, and exact recorded post-plan action to the active loop. Do not change delivery approach or imply plan execution approval.

- Preserve acting-role context: `roadmapper`, consulting `full-stack-tech-lead` for cross-boundary contradictions.
- Preserve routing semantics: Terminal handoff to the active mission's recorded next action, `pipeline-execute-plan`, or the active delivery loop when implementation is authorized. Immediate mission continuation does not require the user to issue another pipeline command.

**Outputs:**
- Consistency status: `pass` or `blocking`.
- Ambiguity status: `clear` or `blocking`.
- Corrections, verified preconditions, and blockers.
- Final validated implementation handoff and exact mission resume action when applicable.

**Handoff To:**

**Approval Gate:** Any finding blocks implementation. Material corrections return to Phase 5 for approval; a clear handoff does not require another ceremonial approval.

**Exit Conditions:**
- The plan is validated against current evidence, every execution precondition is verified, and no unresolved caveat remains.
- No contradiction or ambiguity is hidden from downstream execution.
