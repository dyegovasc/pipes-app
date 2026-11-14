---
title: Record Decision
description: Captures an approved durable choice with context, alternatives, and consequences.
version: 2.4
domain: project
category: record
fragments:
  - fragment-capture-decision-candidate
  - fragment-assess-decision-durability
  - fragment-format-decision-record
  - fragment-request-approval
  - fragment-create-decision-file
---
# Pipeline: Record Decision

Turn one lasting authorized choice into a concise decision record, or return an evidence-backed skip when no new durable record is warranted.

## Entry Points

Use when the user asks to record a decision or current work surfaces a choice that should constrain future work. Do not record temporary tactics, obvious implementation details, unresolved debate presented as accepted, or a duplicate of an existing decision.

## Loop Use

Any loop may invoke this pipeline with the candidate choice, context, authority, evidence, alternatives, consequences, affected paths, known related decisions, and invoking mission path when mission-bound. It returns a skip/duplicate finding, an exact proposal awaiting approval, or a written decision path with validation. Choice authority, record status, exact creation, reciprocal mission relationship, and any change to an older decision remain separate and explicit. After a pause, inspect current decision records, invoking mission, and proposed target before resuming from the first incomplete phase.

## Control Rules

- One record owns one durable choice and states it directly under `## Decision`.
- `accepted` means the proper authority made the choice; file approval alone cannot manufacture that authority.
- Default unresolved or not-yet-accepted choices to `proposed` when recording is still useful and authorized.
- Return a skip for temporary or low-value tactics and a duplicate finding for an already owned choice.
- A new record may identify a record it supersedes, but changing the older record's status or content is a separate displayed and approved effect.
- Preserve viable alternatives, material consequences, and readable related paths.
- A decision created during active mission execution must directly and reciprocally link its invoking mission before creation completes; include both effects in the approval package and verify any expected Pipes Local synchronization.

## Output

- Skip or duplicate finding with existing path when no file should be created
- Exact `.pipes/project/05-decisions/decision-{number}-{slug}.md` proposal
- Written decision path plus config and link validation when approved

## Phases

### Phase 1: Capture The Candidate

**Objective:** Define one candidate choice, its authority, durable effect, and minimum context without assuming it has already been accepted.

**Acting Role:** `roadmapper`

**Entry Conditions:** A user request or governed workflow identifies a choice that may constrain future missions, plans, architecture, or implementation.

**Inputs:**
- Candidate statement, context, evidence, affected surfaces, and related paths.
- Known decision authority, intended status, alternatives, and consequences.

**Fragments:**
- `fragment-capture-decision-candidate`

**Instructions:**
1. Inspect the request and current workflow evidence before asking for fields already known.
2. Use `fragment-capture-decision-candidate` to capture one direct statement, why it matters, affected surfaces, alternatives, intended status, possible supersession, and follow-up effects.
3. Identify who owns the choice and whether that authority already made it.
4. Separate acceptance of the choice from approval to format or create a file.
5. If multiple independent choices are mixed together, split the candidates or ask which single choice this record should own.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the bounded candidate and authority evidence to Assess Durability.

**Outputs:**
- One bounded decision candidate with context, authority, status, and effects.
- Known alternatives, related paths, supersession claim, and remaining unknowns.

**Handoff To:** `roadmapper`

**Approval Gate:** The proper decision authority must make or confirm the choice before it can be recorded as `accepted`. Otherwise continue only with an authorized `proposed` candidate or stop for the unresolved choice.

**Exit Conditions:**
- The candidate is one clear sentence and its future constraint is understandable.
- Intended status and authority evidence agree, or the unresolved authority gate is explicit.
- No decision record has been created or changed.

### Phase 2: Assess Durability

**Objective:** Determine whether the candidate deserves a new record, duplicates an existing choice, or requires an explicit supersession relationship.

**Acting Role:** `roadmapper`

**Entry Conditions:** Phase 1 produced a bounded candidate with a valid proposed or accepted authority state.

**Inputs:**
- Candidate, authority evidence, alternatives, consequences, and related paths.
- Decision-area config and every relevant existing decision record.

**Fragments:**
- `fragment-assess-decision-durability`

