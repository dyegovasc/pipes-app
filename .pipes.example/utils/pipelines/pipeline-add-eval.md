---
title: Add Eval
description: Turns an incident, a repeated agent mistake, or a new contract into a behavioral eval case for this repository's agent configuration.
version: 1.0
domain: framework
category: record
fragments:
  - fragment-capture-eval-source
  - fragment-format-eval-case
  - fragment-request-approval
  - fragment-create-eval-case
---
# Pipeline: Add Eval

Turn one observed or required agent behavior into one eval case under `.pipes/utils/scripts/fixtures/evals/`. The eval suite proves that changes to `.pipes/`, the generated entrypoints, skills, agents, and hooks keep the agent behaving as governed. Every production incident and every repeated agent mistake should end as an eval case.

## Entry Points

Use when an incident is closed, when `rule-capture-pipeline-incidents` finds a repeated mistake, when a correction is added to `corrections.md`, or when a new contract needs proof that the agent follows it. Do not use for unit tests of scripts, which belong in `*.test.cjs` files, or for tests of service code, which belong in the service repository.

## Loop Use

`loop-framework-maintenance` and `loop-investigation-and-recovery` use this pipeline. Pass the source evidence, the expected behavior, and the files the agent may change. The pipeline returns a duplicate finding, an exact case proposal awaiting approval, or a written case with its first run result. After a pause, inspect the existing cases and the proposed path before resuming from the first incomplete phase.

## Control Rules

- One case proves one behavior that a check can observe.
- A case never depends on the agent's private reasoning, only on files, records, git state, tool calls, and tool results.
- A new case may fail on its first run when it reproduces a mistake; record that state instead of weakening the checks.
- Adding a case is an agent-configuration change under gate G6 in `.pipes/ai-instructions/accountability.md`.
- Running a case calls a real agent and costs money; run only the new case in this pipeline.

## Output

- Duplicate finding with the existing case id when no file should be created
- Exact `.pipes/utils/scripts/fixtures/evals/{id}.json` proposal
- Written case path with its first run result and cost

## Phases

### Phase 1: Capture

**Objective:** Capture one behavior to prove, its source evidence, the task prompt, and the observable checks, and confirm that no existing case covers it.

**Acting Role:** `e2e-tester`

**Support Team:** `roadmapper`

**Entry Conditions:** An incident, issue, correction, repeated mistake, or contract names an agent behavior worth proving.

**Inputs:**
- Source evidence and expected behavior.
- Existing cases in `.pipes/utils/scripts/fixtures/evals/`.

**Fragments:**
- `fragment-capture-eval-source`

**Instructions:**
1. Read the source evidence before asking for details it already contains.
2. Use `fragment-capture-eval-source` to capture the expected behavior, task prompt, setup files, allowed changes, and observable checks.
3. Read existing cases and return a duplicate finding when one already proves the behavior.

- Preserve acting-role context: `e2e-tester`, with `roadmapper` checking the source evidence.
- Preserve routing semantics: `e2e-tester` passes the captured case to Format And Approve, or ends the pipeline with a duplicate finding.

**Outputs:**
- One captured behavior with prompt, setup, allowed changes, and checks.
- Duplicate finding when applicable.

**Handoff To:** `e2e-tester`

**Approval Gate:** None for capture.

**Exit Conditions:**
- The behavior is observable by the runner's check types.
- No existing case covers it.

### Phase 2: Format And Approve

**Objective:** Produce one exact eval case and obtain approval for it as an agent-configuration change.

**Acting Role:** `e2e-tester`

**Support Team:** `reviewer`

**Entry Conditions:** Phase 1 produced one captured behavior.

**Inputs:**
- Captured behavior and existing case ids.

**Fragments:**
- `fragment-format-eval-case`
- `fragment-request-approval`

**Instructions:**
1. Use `fragment-format-eval-case` to build the complete JSON preview with only supported check types.
2. Run a `reviewer` pass, through the isolated agent where supported, to confirm that the checks prove the behavior and cannot pass by accident.
3. Use `fragment-request-approval` once for the exact case content and path.

- Preserve acting-role context: `e2e-tester`, consulting `reviewer` for the non-author check of the case.
- Preserve routing semantics: The approved unchanged case passes to Create And Run; corrections return to the phase that owns them.

**Outputs:**
- Exact eval case proposal, review summary, and approval decision.

**Handoff To:** `e2e-tester`

**Approval Gate:** Human-mandatory. Gate G6 in `.pipes/ai-instructions/accountability.md`: the code owner of the agent configuration approves the exact case content and path.

**Exit Conditions:**
- The approved case content and path are exact and current.

### Phase 3: Create And Run

**Objective:** Write the approved case, prove it is well formed, and run it once.

**Acting Role:** `e2e-tester`

**Entry Conditions:** Phase 2 approved the exact case.

**Inputs:**
- Approved case content and path.

**Fragments:**
- `fragment-create-eval-case`

**Instructions:**
1. Use `fragment-create-eval-case` to write the case, run the eval format test, and run the new case once.
2. Report whether the case guards working behavior or reproduces a mistake, with the failing checks, cost, and result file.

- Preserve acting-role context: `e2e-tester`.
- Preserve routing semantics: Return the case path and first run result to the invoking loop or user; a reproducing case points to the fix that must make it pass.

**Outputs:**
- Written eval case, format test result, first run result, cost, and result file path.

**Handoff To:**

**Approval Gate:** No additional gate for the approved case. Stop before changing rules, instructions, or other cases.

**Exit Conditions:**
- The case file exists, the format test passes, and the first run result is recorded.
