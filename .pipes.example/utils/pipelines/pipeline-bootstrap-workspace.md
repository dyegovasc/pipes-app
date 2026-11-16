---
title: Bootstrap Workspace
description: Sets up a new Pipes workspace in order, from project identity and an optional delivery profile to policies, architecture, generated surfaces, and evals, keeping every gate of the pipelines it runs.
version: 1.3
domain: framework
category: definition
fragments:
  - fragment-check-existing-codebase-files
  - fragment-invoke-pipeline
  - fragment-validation
---
# Pipeline: Bootstrap Workspace

Bring a newly installed Pipes workspace from placeholders to a working setup. It runs the definition pipelines in a fixed order, because each step needs the one before it: the project identity, and the delivery profile when the user opts in, tell the policy survey which repositories to read, and the policies shape the architecture. Every step keeps its own gates; this pipeline adds order and a final check, not extra authority.

## Entry Points

Use right after Pipes is installed in a codebase or workspace, or when several project instructions are still placeholders. Do not use to change one surface that is already set up; run its own pipeline instead.

## Loop Use

`loop-framework-maintenance` uses this pipeline. Pass the workspace root. The pipeline returns the state of every project surface and the validation evidence. After a pause, re-run Assess and resume from the first step whose outputs are missing or placeholders; completed steps are skipped as current.

## Control Rules

- Run the steps in order; skip a step only when its outputs already exist and are current.
- Never merge the gates of different pipelines into one approval.
- Change no repository other than this workspace.
- The bootstrap is an agent-configuration change under gate G6 and ends with an eval run. The eval run is required when the delivery profile has an Evals table, and recommended when it has none.

## Output

- `project.md` and `rule-codebase-conventions.md`, and `delivery.md` and `accountability.md` when the user opts in
- Project policy rules with skills, and a note of conflicts and gaps
- `architecture.md`
- Generated instruction wrappers, skills, isolated agents, and hook settings
- Project eval cases, and a first eval run when the delivery profile has an Evals table

## Phases

### Phase 1: Assess

**Objective:** Find which project surfaces are missing, placeholders, or established.

**Acting Role:** `roadmapper`

**Entry Conditions:** Pipes is installed in the workspace.

**Inputs:**
- `.pipes/ai-instructions/`, `.pipes/utils/rules/`, and the workspace tree.

**Fragments:**
- `fragment-check-existing-codebase-files`

**Instructions:**
1. Use `fragment-check-existing-codebase-files` to classify `project.md`, `delivery.md`, `accountability.md`, `architecture.md`, `rule-codebase-conventions.md`, and project policy rules as missing, placeholder, or established.
2. Plan the steps that the classification requires, in order, and show the plan.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the step plan to Define Stack And Delivery.

**Outputs:**
- Surface classification and the step plan.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** None.

**Exit Conditions:**
- Every surface is classified.

### Phase 2: Define Stack And Delivery

**Objective:** Establish identity and conventions, and the delivery profile and accountability matrix when the user opts in.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 1 classified at least one of these surfaces as missing or placeholder, or the step is skipped as current.

**Inputs:**
- Step plan and workspace root.

**Fragments:**
- `fragment-invoke-pipeline`

**Instructions:**
1. Use `fragment-invoke-pipeline` to run `pipeline-define-codebase-stack`, with all its gates.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: `full-stack-tech-lead` passes the written identity, and the profile and accountability when written, to Define Policies.

**Outputs:**
- `project.md` and the conventions rule, and `delivery.md` and `accountability.md` when the user opts in.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The gates of `pipeline-define-codebase-stack`.

**Exit Conditions:**
- `project.md` and the conventions rule are established; an opted-in `delivery.md` validates.

### Phase 3: Define Policies

**Objective:** Derive project policy rules from the repositories.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 2 is complete or skipped as current.

**Inputs:**
- Layout from the delivery profile when it exists, otherwise `single-repo`.

**Fragments:**
- `fragment-invoke-pipeline`

**Instructions:**
1. Use `fragment-invoke-pipeline` to run `pipeline-define-policies`, with all its gates.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: `full-stack-tech-lead` passes the policies and the conflicts note to Define Architecture.

**Outputs:**
- Policy rules with skills and the conflicts note.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The gates of `pipeline-define-policies`.

**Exit Conditions:**
- Approved policies exist with skills, or the holder of gate G6 chose to defer them.

### Phase 4: Define Architecture

**Objective:** Describe the system, across repositories in a multi-repo layout.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phases 2 and 3 are complete or skipped as current.

**Inputs:**
- Delivery profile when it exists, repository survey, and policies.

**Fragments:**
- `fragment-invoke-pipeline`

**Instructions:**
1. Use `fragment-invoke-pipeline` to run `pipeline-define-system-architecture`, with all its gates.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: `full-stack-tech-lead` passes the architecture to Generate And Verify.

**Outputs:**
- `architecture.md`.

**Handoff To:** `e2e-tester`

**Approval Gate:** The gates of `pipeline-define-system-architecture`.

**Exit Conditions:**
- `architecture.md` is established.

### Phase 5: Generate And Verify

**Objective:** Generate every derived surface and prove the setup works.

**Acting Role:** `e2e-tester`

**Entry Conditions:** Phases 2 to 4 are complete or skipped as current.

**Inputs:**
- All project surfaces.

**Fragments:**
- `fragment-validation`

**Instructions:**
1. Run the generators: instruction wrappers, pipeline, loop, and policy skills, isolated agents, hook settings, catalog, and source map.
2. Refresh fork control with `generate-framework-provenance.cjs --root .pipes --refresh-fork`, because the bootstrap changes files that the framework baseline tracks, such as `project.md`, `architecture.md`, and the conventions rule. Without it, the install check reports a stale manifest.
3. Use `fragment-validation` to run the delivery-profile validator, the record validator, the pure-Markdown validator, the always-on budget check, and the script tests.
4. Propose project eval cases through `pipeline-add-eval` for the policies and, when it exists, the delivery profile. When `delivery.md` has an Evals table, run the eval suite once and report the result and cost. Without the table, offer the run with its cost estimate, and record that no eval ran when the user does not run it.

- Preserve acting-role context: `e2e-tester`.
- Preserve routing semantics: Return the surface state, validation, and eval results to the invoking loop or user.

**Outputs:**
- Generated surfaces, validation evidence, and the first eval run or the record that no eval ran.

**Handoff To:**

**Approval Gate:** Gate G6 before the bootstrap is accepted: the human reviews the validation results, and the eval results when an eval ran.

**Exit Conditions:**
- Every surface is established and generated, validation passes, and the eval result, or the record that no eval ran, is recorded.
