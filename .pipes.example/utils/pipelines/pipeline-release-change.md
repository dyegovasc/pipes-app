---
title: Release Change
description: Releases or promotes a reviewed and merged change through its environments and release workflows, behind gate G5, and records the release in the outcome.
version: 1.1
domain: codebase
category: delivery
fragments:
  - fragment-gate-evaluation
  - fragment-format-release-notes
  - fragment-request-approval
  - fragment-capture-execution-outcome
  - fragment-format-outcome-record
  - fragment-create-outcome-file
---
# Pipeline: Release Change

Move a merged change through its environments with the repository's own release workflows. When `.pipes/ai-instructions/delivery.md` exists, the environments, their autonomy, the dispatch commands, the release workflows, and any change-ticket pattern come from it. Without a delivery profile, every environment is `ask`: the holder of gate G5 confirms each exact dispatch, and a release workflow is one whose name contains release, promote, or deploy. An `auto` environment deploys without an agent dispatch, for example on merge, so it needs none.

The agent may prepare everything up to the release gate and dispatch only after the human decision. An `ask` environment needs a human confirmation of the exact dispatch; a `ticket` environment, which only a delivery profile can declare, needs an approved change ticket that matches the profile's pattern and its approver. The protected-action hook enforces both.

## Entry Points

Use when a reviewed change is merged and the next step is an `ask` or `ticket` environment. Do not use for unmerged work, for infrastructure changes, which go through pull requests to their source repositories, or for a rollback without an incident record.

## Loop Use

`loop-feature-delivery` uses this pipeline after the change is merged. Pass the repository, the plan, the review record, and the target environment. The pipeline returns release notes, the workflow run, and the outcome record with its `## Release` section. After a pause, inspect the workflow runs and the outcome before resuming from the first incomplete phase; never dispatch a workflow twice without checking the first run.

## Control Rules

- Release only merged changes with green checks on the default branch and a review record whose verdict is not `not ready`.
- Dispatch only the release workflows listed in the delivery profile, or, without one, the release workflow that the holder of gate G5 confirms; never apply infrastructure directly.
- The holder of gate G5 (core.md Gates) decides every dispatch; a `ticket` environment also needs a matching change ticket and its approver.
- Record the release in the plan outcome with environment, version, workflow run, change ticket when required, and approver.

## Output

- Release notes in the project's documentation language
- Workflow run link and resulting version
- Outcome record with `## Release`, linked to the plan

## Phases

### Phase 1: Readiness

**Objective:** Confirm that the change is merged, checked, reviewed, and ready for the target environment.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** A repository, plan, and target environment are named.

**Inputs:**
- Plan, review record, merged pull requests, checks on the default branch, and current workflow runs.

**Fragments:**
- `fragment-gate-evaluation`

**Instructions:**
1. Confirm the pull requests are merged and the checks on the default branch are green, using read-only forge commands, for example `gh`.
2. Confirm a review record exists with verdict `ready` or `ready with findings` and no open blocking finding.
3. Use `fragment-gate-evaluation` to state gate G5 for the target environment: its autonomy in the delivery profile, or `ask` without one, who decides, whether a change ticket is required, and what would invalidate the decision.
4. For an `auto` environment, report that the change is deployed without a dispatch, with its evidence, and stop.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for check evidence.
- Preserve routing semantics: `roadmapper` passes the readiness package to Release Notes.

**Outputs:**
- Readiness package with merge, check, and review evidence, and the gate G5 statement.

**Handoff To:** `roadmapper`

**Approval Gate:** None. Stop when a readiness condition fails.

**Exit Conditions:**
- Every readiness condition is met, or the pipeline stopped with the failing condition.

### Phase 2: Release Notes

**Objective:** Write the release notes for the version.

**Acting Role:** `roadmapper`

**Entry Conditions:** Phase 1 confirmed readiness for an `ask` or `ticket` environment.

**Inputs:**
- Plan, spec requirement IDs, merged pull requests, and review record.

**Fragments:**
- `fragment-format-release-notes`

**Instructions:**
1. Use `fragment-format-release-notes` to write the notes, with contract changes and operations notes first when they exist.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the notes and the dispatch command to Dispatch.

**Outputs:**
- Release notes and the exact dispatch command.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** None.

**Exit Conditions:**
- The notes and the exact command are ready for the gate.

### Phase 3: Dispatch

**Objective:** Dispatch the release or promotion after the gate G5 decision.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 2 produced the notes and the exact command.

**Inputs:**
- Release notes, exact command, target environment, and change ticket when required.

**Fragments:**
- `fragment-request-approval`

**Instructions:**
1. Use `fragment-request-approval` to present the exact command, the target environment, the notes, and, for a `ticket` environment, the change ticket and its approver's decision.
2. After approval, run the dispatch command that the delivery profile gives for the target environment, or, without a profile, the confirmed command, with the version and environment filled in, in the target repository. The hook asks again or denies when the gate is not met.
3. Watch the run with read-only forge commands, for example `gh run`, and capture its link, conclusion, and the released version.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: `full-stack-tech-lead` passes the run evidence to Record.

**Outputs:**
- Workflow run link, conclusion, and version.

**Handoff To:** `roadmapper`

**Approval Gate:** Human-mandatory gate G5: the holder of gate G5 (core.md Gates; the user unless `.pipes/ai-instructions/accountability.md` names another holder) approves the exact dispatch; a `ticket` environment also needs an approved change ticket that matches the delivery profile.

**Exit Conditions:**
- The run finished, or the gate was declined and nothing was dispatched.

### Phase 4: Record

**Objective:** Record the release in the plan outcome.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 finished with a run result or a declined gate.

**Inputs:**
- Run evidence, release notes, plan, and existing outcome.

**Fragments:**
- `fragment-capture-execution-outcome`
- `fragment-format-outcome-record`
- `fragment-create-outcome-file`

**Instructions:**
1. Use `fragment-capture-execution-outcome` to state the result. A failed run is a `failed` or `partial` result with its evidence, not a silent retry.
2. Use `fragment-format-outcome-record` with the `## Release` section, and `fragment-create-outcome-file` to write or update the outcome with reciprocal plan links.
3. Run the record validator and resolve its findings.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for record validation.
- Preserve routing semantics: Return the outcome path and release evidence to the invoking loop or user.

**Outputs:**
- Outcome record with `## Release`, linked to the plan.

**Handoff To:**

**Approval Gate:** The outcome write follows the approval rules of `fragment-create-outcome-file`.

**Exit Conditions:**
- The outcome records the release, and the validator passes.
