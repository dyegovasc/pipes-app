---
title: Bootstrap Greenfield
description: Sets up a repository with no code from declared choices, marks each surface as declared with a revisit trigger, and leaves the workspace ready for its first intent and spec, keeping every gate.
version: 1.0
domain: framework
category: definition
fragments:
  - fragment-check-greenfield-repository
  - fragment-check-existing-codebase-files
  - fragment-ask-greenfield-choices
  - fragment-ask-gate-holders
  - fragment-format-accountability-matrix
  - fragment-invoke-pipeline
  - fragment-format-project-instruction
  - fragment-format-codebase-conventions-rule
  - fragment-draft-architecture-instruction
  - fragment-format-architecture-instruction
  - fragment-format-policy-rule
  - fragment-format-declared-surface
  - fragment-request-approval
  - fragment-create-files
  - fragment-validation
---
# Pipeline: Bootstrap Greenfield

Set up a Pipes workspace in a repository that has no code yet. The evidence-first definition pipelines have nothing to read in such a repository, so this pipeline asks the user for each choice, records the stack choice as a decision, and writes each surface as declared with a trigger to revisit it. Every step keeps its own gates; this pipeline adds order, the declared marking, and a final check, not extra authority.

## Entry Points

Use when a user asks to bootstrap a new project or a repository with no code, or accepts the offer from `pipeline-bootstrap-workspace`. Do not use for a repository with code; use `pipeline-bootstrap-workspace`. Do not use to change one surface that is already set up; run its own pipeline instead.

## Loop Use

`loop-framework-maintenance` uses this pipeline. Pass the workspace root. The pipeline returns the state of every project surface and the validation evidence. After a pause, re-run Phase 1 and resume from the first phase whose outputs are missing or placeholders; completed phases are skipped as current.

## Control Rules

- Write no file before the user confirms in Phase 1 that the repository is greenfield.
- Stop before any write when the repository is not greenfield, and name `pipeline-bootstrap-workspace` as the workflow to use.
- Never present a declared choice as detected, observed, or current.
- Keep every gate of the pipelines this pipeline runs; never merge the gates of different pipelines into one approval.
- Only policies may be deferred, and only by the policy owner (the holder of gate G6 for policy rules).
- Change no repository other than this workspace.

## Output

- A stack decision record linked from `project.md`
- `project.md`, `architecture.md`, and `rule-codebase-conventions.md`, each declared with a revisit trigger
- Declared policy rules with skills, or one recorded policy deferral
- `accountability.md` when the user opts in
- Generated instruction wrappers, skills, isolated agents, and hook settings, and the validation evidence

## Phases

### Phase 1: Confirm Greenfield

**Objective:** Decide whether the repository has no code and get the user's confirmation before any write.

**Acting Role:** `roadmapper`

**Entry Conditions:** Pipes is installed in the workspace, and the user asked for a greenfield bootstrap or accepted the offer from `pipeline-bootstrap-workspace`.

**Inputs:**
- Workspace root and `.pipes/ai-instructions/`.

**Fragments:**
- `fragment-check-greenfield-repository`
- `fragment-check-existing-codebase-files`

**Instructions:**
1. Use `fragment-check-greenfield-repository` on the workspace root.
2. When `greenfield` is false, report the deciding files and the user action, name `pipeline-bootstrap-workspace` as the workflow to use, and stop.
3. When `greenfield` is true, use `fragment-check-existing-codebase-files` to classify `project.md`, `architecture.md`, `rule-codebase-conventions.md`, `accountability.md`, and project policy rules as missing, placeholder, or established.
4. Show the classified file list and the surface classification, and ask the user to confirm that the repository is greenfield.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the confirmed greenfield result and the surface classification to Declare Choices.

**Outputs:**
- Greenfield result with the deciding files, the surface classification, and the user's confirmation.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user confirms that the repository is greenfield. Without the confirmation, nothing is written.

**Exit Conditions:**
- The repository is greenfield and the user confirmed it, or the pipeline stopped with the pointer to `pipeline-bootstrap-workspace`.

### Phase 2: Declare Choices

**Objective:** Capture each setup choice as a declared choice with a revisit trigger.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `be-architect`

**Entry Conditions:** Phase 1 ended with a confirmed greenfield result.

**Inputs:**
- Surface classification and the user's statements.

**Fragments:**
- `fragment-ask-greenfield-choices`
- `fragment-ask-gate-holders`
- `fragment-format-accountability-matrix`

**Instructions:**
1. Use `fragment-ask-greenfield-choices` to capture the stack, conventions, architecture direction, and policies, one question per surface, with a revisit trigger for each.
2. Offer the optional accountability matrix. When the user opts in, use `fragment-ask-gate-holders` and format it with `fragment-format-accountability-matrix`.
3. Do not offer the delivery profile; `pipeline-define-codebase-stack` owns it.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `be-architect` for the architecture direction.
- Preserve routing semantics: `full-stack-tech-lead` passes the declared choices to Record Stack Decision.