**Instructions:**
1. Read `.pipes/project/05-decisions/config.md` and current decision records.
2. Use `fragment-assess-decision-durability` to classify the candidate as `record`, `do_not_record`, `duplicate`, or `supersedes_existing`.
3. Return `do_not_record` for temporary or implementation-local tactics and explain where, if anywhere, the information belongs instead.
4. Return `duplicate` with the owning decision path instead of creating another file for the same choice.
5. For `supersedes_existing`, distinguish the new record and relationship from any proposed update to the older record; do not include that older edit implicitly.
6. Validate recommended status against the authority established in Phase 1.

- Preserve acting-role context: `roadmapper`, consulting the domain owner only for evidence about the decision's lasting technical or product effect.
- Preserve routing semantics: A distinct recordable candidate passes to Format And Approve. A skip or duplicate returns its finding to the invoking loop or user and ends the pipeline without a write.

**Outputs:**
- Record, skip, duplicate, or supersession classification with evidence.
- Recommended status, owning or superseded paths, consequences, and alternatives.
- Exact effects that would require separate approval.

**Handoff To:** `roadmapper`

**Approval Gate:** None for an evidence-backed skip or duplicate. Return to Phase 1 when durability analysis exposes missing choice authority or combines materially different decisions.

**Exit Conditions:**
- Recordability, overlap, and supersession are resolved against current records.
- The pipeline has either stopped without a write or has one distinct candidate with a valid recommended status.

### Phase 3: Format And Approve

**Objective:** Produce one schema-valid exact decision proposal and bind approval to its content, status, path, and listed effects.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 recommends a distinct record and supplies authority, status, alternatives, consequences, and related paths.

**Inputs:**
- Recordable candidate and durability evidence.
- Decision-area config, current filename inventory, and existing related records.

**Fragments:**
- `fragment-format-decision-record`
- `fragment-request-approval`

**Instructions:**
1. Choose the next available filename without reserving or writing it.
2. Use `fragment-format-decision-record` to create the complete preview with a frontmatter-only title and Context, Decision, Alternatives Considered, and Consequences sections.
3. Keep status `proposed` unless the proper authority explicitly made the choice and approves `accepted` or another config-valid status.
4. Validate allowed frontmatter fields, date, links, direct decision statement, alternatives, consequences, and any supersession relationship.
5. Present exact content, filename, choice authority, status, direct write, invoking mission when mission-bound, both reciprocal relationship effects, and every separately included or excluded related-record effect.
6. Use `fragment-request-approval` once for the unchanged proposal; rebuild and revalidate after any content, status, path, or effect correction.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for area-config, filename, and relationship validation.
- Preserve routing semantics: The approved unchanged proposal passes to Create; corrections return to the phase that owns them.

**Outputs:**
- Complete validated decision proposal and exact target path.
- Explicit content/status/write approval or requested corrections.

**Handoff To:** `roadmapper`

**Approval Gate:** Human approval covers the displayed decision content, valid status, filename, and listed file effects. Acceptance of the choice must also be owned by proper authority; creation approval never silently updates an older decision or authorizes follow-up implementation.

**Exit Conditions:**
- The proposal satisfies area config, authority, durability, and link contracts.
- Approval is exact and current, or the pipeline is paused for corrections.

### Phase 4: Create

**Objective:** Write the approved decision idempotently, validate the durable record, and report any unapproved supersession follow-up separately.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 approved unchanged exact content, status, path, and listed file effects.

**Inputs:**
- Approved proposal, current decision inventory, area config, and approval scope.

**Fragments:**
- `fragment-create-decision-file`

**Instructions:**
1. Re-read the decision inventory and target; return to Phase 3 if the filename appeared or relevant ownership changed after approval.
2. Use `fragment-create-decision-file` to write only the approved new record and, when mission-bound, apply or verify the approved reciprocal invoking-mission relationship before reporting creation complete.
3. Refuse to overwrite a different existing file or silently alter another decision's status, content, or relationships.
4. Re-read the record and validate frontmatter, status, sections, direct choice, alternatives, consequences, and related links.
5. Report the written path, validation, deviations, and any separately proposed supersession edit without applying it automatically.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for final config and link evidence.
- Preserve routing semantics: Return the path and evidence to the invoking loop or user; any implementation consequence requires its own governed work.

**Outputs:**
- Written decision record and config/link validation evidence.
- Separately proposed older-record or follow-up effects, if any.

**Handoff To:**

**Approval Gate:** No additional gate for the approved new file. Stop before a target conflict, material deviation, older-record change, or protected action.

**Exit Conditions:**
- The approved record is readable at the exact target and validation passes.
- No duplicate, overwrite, silent supersession, or unapproved follow-up occurred.
