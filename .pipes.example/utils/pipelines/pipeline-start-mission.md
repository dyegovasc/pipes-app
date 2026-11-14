---
title: Start Mission
description: Frames and records a compact draft mission without starting its execution.
version: "2.11"
domain: project
category: orchestration
fragments:
  - fragment-ask-mission-definition
  - fragment-select-loop
  - fragment-decompose-mission-scope
  - fragment-ask-delivery-approach
  - fragment-assess-mission-readiness
  - fragment-format-mission-record
  - fragment-request-approval
  - fragment-create-mission-file
  - fragment-mission-journal-contract
---
# Pipeline: Start Mission

Create a small, readable draft mission record and stop. Mission creation and mission execution are separate approval boundaries.

## Entry Points

Use when the user asks to start a mission or when adaptive work needs durable continuity. For clear low-risk work, act directly instead of creating a mission.

## Loop Use

An active loop may use this pipeline only to record a distinct draft mission already within approved scope. Pass the objective, scope, constraints, evidence expectation, related paths, and reason a separate mission is useful. The pipeline returns one draft mission file and its selected loop for future use. Mission creation has one user approval and never authorizes the new mission's execution. Resume by checking whether the approved mission file already exists before writing.

## Control Rules

- Select only from the five installed starter loops.
- Use small frontmatter and readable Markdown sections.
- Do not embed serialized runtime state or duplicate the body in metadata.
- Adapt intent discovery to the request: teach a zero-context user how framing works before asking one open outcome question, but infer supplied objective, scope, exclusions, validation evidence, and assumptions for a contextual user without making them repeat known information.
- Present an agent-authored mission frame and ask only for corrections or gaps that materially change it before discussing collaboration cadence.
- After intent is concrete, explain that human intervention controls collaboration cadence but never removes mandatory gates or the separate mission-execution approval.
- For every new mission, present the user-owned human-intervention choices `less`, `context-dependent`, and `more`, obtain one explicit selection, and map them respectively to `delegated_until_escalation`, `mixed`, and `user_mediated` before loop selection is finalized.
- Map a free-form collaboration preference to the closest supported choice only after the user explicitly confirms the mapping, and capture additional agreed checkpoints for `context-dependent`.
- Do not default or infer the intervention selection from task size, risk, scope detail, selected loop, prior missions, protected actions, or the agent's preferred safety posture; a prior preference is context only and requires confirmation for the new mission.
- Select and explain exactly one installed loop in terms of how it will guide the mission; do not require the user to understand loop taxonomy.
- After loop selection, decompose confirmed scope into high-level delivery themes and inspect the selected loop's pipelines as capability evidence; mission creation records the selected persisted route, which becomes obligatory only after mission execution approval.
- Ask for `spec-driven` or `adaptive` delivery only when both routes are valid for the decomposition and capabilities; record the single valid route with rationale when only one is safe.
- Keep decomposition above implementation-plan detail and do not invoke planning, execution, or another optional pipeline during Start Mission.
- Present one compact preview and request one approval.
- Write new missions with `status: draft` and keep the title in frontmatter only.
- Treat creation approval as file approval only; never infer execution approval.
- Starting a mission does not require running supporting scripts.

## Team Contract

`roadmapper` owns mission framing, loop selection, preview, and creation. `e2e-tester` validates area-config compliance, links, exact preview content, and the line limit. Neither role may treat creation approval as execution authority.

## Output

- `.pipes/project/03-missions/mission-{number}-{slug}.md`
- selected loop skill or loop path for later approved execution
- explicit confirmation that execution has not started

## Phases

### Phase 1: Discover Intent, Choose Collaboration, And Route Delivery

**Objective:** Guide the user from available context to a confirmed mission frame, explicit collaboration choice, one explained starter loop, a high-level delivery decomposition, and an informed delivery route without previewing, writing, activating, or executing the mission.

**Acting Role:** `roadmapper`

**Entry Conditions:** A user request or active loop identifies adaptive work whose continuity, governance, or resumption benefits from a mission record.

**Inputs:**
- User request, project and architecture instructions, current relevant records, and any prior intervention preference as context only.
- Mission area config, existing mission filenames, all five starter loops, and each loop's declared pipeline capabilities.
- Approved scope when invoked from an active loop.

**Fragments:**
- `fragment-ask-mission-definition`
- `fragment-select-loop`
- `fragment-decompose-mission-scope`
- `fragment-ask-delivery-approach`

