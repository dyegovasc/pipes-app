---
title: Create Team Member
description: Defines a reusable Pipes role with clear ownership, boundaries, consultation, and handoffs.
version: 2.5
domain: team
category: creation
fragments:
  - fragment-source-tree-execution-context
  - fragment-ask-team-member-definition
  - fragment-assess-team-role-overlap
  - fragment-format-team-member-record
  - fragment-request-approval
  - fragment-create-team-member-file
---
# Pipeline: Create Team Member

Create a role definition for a recurring responsibility or perspective.

## Entry Points

Use when the user asks for a new team role. Extend or reuse an existing role when the requested responsibility does not justify a distinct owner.

## Loop Use

A framework-maintenance loop may invoke this pipeline after identifying a real ownership gap. Pass the execution context, purpose, responsibilities, non-responsibilities, consultation triggers, authority limits, and handoffs. The pipeline returns one approved role Markdown file in the exact installed or starter-maintenance target set. User approval is required before creation. Resume from the first incomplete phase after checking every applicable target.

## Control Rules

- Roles define perspective and responsibility, not autonomous agents.
- Authority may be narrowed but never invented.
- Avoid overlapping owners for the same responsibility.
- Keep the role reusable across missions and pipelines.
- Resolve `installed_project` or `starter_maintenance` before proposing targets.
- Installed projects write canonical `.pipes/` only; starter maintenance writes and validates the starter source tree first, then reconciles `.pipes/`.

## Output

- Installed-project mode: `.pipes/team/{role-id}.md`
- Starter-maintenance mode: `team/{role-id}.md` in the starter source tree followed by its equivalent `.pipes/team/{role-id}.md` mirror

## Phases

### Phase 1: Define The Role

**Objective:** Define a bounded recurring responsibility or perspective without inventing authority or implying an autonomous agent.

**Acting Role:** `roadmapper`

**Entry Conditions:** A user request or framework-maintenance finding identifies a recurring ownership or consultation need.

**Inputs:**
- Requested purpose, affected workflows, current team inventory, and known authority constraints.
- Project instructions, active mission scope, invocation context, and relevant role conventions.

**Fragments:**
- `fragment-source-tree-execution-context`
- `fragment-ask-team-member-definition`

**Instructions:**
1. Resolve `installed_project` or `starter_maintenance` from repository identity and invocation scope using `fragment-source-tree-execution-context`; stop when the context remains ambiguous.
2. Inspect every team directory and target relevant to the resolved context before asking for role details.
3. Use `fragment-ask-team-member-definition` to capture purpose, responsibilities, non-responsibilities, inputs, outputs, consultation, handoffs, gate recommendations, and escalation triggers.
4. Distinguish reusable role ownership from a one-off task, named person, background agent, or authority the framework does not possess.
5. Ask only when an undiscoverable ownership or authority choice changes the role boundary.
6. After a pause, re-read the request, context, and inventories before repeating questions.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes a bounded role brief to Check Overlap, or returns the supported redirect recommendation to the requester.

**Outputs:**
- Role brief with purpose, boundaries, interfaces, and authority limits.
- Resolved execution context, exact target model, and current target classifications.
- Redirect recommendation when a distinct reusable role is not justified.
- Explicit unknowns and approval needs.

**Handoff To:** `roadmapper`

**Approval Gate:** Ask only for a missing human-owned responsibility, authority, or ownership choice that cannot be discovered from current sources.

**Exit Conditions:**
- The proposed role's recurring purpose and non-responsibilities are explicit, or creation has stopped with a reuse or direct-assignment recommendation.
- No team file has changed.
- Execution context and applicable team inventories are unambiguous.

### Phase 2: Check Overlap

**Objective:** Determine whether the responsibility belongs in a new role, an existing role, or a clarified consultation relationship.

**Acting Role:** `roadmapper`

**Support Team:** `full-stack-tech-lead`

**Entry Conditions:** Phase 1 produced a reusable role brief or a remaining evidence question that team-source comparison can answer.

**Inputs:**
- Role brief and every current team role definition.
- Pipeline and loop ownership references affected by the proposed boundary.

**Fragments:**
- `fragment-assess-team-role-overlap`

