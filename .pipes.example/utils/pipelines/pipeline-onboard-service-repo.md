---
title: Onboard Service Repository
description: Aligns one backend service repository's agent docs with the Pipes policies and decisions, as a reviewed proposal that ends in a dry-run record or a pull request.
version: 1.1
domain: codebase
category: delivery
fragments:
  - fragment-classify-service-guidance
  - fragment-format-service-agents-guide
  - fragment-format-service-claude-guide
  - fragment-format-service-review-guide
  - fragment-format-service-bands
  - fragment-validation
  - fragment-format-onboarding-record
  - fragment-request-approval
  - fragment-execution
---
# Pipeline: Onboard Service Repository

Bring one backend service repository's agent docs in line with the org policies and decisions in Pipes. Today many service docs repeat org rules that can drift, point to paths that no longer exist, or contradict accepted decisions. This pipeline classifies every statement, keeps what is specific to the service, and replaces the rest with pointers. The result is a tool-neutral `AGENTS.md`, a short `CLAUDE.md` that imports it, and a `REVIEW.md`.

A run is either a dry run, which ends with an onboarding record in `.pipes/project/07-artifacts/onboarding/` and changes nothing in the service repository, or a proposal, which opens a pull request that the repository's code owners decide.

## Entry Points

Use when a service repository has no agent docs, has docs that repeat or contradict the Pipes policies, or is new. Do not use to change service code, to resolve an open cross-repository policy conflict, which needs a decision record, or for this orchestration repository.

## Loop Use

`loop-framework-maintenance` uses this pipeline, one repository per run. Pass the repository and the mode: `dry-run` or `propose`. The pipeline returns the onboarding record and, in `propose` mode, the pull request link. After a pause, read the onboarding record and the repository's branches and pull requests before resuming from the first incomplete phase; never open a second pull request for the same onboarding.

## Control Rules

- Read the service repository only, until Phase 5 in `propose` mode.
- Nothing service-specific is lost: every removed statement names its Pipes rule, reason, or decision in the classification.
- Do not resolve an open cross-repository policy conflict that the project records in `.pipes/project/00-notes/`; keep the service's current statement and mark the conflict.
- In `dry-run` mode, write only the onboarding record and the reciprocal `related` links that `rule-artifact-record-contract` requires. Propose any other record change, such as adding the service to a recorded conflict, inside the onboarding record instead of editing that record.
- Propose `bands.yaml` only when the service has a monitoring source for its signals.
- In `propose` mode, the branch name follows the repository's convention and any accepted project decision on branch names; while the branch naming is an open conflict, stop and ask for the branch name.
- Commits and the pull request follow the project rules on attribution and link the onboarding record.

## Output

- Onboarding record with classification, proposed files, review, and mode
- In `propose` mode: a branch, a commit, and a pull request in the service repository

## Phases

### Phase 1: Assess

**Objective:** Classify every statement in the service's agent docs against the Pipes policies, conflicts, and decisions.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `be-architect`

**Entry Conditions:** A service repository and a mode are named.

**Inputs:**
- The service repository's docs, read-only.
- Pipes policy rules, the recorded cross-repository conflicts, and accepted decisions.

**Fragments:**
- `fragment-classify-service-guidance`

**Instructions:**
1. Use `fragment-classify-service-guidance` to build the classification table.
2. List the service facts that the drafts must keep.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `be-architect` for service design facts.
- Preserve routing semantics: `full-stack-tech-lead` passes the classification to Draft.

**Outputs:**
- Classification table with counts and the facts to keep.

**Handoff To:** `be-architect`

**Approval Gate:** None.

**Exit Conditions:**
- Every statement has a class, and every removal names its reference.

### Phase 2: Draft

**Objective:** Draft the replacement docs from the classification.

**Acting Role:** `be-architect`

**Entry Conditions:** Phase 1 produced the classification.

**Inputs:**
- Classification table, facts to keep, and the repository's monitoring sources, if any.