**Instructions:**
1. Confirm a mission is warranted; use direct action for clear bounded low-risk work that needs no durable adaptive state.
2. Read the mission config, current filenames, project context, and candidate loop definitions before asking for information.
3. For every new mission, use `fragment-ask-mission-definition` to choose the entry route: with zero concrete mission context, explain that the process will frame outcome, boundaries, and completion evidence and creates only a draft, then ask one open outcome question before asking about scope or collaboration; with contextual input, infer objective, in-scope and out-of-scope boundaries, validation evidence, and assumptions without asking the user to repeat supplied context.
4. Present the agent-authored frame for either route and ask only whether anything materially wrong or missing would change the mission; resolve consequential corrections and confirm intent before discussing collaboration.
5. After intent is concrete, explain that human intervention changes collaboration cadence but cannot remove mandatory gates, protected-action approvals, or the separate mission-execution approval; present `less`, `context-dependent`, and `more`, then wait for the user's explicit selection and confirm its exact mapped profile.
6. When the user gives a free-form collaboration preference, propose the closest supported choice and wait for explicit confirmation; for `context-dependent`, agree and capture the additional checkpoints before completing the collaboration brief.
7. Validate the exact selection-to-profile mapping before finalizing loop selection or carrying the mission frame forward.
8. Use `fragment-select-loop` to select exactly one of concept development, feature delivery, investigation and recovery, framework maintenance, or artifact production and explain in plain language how it fits the confirmed mission without requiring loop-taxonomy knowledge; carry its declared pipelines forward as capability evidence only.
9. Use `fragment-decompose-mission-scope` to identify the smallest coherent ordered themes, dependencies, affected contract families, and one `plan-required`, `plan-recommended`, or `direct-capable` classification per theme without adding implementation-plan detail.
10. Determine which delivery routes are valid from the classifications and selected-loop capabilities. When both are valid, use `fragment-ask-delivery-approach` and wait for the user's explicit `spec-driven` or `adaptive` choice; when exactly one is valid, record it with rationale without presenting a false choice; when neither is valid, revisit decomposition or loop selection and stop if the contradiction remains.
11. Define confirmed objective, in-scope and out-of-scope boundaries, assumptions, intervention-to-autonomy mapping, delivery approach, theme routes and promotion triggers, delegated and user authority, operating envelope, roles, current facts, active workflow, pending gate, resume trigger, validation target, stops, and one safe first post-approval Next Action.
12. Under `spec-driven`, record that execution must first obtain at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope; `plan-required` requires coverage rather than a dedicated plan, `plan-recommended` makes a separate plan optional, and each additional plan needs an evidence-backed split rationale. Under `adaptive`, still route every `plan-required` theme to plan coverage while allowing other themes to proceed incrementally unless evidence promotes them.
13. Keep the future mission `draft`; do not build a mission preview or write a file until every Phase 1 exit condition is met, and do not invoke a pipeline, activate, execute, or perform its first action.

- Preserve acting-role context: `roadmapper`.
- Preserve routing semantics: `roadmapper` passes the complete brief and loop selection to Preview And Approve, or returns the supported direct-action recommendation.

**Outputs:**
- Complete confirmed mission brief with objective, scope, exclusions, validation, assumptions, authority, explicit intervention selection, exact mapped profile, agreed contextual checkpoints, related paths, and draft status.
- When the mission delivers an accepted spec, `related` lists the spec and its intent, and each delivery theme names the spec R-IDs it covers.
- Selected loop, primary role, consultations, plain-language fit rationale, and declared pipeline capabilities.
- Ordered delivery themes, dependencies, affected contract families, planning classifications, selected delivery approach, current theme, and exact post-approval route.
- Material unknowns or a direct-action recommendation when no mission is needed.

**Handoff To:** `roadmapper`

**Approval Gate:** User-owned intent and collaboration confirmation; Phase 1 blocks until the user explicitly selects one supported intervention level after confirming the agent-authored frame, any free-form mapping is confirmed, and the exact mapped profile is validated. When both delivery approaches are valid, the user also selects one after seeing the decomposition and capability evidence; a single valid route needs no false-choice gate.