**Instructions:**
1. Run `fragment-assess-team-role-overlap` against purpose, responsibilities, exclusions, consultation triggers, handoffs, and gate authority.
2. Identify duplicate ownership, conflicting authority, missing handoffs, and existing roles that can own or advise the work.
3. Recommend reuse or extension when it creates a clearer responsibility model.
4. Do not modify an existing role as part of new-role creation unless that exact update enters the approved proposal.
5. Present alternatives only when materially different viable boundaries remain.

- Preserve acting-role context: `roadmapper`, consulting `full-stack-tech-lead` when the role would own technical framework or cross-surface implementation work.
- Preserve routing semantics: `roadmapper` passes a distinct final role boundary to Format And Approve, or returns the supported reuse or extension recommendation.

**Outputs:**
- Overlap classification and evidence.
- Recommended new, reuse, extend, or stop path.
- Final proposed boundary and affected references when creation remains valid.

**Handoff To:** `roadmapper`

**Approval Gate:** The user decides only when two materially different viable ownership models remain after evidence-backed recommendation.

**Exit Conditions:**
- Duplicate and authority conflicts are resolved or explicitly gated.
- A distinct role boundary and target ID exist, or creation has stopped.

### Phase 3: Format And Approve

**Objective:** Produce and validate one complete reusable role file, then bind approval to its exact content and filename.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 established a distinct role boundary with no blocking ownership or authority conflict.

**Inputs:**
- Final role brief, overlap evidence, team-area conventions, exact role ID, execution context, and complete target set.
- Existing team files and references that must remain valid.

**Fragments:**
- `fragment-format-team-member-record`
- `fragment-request-approval`

**Instructions:**
1. Use `fragment-format-team-member-record` to draft the complete role with purpose, owns, does-not-own, loop interface, gate authority, handoff inputs and outputs, and escalation triggers.
2. Validate the role ID, frontmatter, authority limits, target availability, reuse boundary, and any affected references.
3. Present exact content, execution context, every target path in write order, direct writes, and effects excluded from approval.
4. Use `fragment-request-approval` once for the unchanged proposal and target.
5. Return requested responsibility or authority changes to the phase that owns them and rebuild the full preview.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for reference and target validation.
- Preserve routing semantics: The approved unchanged role passes to Create; corrections return to Define The Role or Check Overlap as appropriate.

**Outputs:**
- Complete validated team-member proposal, execution context, and exact ordered target set.
- Explicit creation approval or requested corrections.

**Handoff To:** `roadmapper`

**Approval Gate:** The user or declared human authority approves the exact role content, execution context, ordered target set, and file creation effects. Approval does not spawn an agent, change other roles, or authorize related pipeline and loop edits unless displayed explicitly.

**Exit Conditions:**
- Content, context, and every target satisfy team conventions and contain no invented authority.
- Approval is exact and current, or the pipeline is paused for corrections.

### Phase 4: Create

**Objective:** Write the approved role idempotently, validate it against current team contracts, and report factual closure without creating an agent.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 approved the unchanged role content and exact path.

**Inputs:**
- Approved role proposal, execution context, ordered target set, approval scope, and current team files.

**Fragments:**
- `fragment-create-team-member-file`

**Instructions:**
1. Re-read every applicable target and return to Phase 3 if its content, ownership, or approved context changed.
2. Use `fragment-create-team-member-file` to create or reuse only the approved content at the exact context-dependent targets.
3. In `installed_project`, write only `.pipes/team/{role-id}.md`; in `starter_maintenance`, write and validate `team/{role-id}.md` in the starter source tree first, then reconcile and validate `.pipes/team/{role-id}.md`.
4. Stop instead of overwriting a different existing or unmanaged role.
5. Re-read every role target and validate frontmatter, required sections, authority, handoffs, target path, content equivalence when paired, and referenced role ID.
6. Report created and reused paths, evidence, deviations, and any separately proposed reference updates without applying them automatically.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for final structural and reference evidence.
- Preserve routing semantics: Return the role path and evidence to the invoking loop or user; future use of the role remains governed by the workflow that assigns it.

**Outputs:**
- Written or reused role targets, execution context, write order, and config/reference validation evidence.
- Separately identified follow-up edits, if any.

**Handoff To:**

**Approval Gate:** No additional gate for the approved file. Stop before an overwrite, material content deviation, related-record edit, or protected action.

**Exit Conditions:**
- The approved role is readable at every exact context-dependent target and validation passes.
- No agent was spawned and no other role, pipeline, loop, or record was changed without explicit approval.
