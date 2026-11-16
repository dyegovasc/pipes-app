---
title: Design Spec
description: Turns one accepted intent into a spec with numbered requirements and a design grounded in the affected repositories.
version: 1.2
domain: project
category: planning
fragments:
  - fragment-read-project-instruction
  - fragment-analyze-codebase-context
  - fragment-map-system-boundaries
  - fragment-assess-blast-radius
  - fragment-draft-spec-requirements
  - fragment-generate-solution-hypotheses
  - fragment-select-solution
  - fragment-format-spec-record
  - fragment-request-approval
  - fragment-create-spec-file
---
# Pipeline: Design Spec

Turn one accepted intent into one spec in `.pipes/project/02-specs/`. The spec holds numbered requirements `R1..Rn` and the design that plans implement and cite. Requirements and design are produced together in one pass, grounded in the live repositories.

This pipeline designs and records the spec. It does not accept the spec, create a mission or plan, or change any repository.

## Entry Points

Use when an intent is `accepted` and no accepted spec covers it yet. Do not use for a `draft` or `rejected` intent, for work that `pipeline-plan-new-feature` can plan directly as `direct-capable`, or to change an accepted spec in place; a changed requirement needs a new spec that supersedes the old one.

## Loop Use

`loop-concept-development` and `loop-feature-delivery` use this pipeline after an intent is accepted. Pass the intent path, any related decisions and notes, and the invoking mission path when mission-bound. The pipeline returns an exact spec proposal awaiting approval or a written spec path with its status, requirement IDs, and risk class. Acceptance remains gate G2. After a pause, re-read the intent, the affected repositories, and the proposed target before resuming from the first incomplete phase.

## Control Rules

- Design only from an `accepted` intent, and stay inside its proposed outcome. Surface extra scope as a question for the holder of gate G2.
- Inspect the affected repositories read-only. Do not edit, branch, or commit in any repository.
- Number requirements `R1..Rn` without gaps. Derive them and their acceptance checks from the intent's How Do We Know It Works checks, and keep each requirement traceable to its intent check. Every requirement is testable; every intent constraint maps to requirements or an open question.
- Compare genuinely distinct designs and finish with one evidence-backed recommendation.
- `accepted` means the holder of gate G2 (core.md Gates) decided; when the risk class is `higher`, the tech lead decides together with the product owner, as core.md Gates defines. File approval alone never accepts a spec.
- Never renumber or silently change requirements of an accepted spec.

## Output

- Exact `.pipes/project/02-specs/spec-{number}-{slug}.md` proposal
- Written spec path, status, requirement IDs, risk class, and verified reciprocal link to its intent

## Phases

### Phase 1: Read Intent

**Objective:** Confirm the intent is accepted and extract the problem, outcome, success checks, constraints, affected components, and open questions the spec must answer.

**Acting Role:** `roadmapper`

**Entry Conditions:** A user request or governed workflow names an intent for design.

**Inputs:**
- Intent path and record.
- Existing specs in `.pipes/project/02-specs/` and related decisions in `.pipes/project/05-decisions/`.

**Fragments:**
- `fragment-read-project-instruction`

**Instructions:**
1. Read the intent. Stop and report when its status is not `accepted`.
2. Read existing specs. Return the owning spec path when an accepted spec already covers this intent.
3. Use `fragment-read-project-instruction` to load project identity, the gate holders (core.md Gates, and `.pipes/ai-instructions/accountability.md` when it exists), and architecture context.
4. List the affected components, the How Do We Know It Works checks, constraints, and open questions that the next phases must address. When the intent has no known check, list that as an open question.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the intent brief and affected components to Context.

**Outputs:**
- Intent brief with affected components, success checks, constraints, and open questions.
- Existing spec finding, if any.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** None. Stop when the intent is not accepted or an accepted spec already covers it.

**Exit Conditions:**
- The intent is accepted and no accepted spec covers it.
- The affected components and constraints are explicit.

### Phase 2: Context

**Objective:** Establish the real state of the affected components, their boundaries, contracts, and blast radius before designing.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `be-architect`

**Entry Conditions:** Phase 1 produced an intent brief with affected components.

**Inputs:**
- Intent brief and affected components.
- The affected repositories, read-only: this repository, or, in the `multi-repo` layout of `.pipes/ai-instructions/delivery.md`, the repositories under its services root.

**Fragments:**
- `fragment-analyze-codebase-context`
- `fragment-map-system-boundaries`
- `fragment-assess-blast-radius`

**Instructions:**
1. Use `fragment-analyze-codebase-context` on each affected repository to find current behavior, patterns, contracts, and tests relevant to the intent.
2. Use `fragment-map-system-boundaries` to map component boundaries, shared contracts, events, and data ownership across the affected components and the shared libraries they depend on.
3. Use `fragment-assess-blast-radius` to identify dependents, consumers, and regression risk.
4. Answer intent open questions that the repositories can answer, and keep the rest open with an owner role.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `be-architect` for component and contract boundaries.
- Preserve routing semantics: `full-stack-tech-lead` passes the context evidence to Requirements And Design.

**Outputs:**
- Evidence-backed context per affected component with paths.
- Boundary and contract map, blast radius, and answered or remaining open questions.

**Handoff To:** `be-architect`

**Approval Gate:** None for read-only observation. Ask only when repository evidence contradicts the accepted intent.