**Exit Conditions:**
- The mission is distinct, bounded, and justified, or creation has stopped.
- Intent, scope, exclusions, assumptions, authority, and validation are concrete and confirmed before collaboration is selected.
- The explicit intervention selection, exact mapped profile, and any `context-dependent` checkpoints are confirmed and validated before exactly one explained loop is selected.
- The selected loop's capabilities, delivery themes, classifications, dependencies, valid approaches, selected approach, current theme, and one safe post-approval Next Action are explicit without invoking a pipeline.
- No mission file, mission state, or mission action has changed.

### Phase 2: Preview And Approve

**Objective:** Validate and display one complete compact mission record, then obtain exact creation approval without implying execution authority.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 1 produced a justified complete brief, confirmed intervention-to-autonomy mapping, exact loop, and no unresolved choice that prevents a stable preview.

**Inputs:**
- Mission brief, loop rationale and capabilities, validated delivery decomposition and approach, related paths, and area config.
- Current mission filename inventory and the complete record template.

**Fragments:**
- `fragment-assess-mission-readiness`
- `fragment-format-mission-record`
- `fragment-request-approval`

**Instructions:**
1. Use `fragment-assess-mission-readiness` to validate the explicit intervention selection, exact intervention-to-autonomy mapping, objective, scope, authority, loop fit, delivery decomposition, approach validity, current theme, roles, validation, stops, and creation-only semantics.
2. Rescan mission filenames and choose the next available zero-padded target without reserving or writing it.
3. Use `fragment-format-mission-record` to produce exact Markdown with a frontmatter-only title, `status: draft`, and every readable mission section.
4. Verify the preview has no more than 300 physical lines before `## Journal`; the Journal heading and content are excluded from this quota.
5. Present the full preview, filename, loop selection and capabilities, delivery approach and theme routes, exactly selected intervention level and mapped autonomy profile, direct write, and the fact that planning, execution, and related effects are excluded.
6. Use `fragment-request-approval` once for the unchanged content and target; rebuild and revalidate after any requested material change.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for config, link, and line-count validation.
- Preserve routing semantics: The approved unchanged preview passes to Write And Stop; corrections return to the phase that owns them.

**Outputs:**
- Validated exact mission Markdown, filename, loop, delivery route, and creation effects.
- Explicit creation approval or requested corrections.

**Handoff To:** `roadmapper`

**Approval Gate:** Human-mandatory. One explicit user approval covers only the displayed mission content, filename, loop selection, and file creation; it does not approve execution, activation, the first mission action, or related records.

**Exit Conditions:**
- Readiness and config checks pass and the compact preview is exact.
- Creation approval is explicit and current, or the pipeline is paused for corrections without writing a mission.

### Phase 3: Write And Stop

**Objective:** Write and validate only the approved draft mission, report its future execution entrypoint, and stop before activation or adaptive work.

**Acting Role:** `roadmapper`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 approved unchanged exact content, target filename, loop selection, and file creation only.

**Inputs:**
- Approved preview and target, approval scope, area config, and current inventory.

**Fragments:**
- `fragment-create-mission-file`
- `fragment-mission-journal-contract`

**Instructions:**
1. Rescan the target and mission inventory; return to Phase 2 if the filename appeared or the approved context changed.
2. Use `fragment-create-mission-file` to write only the approved Markdown.
3. Refuse to overwrite different content or create unapproved related records.
4. Re-read the file and verify config fields, readable links, selected loop, delivery decomposition and approach, the explicit intervention selection and mapping still match the approved preview, frontmatter-only title, `status: draft`, required sections, and the non-Journal line limit.
5. Report the mission path, selected loop, delivery approach, current theme, future entrypoint `pipeline-execute-mission`, and that planning and execution have not started.
6. Stop. Do not activate the mission, invoke the selected loop, invoke a planning or execution pipeline, or perform the first Next Action.

- Preserve acting-role context: `roadmapper`, consulting `e2e-tester` for final record evidence.
- Preserve routing semantics: Return the draft path to the user or invoking loop for a future, separately approved `pipeline-execute-mission` invocation.

**Outputs:**
- Written compact draft mission and validation evidence.
- Selected loop, delivery route, future execution entrypoint, and explicit non-execution result.

**Handoff To:**

**Approval Gate:** No additional creation approval is required for the unchanged approved write; stop before a target conflict, content deviation, related write, activation, or another protected action.

**Exit Conditions:**
- The approved draft is readable at the exact target and has no more than 300 physical lines before `## Journal`; the Journal heading and content are excluded.
- Status remains `draft`; execution has not started and no loop was invoked.