**Fragments:**
- `fragment-format-service-agents-guide`
- `fragment-format-service-claude-guide`
- `fragment-format-service-review-guide`
- `fragment-format-service-bands`

**Instructions:**
1. Draft `AGENTS.md` with every `service-specific` and `conflict` statement and one pointer for the org policies.
2. Draft `CLAUDE.md` as an import of `AGENTS.md` plus Claude Code specifics the repository already declares.
3. Draft `REVIEW.md` with the service rules that should block a merge.
4. Draft `bands.yaml` only when a monitoring source exists; otherwise list it under Not Included.

- Preserve acting-role context: `be-architect`.
- Preserve routing semantics: `be-architect` passes the drafts and classification to Review.

**Outputs:**
- Draft `AGENTS.md`, `CLAUDE.md`, `REVIEW.md`, and `bands.yaml` when applicable.

**Handoff To:** `reviewer`

**Approval Gate:** None.

**Exit Conditions:**
- Every kept statement appears in a draft.

### Phase 3: Review

**Objective:** Check as a non-author that the drafts lose nothing service-specific and remove nothing without a reference.

**Acting Role:** `reviewer`

**Entry Conditions:** Phase 2 produced the drafts.

**Inputs:**
- Original docs, classification table, and drafts.

**Fragments:**
- `fragment-validation`

**Instructions:**
1. Run as the `reviewer` isolated agent, or in a separate session.
2. Use `fragment-validation` to compare the original docs with the drafts: every `service-specific` and `conflict` statement is kept, every removal has a valid reference, and no draft states a rule that contradicts a Pipes policy or decision.
3. Report findings with severity and a verdict.

- Preserve acting-role context: `reviewer`.
- Preserve routing semantics: `reviewer` passes the verdict and findings to Record And Approve.

**Outputs:**
- Reviewer verdict and findings.

**Handoff To:** `roadmapper`

**Approval Gate:** None. Blocking findings return to Phase 2.

**Exit Conditions:**
- The verdict is not `not ready`, or the drafts were corrected and reviewed again.

### Phase 4: Record And Approve

**Objective:** Record the onboarding and obtain approval for the proposal, or end the dry run.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 produced a verdict that is not `not ready`.

**Inputs:**
- Classification, drafts, review, and mode.

**Fragments:**
- `fragment-format-onboarding-record`
- `fragment-request-approval`

**Instructions:**
1. Use `fragment-format-onboarding-record` to write the onboarding record and run the record validator.
2. In `dry-run` mode, present the record and stop. Nothing changes in the service repository.
3. In `propose` mode, use `fragment-request-approval` for the exact files, the branch name, and the pull request text.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for record validation.
- Preserve routing semantics: In `propose` mode, the approved package passes to Propose; a dry run ends here.

**Outputs:**
- Onboarding record and, in `propose` mode, the approval decision.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** Human-mandatory in `propose` mode: gate G6 for the agent-configuration change, decided by the user. None in `dry-run` mode.

**Exit Conditions:**
- The record exists and the validator passes; in `propose` mode the exact package is approved.

### Phase 5: Propose

**Objective:** Open one pull request with the approved files in the service repository.

**Acting Role:** `full-stack-tech-lead`

**Entry Conditions:** Phase 4 approved the exact package in `propose` mode.

**Inputs:**
- Approved files, branch name, and pull request text.

**Fragments:**
- `fragment-execution`

**Instructions:**
1. Create the approved branch from the default branch in the service repository, write the approved files, and commit under the project rules on attribution.
2. Push the branch and open the pull request with `gh pr create`; the hook asks before each step.
3. Add the pull request link to the onboarding record. Do not merge or approve; gate G4 belongs to the repository's code owners.

- Preserve acting-role context: `full-stack-tech-lead`.
- Preserve routing semantics: Return the pull request link and record path to the invoking loop or user.

**Outputs:**
- Pull request link and the updated onboarding record.

**Handoff To:**

**Approval Gate:** The hook asks before the commit, push, and pull request; stop before any other effect.

**Exit Conditions:**
- One pull request exists for the onboarding, and the record links it.
