---
title: Review Change
description: Reviews one pull request or branch against its plan, spec, and project policies with a verifier and a non-author reviewer, and hands a recommendation to the code owner.
version: 1.1
domain: codebase
category: delivery
fragments:
  - fragment-isolate-review-worktree
  - fragment-validation
  - fragment-assess-blast-radius
  - fragment-tally-review-findings
  - fragment-format-review-record
  - fragment-request-approval
---
# Pipeline: Review Change

Review one change in a code repository before the holder of gate G4 decides on it. The review layers are the pull request checks the repository already runs, a verifier that proves the acceptance criteria, and a non-author reviewer that checks the diff against its plan, spec requirements, and project policies. The result is a recorded recommendation with a severity tally.

This pipeline never approves, merges, requests changes, or edits the change. Gate G4 belongs to its holder (core.md Gates; the user unless `.pipes/ai-instructions/accountability.md` names another holder, for example from `.github/CODEOWNERS`).

## Entry Points

Use when a pull request or branch in a code repository is ready for review, or when `loop-feature-delivery` reaches review after Validate. Do not use for changes to the `.pipes/` framework layer, which `loop-framework-maintenance` and the eval suite cover.

## Loop Use

`loop-feature-delivery` uses this pipeline after its Validate phase. Pass the repository, pull request or branch, and the plan path when known. The pipeline returns a review record path, the verdict, and the tally, and optionally a posted comment when the user approves it. After a pause, check whether the worktree and review record already exist before resuming from the first incomplete phase.

## Control Rules

- Review in a temporary worktree; never change the developer's checkout or the pull request branch.
- The `e2e-tester` and `reviewer` roles run as isolated agents where the agent tool supports them, otherwise in separate sessions, so the author of the change never reviews it.
- Every finding has a verified file and line or a verified command result.
- Do not repeat what the pull request checks already enforce, unless a check failed.
- Write the record and any comment in the project's documentation language.
- Posting a comment or review on the pull request is external publishing and needs explicit approval; the hook asks for it.

## Output

- `.pipes/project/07-artifacts/reviews/artifact-{number}-review-{repo}-{change}.md` with verdict and tally
- Reciprocal link between the review record and the plan
- Optional posted comment, only after approval

## Phases

### Phase 1: Isolate

**Objective:** Check out the change in a temporary worktree and find its plan, spec, intent, and pull request checks.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** A repository and a pull request number or branch are named.

**Inputs:**
- Repository, pull request or branch, and the plan path when known.

**Fragments:**
- `fragment-isolate-review-worktree`

**Instructions:**
1. Use `fragment-isolate-review-worktree` to fetch the change into a temporary worktree and collect the changed files, upstream records, and pull request checks.
2. Record a missing plan or spec as a finding and continue.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: `full-stack-tech-lead` passes the worktree, upstream records, and checks to Verify.

**Outputs:**
- Worktree path, changed files, upstream record paths, and pull request checks.

**Handoff To:** `e2e-tester`

**Approval Gate:** None. Stop when the repository or change cannot be resolved.

**Exit Conditions:**
- The worktree contains the head of the change and the upstream records are known or recorded as missing.

### Phase 2: Verify

**Objective:** Prove or disprove each acceptance criterion and spec requirement with real commands, without fixing anything.

**Acting Role:** `e2e-tester`

**Entry Conditions:** Phase 1 produced a worktree and the upstream records.

**Inputs:**
- Worktree, plan acceptance criteria, spec requirement IDs, and the project's working commands.

**Fragments:**
- `fragment-validation`

**Instructions:**
1. Run as the `e2e-tester` isolated agent in verifier mode, or in a separate session.
2. Use `fragment-validation` to run the build and verify commands from project identity, or from `.pipes/ai-instructions/delivery.md` when it exists, and the plan's proof commands in the worktree.
3. Mark each acceptance criterion and requirement as proved, failed, or not proved, with the command and result.

- Preserve acting-role context: `e2e-tester` in verifier mode.
- Preserve routing semantics: `e2e-tester` passes the verification table to Review.

**Outputs:**
- Verification table with commands, results, and evidence.

**Handoff To:** `reviewer`

**Approval Gate:** None.

**Exit Conditions:**
- Every acceptance criterion and requirement has a result.

### Phase 3: Review

**Objective:** Check the diff against the plan, spec requirements, project policies, the repository's review guide when present, and its blast radius, as a non-author.

**Acting Role:** `reviewer`

**Entry Conditions:** Phase 2 produced the verification table.

**Inputs:**
- Diff in the worktree, plan, spec, verification table, the repository's `REVIEW.md` when present, and the applicable `pipes.policy-*` rules.

**Fragments:**
- `fragment-assess-blast-radius`

**Instructions:**
1. Run as the `reviewer` isolated agent, or in a separate session that did not author the change.
2. Check each changed file against the plan steps and the spec requirement IDs it claims, and against the project policy rules that apply.
3. Use `fragment-assess-blast-radius` to check consumers of changed contracts, data migrations, and security-relevant paths.
4. Apply the repository's `REVIEW.md` when present. Report each finding with severity, file and line, rule or requirement, and correction.

- Preserve acting-role context: `reviewer`.
- Preserve routing semantics: `reviewer` passes findings to Tally And Record.

**Outputs:**
- Reviewer findings with verified locations and corrections.

**Handoff To:** `roadmapper`

**Approval Gate:** None.

**Exit Conditions:**
- Every changed file was reviewed or listed as not reviewed with a reason.

### Phase 4: Tally And Record

**Objective:** Combine the findings into one verdict and record the review.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phases 2 and 3 produced verification results and findings.

**Inputs:**
- Verification table, reviewer findings, pull request checks, and the plan path.

**Fragments:**
- `fragment-tally-review-findings`
- `fragment-format-review-record`

**Instructions:**
1. Use `fragment-tally-review-findings` to produce the tally and verdict.
2. Use `fragment-format-review-record` to write the review record and link it reciprocally with the plan. Writing the record is part of this pipeline's approved scope; it changes nothing in the reviewed repository.
3. Run `node .pipes/utils/scripts/validate-project-records.cjs` and resolve record findings.
4. Remove the temporary worktree and local ref.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for record validation.
- Preserve routing semantics: `roadmapper` passes the record path and verdict to Hand Off.

**Outputs:**
- Review record with verdict and tally, linked to the plan.

**Handoff To:** `roadmapper`

**Approval Gate:** None for the record. Stop before any write outside `.pipes/project/`.

**Exit Conditions:**
- The record exists, the validator passes, and the worktree is removed.

### Phase 5: Hand Off

**Objective:** Give the recommendation to the developer and the holder of gate G4, and post it only with approval.

**Acting Role:** `roadmapper`

**Entry Conditions:** Phase 4 recorded the review.

**Inputs:**
- Review record, verdict, tally, and the pull request.

**Fragments:**
- `fragment-request-approval`

**Instructions:**
1. Present the verdict, tally, and blocking findings, and state that the holder of gate G4 decides it.
2. When the user wants the review on the pull request, use `fragment-request-approval` for the exact comment text, then post it with the forge command, for example `gh pr comment`; the hook asks again before it runs.
3. Never approve, merge, or request changes on the pull request.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: Return the record path and verdict to the invoking loop or user.

**Outputs:**
- Delivered recommendation and, when approved, the posted comment link.

**Handoff To:**

**Approval Gate:** Human-mandatory for posting. Gate G4 itself belongs to its holder and is never decided here.

**Exit Conditions:**
- The developer has the recommendation; any posted comment was approved.