**Outputs:**
- Declared choices, revisit triggers, statement sources, open choices, and the accountability matrix draft when the user opts in.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user states or accepts each choice. A choice that stays open blocks the surface that needs it.

**Exit Conditions:**
- Project identity and stack, conventions, and architecture each have a declared choice, and the policies are declared or the policy owner deferred them.

### Phase 3: Record Stack Decision

**Objective:** Record the stack choice as a decision record that the declared surfaces cite.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 2 captured the declared stack.

**Inputs:**
- Declared identity, stack, and statement sources.

**Fragments:**
- `fragment-invoke-pipeline`

**Instructions:**
1. Use `fragment-invoke-pipeline` to run `pipeline-record-decision` for the stack choice, with all its gates.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: `full-stack-tech-lead` passes the decision record path to Write Declared Surfaces.

**Outputs:**
- The stack decision record path.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The gates of `pipeline-record-decision`.

**Exit Conditions:**
- The stack decision record exists and is readable.

### Phase 4: Write Declared Surfaces

**Objective:** Draft, mark, review, approve, and write every declared surface.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `reviewer`

**Entry Conditions:** Phase 3 recorded the stack decision.

**Inputs:**
- Declared choices, revisit triggers, the decision record path, and the surface classification.

**Fragments:**
- `fragment-format-project-instruction`
- `fragment-format-codebase-conventions-rule`
- `fragment-draft-architecture-instruction`
- `fragment-format-architecture-instruction`
- `fragment-format-policy-rule`
- `fragment-format-declared-surface`
- `fragment-request-approval`
- `fragment-create-files`

**Instructions:**
1. Draft `project.md` with `fragment-format-project-instruction`, the conventions rule with `fragment-format-codebase-conventions-rule`, `architecture.md` with `fragment-draft-architecture-instruction` and `fragment-format-architecture-instruction`, and each declared policy with `fragment-format-policy-rule`.
2. Apply `fragment-format-declared-surface` to each draft, and add the stack decision link and the `## Declared Setup` table to `project.md`. Do not apply the declared marking to the accountability matrix.
3. Run one `reviewer` pass over all proposals together, in a fresh context that did not author them, using the `reviewer` isolated agent where the agent tool supports one and a separate session otherwise. The reviewer checks that no declared choice is stated as detected, that each surface cites its decision or statement, and that only policies are deferred.
4. Use `fragment-request-approval` to present the exact proposals, the accountability matrix draft when the user opted in, the target paths, and the review verdict. The holder of gate G6 decides the agent configuration, and the policy owner decides the policy rules or their deferral.
5. Use `fragment-create-files` to write only the approved proposals, and re-read each file.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `reviewer` for the non-author review.
- Preserve routing semantics: `full-stack-tech-lead` passes the written surfaces to Generate And Verify.

**Outputs:**
- Declared `project.md`, `architecture.md`, conventions rule, and policy rules or the policy deferral, `accountability.md` when approved, and the review verdict.

**Handoff To:** `e2e-tester`

**Approval Gate:** Human-mandatory gate G6: the holder of gate G6 approves the agent configuration, and the policy owner approves the policy rules or their deferral, after the reviewer pass.

**Exit Conditions:**
- Every approved surface is written, declared, and readable.

### Phase 5: Generate And Verify

**Objective:** Generate every derived surface and prove the setup works.

**Acting Role:** `e2e-tester`

**Entry Conditions:** Phase 4 wrote the declared surfaces.

**Inputs:**
- All project surfaces.

**Fragments:**
- `fragment-validation`

**Instructions:**
1. Run the generators: instruction wrappers, pipeline, loop, and policy skills, isolated agents, hook settings, catalog, and source map.
2. Refresh fork control with `generate-framework-provenance.cjs --root .pipes --refresh-fork`, because the bootstrap changes files that the framework baseline tracks.
3. Use `fragment-validation` to run the delivery-profile validator, the record validator, the pure-Markdown validator, the always-on budget check, and the script tests.
4. Check that no surface has a placeholder title or `starter_status: project_placeholder`.
5. Offer project eval cases through `pipeline-add-eval` and an eval run with its cost estimate, and record that no eval ran when the user does not run it.

- Preserve acting-role context: `e2e-tester`.
- Preserve routing semantics: Return the surface state, validation, and eval results to the invoking loop or user.

**Outputs:**
- Generated surfaces, validation evidence, and the eval result or the record that no eval ran.

**Handoff To:**

**Approval Gate:** Gate G6 before the bootstrap is accepted: the holder reviews the validation results, and the eval results when an eval ran.

**Exit Conditions:**
- Every surface is declared and generated, validation passes, and no surface is a placeholder.
