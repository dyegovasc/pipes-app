---
title: Define Policies
description: Derives project policy rules from the rules the repositories already state, keeps conflicts and gaps out as recorded open points, and delivers each policy as a skill.
version: 1.0
domain: codebase
category: definition
fragments:
  - fragment-survey-workspace-repositories
  - fragment-extract-policy-candidates
  - fragment-format-policy-rule
  - fragment-validation
  - fragment-request-approval
  - fragment-create-files
---
# Pipeline: Define Policies

Turn the rules that a project's repositories already state into project policy rules in `.pipes/utils/rules/`. Each policy holds only rules that the evidence states consistently, cites its sources, and is delivered to agents as a `pipes.policy-*` skill. Conflicts between repositories and gaps stay out of the policies and are recorded in a note, so each one can become a decision instead of a silent choice.

## Entry Points

Use during workspace bootstrap, when the project has no policy rules yet, or when repository docs have changed enough that the policies may be stale. Do not use to decide a conflict, which needs `pipeline-record-decision`, or to write rules that no repository states without an explicit decision by the policy owner.

## Loop Use

`loop-framework-maintenance` and `pipeline-bootstrap-workspace` use this pipeline. Pass the layout from `delivery.md` and any topics the user wants covered. The pipeline returns written policy rules, their generated skills, and a note with conflicts and gaps. After a pause, read the existing policy rules and the note before resuming from the first incomplete phase; update an existing policy instead of creating a duplicate.

## Control Rules

- Policy rules contain only `consistent` rules with source paths; never resolve a conflict while writing a policy.
- Policy rules are project content (`scope: project`); they never become framework rules.
- Read repositories only; change no repository in this pipeline.
- Every policy is an agent-configuration change under gate G6; the policy owner in `.pipes/ai-instructions/accountability.md` decides.
- Keep the always-on budget in view: each policy adds one row to the rules table.

## Output

- `.pipes/utils/rules/rule-{slug}.md` for each approved policy, with `skill: true`
- Generated `pipes.policy-*` skills
- A note in `.pipes/project/00-notes/` with conflicts, gaps, and repositories without docs

## Phases

### Phase 1: Survey

**Objective:** Read every repository's agent and architecture docs and collect the rules they state.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `be-architect`

**Entry Conditions:** The layout in `delivery.md` is known, or the project is a single repository.

**Inputs:**
- Delivery profile layout, existing policy rules, and user topics.

**Fragments:**
- `fragment-survey-workspace-repositories`
- `fragment-extract-policy-candidates`

**Instructions:**
1. Use `fragment-survey-workspace-repositories` to list the repositories and read their docs read-only.
2. Use `fragment-extract-policy-candidates` to group stated rules into consistent policy candidates, conflicts, gaps, and repository-specific rules, with sources.
3. Compare the candidates with existing policy rules and mark each as new, changed, or unchanged.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `be-architect` for technical meaning.
- Preserve routing semantics: `full-stack-tech-lead` passes the candidates, conflicts, and gaps to Draft.

**Outputs:**
- Policy candidates by topic with sources, conflicts, gaps, and repository-specific rules.

**Handoff To:** `be-architect`

**Approval Gate:** None. Ask the user only which topics to cover when the evidence supports more policies than are useful.

**Exit Conditions:**
- Every candidate rule has a source path, and every conflict has both positions.

### Phase 2: Draft

**Objective:** Draft one policy rule per topic and the note of conflicts and gaps.

**Acting Role:** `be-architect`

**Entry Conditions:** Phase 1 produced the candidates.

**Inputs:**
- Candidates, conflicts, gaps, and existing policy rules.

**Fragments:**
- `fragment-format-policy-rule`

**Instructions:**
1. Use `fragment-format-policy-rule` to draft each policy with consistent rules only, a trigger-style `skill_description`, `enforced_by`, and a Sources section.
2. Draft the note with conflicts, gaps, repositories without docs, and broken pointers, numbering each conflict so later decisions can name it.
3. For an existing policy, draft the change as an update with a version increment.

- Preserve acting-role context: `be-architect`.
- Preserve routing semantics: `be-architect` passes the drafts to Review And Approve.

**Outputs:**
- Draft policy rules and the draft note.

**Handoff To:** `roadmapper`

**Approval Gate:** None.

**Exit Conditions:**
- Every draft rule check traces to a source, and no conflict appears inside a policy.

### Phase 3: Review And Approve

**Objective:** Check the drafts as a non-author and obtain the policy owner's approval.

**Acting Role:** `roadmapper`

**Support Team:** `reviewer`

**Entry Conditions:** Phase 2 produced the drafts.

**Inputs:**
- Draft policies, draft note, and the source docs.

**Fragments:**
- `fragment-validation`
- `fragment-request-approval`

**Instructions:**
1. Run a `reviewer` pass, through the isolated agent where supported, that checks each policy check against its sources and finds checks that misstate, overreach, or include a conflict.
2. Use `fragment-validation` to confirm each rule's frontmatter is complete and the rules table stays within the always-on budget.
3. Use `fragment-request-approval` once for the exact policies, the note, and their targets.

- Preserve acting-role context: `roadmapper`, consulting `reviewer` for the non-author check.
- Preserve routing semantics: The approved unchanged package passes to Write And Generate; corrections return to Draft.

**Outputs:**
- Review findings and the policy owner's decision.

**Handoff To:** `roadmapper`

**Approval Gate:** Human-mandatory gate G6: the policy owner approves the exact policies and note.

**Exit Conditions:**
- The approved package is exact and current.

### Phase 4: Write And Generate

**Objective:** Write the approved policies and note and generate their skills.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 approved the exact package.

**Inputs:**
- Approved policies, note, and targets.

**Fragments:**
- `fragment-create-files`

**Instructions:**
1. Use `fragment-create-files` to write the approved policies and note.
2. Run `assemble-rule-skills.cjs`, `assemble-instructions.cjs`, and `assemble-hooks.cjs --check`, then the record validator and the script tests.
3. Report the written paths, generated skills, budget, and validation evidence.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for validation.
- Preserve routing semantics: Return the policies, skills, and note to the invoking loop or user.

**Outputs:**
- Written policies, generated skills, the note, and validation evidence.

**Handoff To:**

**Approval Gate:** No additional gate for the approved writes. Stop before a change to any repository.

**Exit Conditions:**
- Every approved policy exists with a generated skill, and validation passes.
