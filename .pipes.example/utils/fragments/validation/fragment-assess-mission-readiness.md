---
title: Assess Mission Readiness
description: Verifies that a compact draft mission is complete and safe to record without starting execution.
version: 2.8
fragment_type: validation
domain: project
---
# Fragment: Assess Mission Readiness

## Checks

- [ ] The objective is concrete enough to guide later execution.
- [ ] In-scope and out-of-scope boundaries are visible.
- [ ] Constraints and protected actions are explicit.
- [ ] Evidence shows the user explicitly selected one human-intervention level for this new mission; it was not defaulted or inferred from task size, risk, scope detail, selected loop, prior missions, protected actions, or agent preference.
- [ ] The exact explicit selection maps `less` to `delegated_until_escalation`, `more` to `user_mediated`, or `context-dependent` to `mixed`; missing, contradictory, unconfirmed, or unmapped values fail readiness.
- [ ] Delegated authority, user authority, protected surfaces, and escalation conditions are readable and do not widen authority granted elsewhere.
- [ ] Exactly one of the five starter loops fits the dominant mission need.
- [ ] The selected loop ID resolves; a `Loop fit:` statement is present only when exceptional rationale helps review.
- [ ] `## Delivery` contains one or more coherent ordered themes, and every theme names an outcome, dependencies or `none`, affected contract families, and exactly one of `plan-required`, `plan-recommended`, or `direct-capable`.
- [ ] Theme decomposition remains above implementation-plan detail and contains no file-level execution steps, commands, test cases, estimates, or automatic pipeline queue.
- [ ] The selected loop's declared pipelines are recorded as capabilities before delivery selection, while the selected persisted route becomes obligatory only after mission execution approval.
- [ ] The delivery approach is `spec-driven` or `adaptive`, is valid for the recorded classifications and loop capabilities, and does not alter the intervention-to-autonomy mapping or any gate.
- [ ] When both approaches were valid, the user explicitly selected one after seeing the decomposition and capability evidence; when only one was valid, its rationale is recorded without a false choice.
- [ ] `plan-required` requires approved plan coverage but not a dedicated plan, `plan-recommended` makes a separate plan optional, and `spec-driven` requires at least one approved, validated plan whose combined coverage spans the complete confirmed mission scope before execution with evidence-backed rationale for every additional plan; `adaptive` still plans every `plan-required` theme and records promotion triggers for other themes.
- [ ] One current theme and a safe post-execution-approval route are explicit, but no optional pipeline or loop action has begun.
- [ ] Current State uses a supported non-terminal phase and does not duplicate lifecycle status.
- [ ] Current State names the active workflow, pending gate, resume trigger, and validation target.
- [ ] The primary role and useful consultation triggers are known.
- [ ] Validation is observable and proportional to the work.
- [ ] Complete, user-decision, blocker, and protected-action stops are stated.
- [ ] The first Next Action is safe and useful.
- [ ] `related` is a YAML list: `[]` when no files apply, otherwise unique readable project-relative paths.
- [ ] Every `related` path resolves and no entry is duplicated.
- [ ] Every Journal heading in the preview uses `YYYY-MM-DD hh:mm:ss`.
- [ ] Scope or authority changes name affected scope, authority, and record version.
- [ ] Validation entries name a check, result, scope relevance, and detailed-evidence path when available.
- [ ] The formatted mission contains no duplicate serialized state.
- [ ] Frontmatter status is `draft` and owns the only mission title.
- [ ] The body begins with `## Objective` and contains no repeated H1 title.

## Acceptance Criteria

- [ ] A human can scan the mission without tooling.
- [ ] Missing information is either non-material or a genuine gate.
- [ ] Phase 1 cannot complete, finalize loop selection, build a preview, or write a mission while the explicit selection or exact mapping is missing, inferred, contradictory, unconfirmed, or unmapped.
- [ ] The preview displays exactly the user-selected level and mapped profile, and preview approval does not create or alter that choice.
- [ ] The preview displays the validated decomposition and delivery approach without implying that mission creation approves planning or execution.
- [ ] All content before `## Journal` fits within 300 physical lines; the Journal heading and content are excluded.
- [ ] One approval can cover the full content, loop, filename, and write.
- [ ] Creation approval cannot be mistaken for execution approval.
