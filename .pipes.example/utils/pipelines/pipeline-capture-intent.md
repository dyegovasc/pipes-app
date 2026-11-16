---
title: Capture Intent
description: Turns an idea, ticket, or incident into one intent record that the product owner accepts or rejects before design starts.
version: 1.3
domain: project
category: record
fragments:
  - fragment-capture-intent-source
  - fragment-format-intent-record
  - fragment-request-approval
  - fragment-create-intent-file
---
# Pipeline: Capture Intent

Turn one problem into a concise intent record in `.pipes/project/01-intents/`. The intent is the first artifact of the delivery chain: intent, spec, mission, plan, and outcome. It is human readable and agent actionable.

This pipeline drafts and records the intent. It does not accept the intent, design a solution, or create a spec, mission, or plan.

## Entry Points

Use when a person describes a problem or idea, when an issue-tracker ticket, for example a Jira issue, needs to enter the delivery chain, or when an incident or monitoring finding needs a fix. Do not use for a change that already has an accepted intent, for exploratory research without a problem to solve, or for a framework maintenance task.

## Loop Use

`loop-concept-development` uses this pipeline to end concept work in an intent. `loop-investigation-and-recovery` uses it to turn a confirmed incident cause into a new intent. Pass the source, known problem and outcome, affected systems, constraints, evidence paths, and the invoking mission path when mission-bound. The pipeline returns a duplicate finding, an exact proposal awaiting approval, or a written intent path with its status. Acceptance by the product owner remains a separate human-mandatory decision. After a pause, inspect existing intents and the proposed target before resuming from the first incomplete phase.

## Control Rules

- One intent owns one problem and one proposed outcome. Split a request that mixes independent problems.
- Describe the problem, not a solution. Move solution ideas to open questions or constraints.
- Read the source before asking: an issue-tracker ticket through an available connector, for example Jira through an Atlassian connector, or incident evidence from its records.
- `accepted` and `rejected` mean the holder of gate G1 (core.md Gates) decided. File approval alone never accepts an intent.
- A new intent may name one it supersedes, but changing the older intent's status is a separate displayed and approved effect.
- An intent created during active mission execution must link its invoking mission reciprocally before creation completes.

## Output

- Duplicate finding with the existing intent path when no file should be created
- Exact `.pipes/project/01-intents/intent-{number}-{slug}.md` proposal
- Written intent path, status, and validation when approved

## Phases

### Phase 1: Capture

**Objective:** Capture one problem, its proposed outcome, the checks that show the outcome is reached, affected users and systems, constraints, open questions, and origin, and check that no existing intent already owns it.

**Acting Role:** `visionaire`

**Support Team:** `roadmapper`

**Entry Conditions:** A person, ticket, incident, or governed workflow names a problem worth solving.

**Inputs:**
- The idea, issue-tracker key, or incident reference and any supplied context.
- Existing intent records in `.pipes/project/01-intents/`.
- Project identity and repository groups from `.pipes/ai-instructions/project.md`.

**Fragments:**
- `fragment-capture-intent-source`

**Instructions:**
1. Read the source before asking. Read an issue-tracker ticket through an available connector and an incident through its evidence and outcome records.
2. Use `fragment-capture-intent-source` to capture the problem, proposed outcome, success checks, affected users and systems, constraints, open questions, origin, and author. Record a success check that the source cannot give as an open question instead of inventing it. Ask only for facts the source and repositories cannot provide.
3. Check affected systems against the components and repositories in project identity. List an unknown system as an open question.
4. Read existing intents. Return a duplicate finding with the owning path when an existing intent already covers the same problem, or identify an intent this one supersedes.
5. Split the request, or ask which problem this intent owns, when it combines independent problems.

- Preserve acting-role context: `visionaire`, with `roadmapper` checking overlap with existing intents.
- Preserve routing semantics: `visionaire` passes the captured intent to Format And Approve, or ends the pipeline with a duplicate finding.

