---
title: Execute Mission
description: Loads a recorded mission, validates readiness, obtains explicit execution approval, and starts its selected loop.
version: 2.5
domain: project
category: delivery
fragments:
  - fragment-ask-mission-selection
  - fragment-read-mission-record
  - fragment-assess-mission-execution-readiness
  - fragment-request-phase-approval
  - fragment-activate-mission
  - fragment-mission-journal-contract
---
# Pipeline: Execute Mission

Start or resume adaptive mission work only after the exact recorded mission, current readiness, and intended initial action have been shown to and approved by the user.

This pipeline owns selection, readiness validation, the mandatory execution gate, mission activation, and the initial loop handoff. The selected loop owns adaptive work after approval.

## Entry Points

Use when the user asks to execute, start, or resume a mission. Accept a canonical mission path or an unambiguous mission title. Treat both `draft` and `active` as valid readiness candidates. Do not use mission creation, mission file existence, or mission status as evidence of execution approval.

## Loop Use

This is normally an external entrypoint into an already recorded mission. An invoking loop may use it for a distinct mission only when the user still approves that mission's readiness package explicitly. Pass a mission path when known. It returns an activated or resumed mission and selected-loop handoff. After a pause, re-read the mission and resume from the first phase whose exit conditions are incomplete; never replay approval or activation blindly.

## Control Rules

- Resolve exactly one canonical mission before assessing readiness.
- Perform only read-only selection and readiness checks before approval.
- Treat creation approval and execution approval as separate authorities.
- Treat mission `status` as lifecycle state and the Journal gate receipt as execution-approval evidence; `active` alone neither proves approval nor creates a correction.
- Treat an `active` mission with a pending execution gate or a Journal statement that execution has not started as coherent input to the same readiness package used for a `draft`.
- Display mission path, version, status, loop, delivery approach and current theme when present, complete-scope plan coverage and split evidence, initial action, scope, remaining gates, protected actions, blockers, and validation target before asking.
- Require explicit user approval at the human-mandatory readiness gate on every start or resume entered through this pipeline. An immediate, still-valid gate continuation inside an already active mission does not repeat this entry gate.
- Re-read the mission after approval and reassess if material content changed.
- Preserve unrelated worktree changes and every unresolved mission gate.
- Activate or resume the mission before invoking its selected loop.
- Stop on `done`, unresolved `blocked`, invalid, ambiguous, or materially stale missions instead of silently repairing or replacing them.

## Output

- selected mission and execution brief
- readiness classification and explicit approval result
- activated or resumed mission path and version
- selected loop, delivery route or legacy classification, initial action, remaining gates, and validation target

## Phases

### Phase 1: Select And Load

**Objective:** Resolve one recorded mission and extract its complete readable execution contract without changing files or beginning work.

**Acting Role:** `roadmapper`

**Entry Conditions:** The user has requested mission execution; a mission path may or may not already be supplied.

**Inputs:**
- Mission path, exact title, or discoverable draft and active candidates.
- Mission area config and installed loop definitions.

**Fragments:**
- `fragment-ask-mission-selection`
- `fragment-read-mission-record`

**Instructions:**
1. If the request does not identify exactly one mission, use `fragment-ask-mission-selection` and wait for an unambiguous selection.
2. Use `fragment-read-mission-record` to extract status, version, objective, scope, delivery approach and themes when present, intervention-to-autonomy mapping, delegated and user authority, operating envelope, loop, active workflow, pending gate, resume trigger, validation target, stop conditions, and current or first Next Action.
3. Verify the selected loop path and report record contradictions without changing the mission.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the unchanged execution brief to readiness validation.

**Outputs:**
- Exact mission path, title, version, and status.
- Execution brief, selected loop, delivery route or `legacy_without_delivery`, current or initial action, and record findings.

**Handoff To:** `roadmapper`

**Approval Gate:** None. Stop for user selection only when the mission remains ambiguous or cannot be found.