**Exit Conditions:**
- Every affected component has current evidence.
- Design can proceed without guessing where the change belongs.

### Phase 3: Requirements And Design

**Objective:** Derive numbered requirements from the intent and select one design that meets them and every constraint.

**Acting Role:** `be-architect`

**Support Team:** `full-stack-tech-lead`

**Entry Conditions:** Phase 2 produced context evidence for every affected component.

**Inputs:**
- Intent brief, context evidence, boundary map, and blast radius.

**Fragments:**
- `fragment-draft-spec-requirements`
- `fragment-generate-solution-hypotheses`
- `fragment-select-solution`

**Instructions:**
1. Use `fragment-draft-spec-requirements` to derive requirements `R1..Rn` and their acceptance checks from the intent's success checks, with a trace from each requirement to its intent check, constraint coverage, open questions, areas of concern, and the risk class.
2. Use `fragment-generate-solution-hypotheses` to compare two to four genuinely distinct designs grounded in the context evidence.
3. Use `fragment-select-solution` to recommend one design and explain why the alternatives are weaker.
4. Describe the selected design per affected component: changes, contracts, data, and state.
5. Check that every requirement is met by the design, every intent check is covered by a requirement, and every intent constraint maps to requirements or an open question.

- Preserve acting-role context: `be-architect`, coordinating with `full-stack-tech-lead` for cross-component trade-offs.
- Preserve routing semantics: `be-architect` passes the requirements and selected design to Format And Approve.

**Outputs:**
- Numbered requirements traced to intent checks, with constraint coverage.
- Selected design per component, rejected alternatives, open questions, areas of concern, and risk class.

**Handoff To:** `roadmapper`

**Approval Gate:** None unless a material product trade-off remains; then the holder of gate G2 decides it before formatting.

**Exit Conditions:**
- Requirements are numbered, testable, and inside the intent's outcome.
- One design is selected and meets every requirement.

### Phase 4: Format And Approve

**Objective:** Produce one exact spec proposal and bind approval to its content, path, and relationship effects, keeping acceptance as gate G2.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`, `reviewer`

**Entry Conditions:** Phase 3 produced requirements and a selected design.

**Inputs:**
- Requirements, design, constraint coverage, open questions, areas of concern, and risk class.
- Spec area config, filename inventory, and the intent record.

**Fragments:**
- `fragment-format-spec-record`
- `fragment-request-approval`

**Instructions:**
1. Choose the next available filename without reserving or writing it.
2. Use `fragment-format-spec-record` to build the complete preview with the Intent, Requirements, Design, How Each Constraint Is Met, Open Questions, Areas Of Concern, and Risk Class sections.
3. Validate that requirement IDs are unique and without gaps and that `related` lists the intent.
4. Under `rule-separation-of-duties`, run a `reviewer` pass in a fresh context that did not author the spec, using the `reviewer` isolated agent where the agent tool supports one and a separate session otherwise: check every requirement against the intent, every intent check against the requirements that cover it, every constraint against its coverage, and the design against the context evidence. Attach the review summary to the approval package.
5. Present the exact content, filename, status, risk class, review summary, both reciprocal relationship effects with the intent, and the invoking mission when mission-bound.
6. Use `fragment-request-approval` once for the unchanged proposal. Ask the gate G2 authority separately whether to accept the spec; when the risk class is `higher`, include the tech lead.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for config, requirement ID, and relationship validation, and `reviewer` for the non-author review.
- Preserve routing semantics: The approved unchanged proposal passes to Create; corrections return to the phase that owns them.

**Outputs:**
- Complete validated spec proposal and exact target path.
- File approval, and the G2 accept or defer decision.

**Handoff To:** `roadmapper`

**Approval Gate:** Human-mandatory. Approval covers the displayed spec content, filename, and relationship effects. Acceptance is gate G2 and belongs to its holder (core.md Gates), together with the tech lead when the risk class is `higher`; without that decision the spec stays `draft`.

**Exit Conditions:**
- The proposal satisfies area config, requirement ID, and relationship contracts.
- File approval is exact and current, and the G2 decision is recorded.

### Phase 5: Create

**Objective:** Write the approved spec with its reciprocal intent link, validate it, and report the next action.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 4 approved unchanged exact content, status, path, and relationship effects.

**Inputs:**
- Approved proposal, spec inventory, area config, intent record, and approval scope.

**Fragments:**
- `fragment-create-spec-file`

**Instructions:**
1. Re-read the spec inventory, target, and intent; return to Phase 4 if the filename appeared or the intent changed after approval.
2. Use `fragment-create-spec-file` to write the spec and add it to the intent's `related` list.
3. Re-read both records and run `node .pipes/utils/scripts/validate-project-records.cjs`; resolve any spec finding before reporting completion.
4. Report the path, status, requirement IDs, risk class, and next action: `pipeline-start-mission` for delivery across several plans or `pipeline-plan-new-feature` for a single bounded plan.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for final validation evidence.
- Preserve routing semantics: Return the spec path and evidence to the invoking loop or user; planning starts only from an accepted spec.

**Outputs:**
- Written spec record with verified reciprocal intent link and validation evidence.
- Next action.

**Handoff To:**

**Approval Gate:** No additional gate for the approved new file. Stop before a target conflict, material deviation, change to another spec, or protected action.

**Exit Conditions:**
- The approved spec is readable at the exact target and validation passes.
- The intent lists the spec, and no other record changed.