**Outputs:**
- One captured problem with proposed outcome, success checks, affected users and systems, constraints, open questions, and origin.
- Duplicate or supersession finding against existing intents.

**Handoff To:** `roadmapper`

**Approval Gate:** None for capture. Ask the user only for a material fact the source cannot provide or to choose between independent problems.

**Exit Conditions:**
- The problem and proposed outcome are each one clear sentence or more.
- The pipeline has either stopped with a duplicate finding or has one distinct intent candidate.
- No intent record has been created or changed.

### Phase 2: Format And Approve

**Objective:** Produce one exact intent proposal and bind approval to its content, path, and listed effects, keeping acceptance as a separate product-owner decision.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`, `reviewer`

**Entry Conditions:** Phase 1 produced one distinct intent candidate.

**Inputs:**
- Captured intent and overlap findings.
- Intent area config, current filename inventory, and related records.

**Fragments:**
- `fragment-format-intent-record`
- `fragment-request-approval`

**Instructions:**
1. Choose the next available filename without reserving or writing it.
2. Use `fragment-format-intent-record` to build the complete preview with a frontmatter-only title and the Problem, Proposed Outcome, How Do We Know It Works, Affected Users And Systems, Constraints, Open Questions, and Source sections.
3. Keep `status: draft` unless the holder of gate G1 (core.md Gates) explicitly accepts or rejects the intent in this interaction.
4. Under `rule-separation-of-duties`, run a `reviewer` pass in a fresh context that did not author the intent, using the `reviewer` isolated agent where the agent tool supports one and a separate session otherwise: check the intent against its source and report findings with severity. Attach the review summary to the approval package.
5. Present the exact content, filename, status, review summary, invoking mission when mission-bound, both reciprocal relationship effects, and any separately proposed supersession effect.
6. Use `fragment-request-approval` once for the unchanged proposal. Ask the holder of gate G1 separately whether to accept the intent; rebuild and revalidate after any correction.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for area config, filename, and relationship validation, and `reviewer` for the non-author review.
- Preserve routing semantics: The approved unchanged proposal passes to Create; corrections return to the phase that owns them.

**Outputs:**
- Complete validated intent proposal and exact target path.
- File approval, and the product owner's accept, reject, or defer decision.

**Handoff To:** `roadmapper`

**Approval Gate:** Human-mandatory. Approval covers the displayed intent content, filename, and listed file effects. Acceptance or rejection is gate G1 and belongs to the holder of gate G1 (core.md Gates); without that decision the intent stays `draft`.

**Exit Conditions:**
- The proposal satisfies the area config and relationship contracts.
- File approval is exact and current, and the G1 decision is recorded as accepted, rejected, or deferred.

### Phase 3: Create

**Objective:** Write the approved intent, validate it, and report the next action.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 approved unchanged exact content, status, path, and listed file effects.

**Inputs:**
- Approved proposal, current intent inventory, area config, and approval scope.

**Fragments:**
- `fragment-create-intent-file`

**Instructions:**
1. Re-read the intent inventory and target; return to Phase 2 if the filename appeared or an overlapping intent was created after approval.
2. Use `fragment-create-intent-file` to write only the approved intent and, when mission-bound, apply and verify the approved reciprocal mission relationship.
3. Refuse to overwrite a different existing file or to change another intent's status, content, or relationships.
4. Re-read the record and validate frontmatter, status, sections, and related links.
5. Report the path, status, and next action: `pipeline-design-spec` for an accepted intent, or the open decision for a draft one.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for final config and link evidence.
- Preserve routing semantics: Return the path and evidence to the invoking loop or user; design starts only from an accepted intent.

**Outputs:**
- Written intent record with status and validation evidence.
- Next action and any separately proposed supersession edit.

**Handoff To:**

**Approval Gate:** No additional gate for the approved new file. Stop before a target conflict, material deviation, older-record change, or protected action.

**Exit Conditions:**
- The approved intent is readable at the exact target and validation passes.
- No duplicate, overwrite, silent acceptance, or unapproved follow-up occurred.