**Exit Conditions:**
- Exactly one readable mission and one installed loop are identified.
- No mission action or state write has occurred.

### Phase 2: Validate And Approve

**Objective:** Prove that the selected mission can start or resume safely and obtain explicit user approval for the displayed execution package.

**Acting Role:** `roadmapper`

**Entry Conditions:** Phase 1 produced one complete execution brief.

**Inputs:**
- Mission brief, current relevant files and worktree state, selected loop, and proposed initial action.

**Fragments:**
- `fragment-assess-mission-execution-readiness`
- `fragment-request-phase-approval`

**Instructions:**
1. Use `fragment-assess-mission-execution-readiness` to classify the mission as `ready`, `needs_correction`, or `blocked` against current evidence without treating `active` status alone as prior approval or a correction.
2. Stop on corrections or blockers that prevent a safe initial action.
3. For a ready mission, display the exact path, version, status, loop, delivery approach, current theme, classification, route, complete-scope plan coverage, and split rationale when present, intervention-to-autonomy mapping, initial action, allowed scope, remaining gates, protected actions, deciding authority, resume trigger, and validation. Identify a readable mission without `## Delivery` as legacy without requiring migration.
4. Use `fragment-request-phase-approval` to ask explicitly whether execution should start or resume. Do not treat the invocation request as this approval.

- Preserve acting-role context: `roadmapper`, consulting the mission's named roles when a readiness contradiction crosses their boundary.
- Preserve routing semantics: An approved, version-bound readiness package passes to activation.

**Outputs:**
- Readiness classification and evidence.
- Complete execution approval package, including delivery continuity or legacy classification.
- Explicit approval or requested corrections.

**Handoff To:** `roadmapper`

**Approval Gate:** Human-mandatory. No mission state or mission action may change until the user explicitly approves the displayed package.

**Exit Conditions:**
- The package is approved for the exact mission version, or the pipeline stops with corrections, rejection, or blockers.

### Phase 3: Activate And Handoff

**Objective:** Record the approved start or resume transition and begin adaptive work through the mission's selected loop.

**Acting Role:** `roadmapper`

**Entry Conditions:** Phase 2 has explicit user approval for the unchanged mission version and readiness package.

**Inputs:**
- Approved readiness package, mission path and version, selected loop, initial action, and remaining gates.

**Fragments:**
- `fragment-activate-mission`
- `fragment-mission-journal-contract`

**Instructions:**
1. Re-read the mission and return to Phase 2 if material state changed.
2. Use `fragment-activate-mission` to set a draft mission active or record an approved active-mission resumption, bump its version, and update readable state and journal while preserving the approved delivery approach, current theme, and exact route when present.
3. Read the selected loop, confirm its operating envelope and declared pipeline capabilities, follow the approved persisted route, and begin only the approved current-scope action. For `spec-driven`, invoke `pipeline-plan-new-feature` when approved, validated plan coverage does not yet span the complete confirmed mission scope, and route to `pipeline-execute-plan` only after coverage is complete; do not infer a missing plan from classification or theme count. For `adaptive`, preserve required plan coverage and the approved incremental route.
4. From this point, let the selected loop continue until a real stop condition; preserve all remaining mission and external approval gates. After an immediate gate decision, record its compact receipt and resume the exact mission action directly when the approval remains valid.

- Preserve acting-role context: `roadmapper` until the selected loop assumes ownership.
- Preserve routing semantics: The selected loop owns subsequent adaptive progress under the mission's approved operating envelope.

**Outputs:**
- Activated or resumed mission and version.
- Selected-loop handoff, delivery route or legacy classification, and approved initial action.
- Remaining gates, validation target, and first execution evidence.

**Handoff To:**

**Approval Gate:** No duplicate activation approval. Stop if the mission changed, activation fails validation, or the initial action needs separate authority not included in the approved package.

**Exit Conditions:**
- The approved mission transition is readable and validated.
- The selected loop has begun only the approved in-scope action.
