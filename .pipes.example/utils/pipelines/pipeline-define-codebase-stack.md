---
title: Define Codebase Stack
description: Establishes evidence-backed project identity, repository boundaries, working stack, delivery profile, gate accountability, and binding local conventions.
version: 2.5
domain: codebase
category: definition
fragments:
  - fragment-source-tree-execution-context
  - fragment-instruction-surface-ownership
  - fragment-ask-project-context
  - fragment-ask-stack-details
  - fragment-check-existing-codebase-files
  - fragment-analyze-codebase-context
  - fragment-draft-project-instruction
  - fragment-draft-codebase-conventions-rule
  - fragment-format-project-instruction
  - fragment-format-codebase-conventions-rule
  - fragment-detect-delivery-profile
  - fragment-ask-gate-holders
  - fragment-format-delivery-profile
  - fragment-format-accountability-matrix
  - fragment-request-approval
  - fragment-create-files
---
# Pipeline: Define Codebase Stack

Replace missing, placeholder, or stale project setup contracts with repository- first identity and conventions that another agent can apply directly.

## Entry Points

Use during installed-project onboarding or framework starter maintenance when `project.md`, `delivery.md`, `accountability.md`, or `rule-codebase-conventions.md` is missing, placeholder, or materially contradicted by current repository evidence.

## Loop Use

A framework-maintenance or feature-delivery loop may invoke this pipeline with the project root, execution context, known intent, current instructions, and relevant evidence. It returns exact project-instruction and conventions-rule proposals, their targets, approval state, wrapper effects, and validation. Installed projects write only canonical `.pipes/` targets. Starter maintenance writes `.pipes-v2/` first and reconciles `.pipes/` second. After a pause, inspect actual targets and resume from the first incomplete phase without repeating an approved write.

## Control Rules

- Inspect manifests, commands, code, tests, documentation, and current contracts before asking the user for information.
- Ask only for user-owned intent or a material convention that evidence cannot establish; recommend an answer when evidence supports one.
- `project.md` owns identity, stack summary, repository boundaries, and working commands. `delivery.md` owns delivery facts: layout, protected branches, environments, change tickets, release workflows, and commands. `accountability.md` owns the human role and holder source for each gate. The conventions rule owns binding implementation behavior.
- Never invent a delivery fact or a gate holder: mark each value as detected with evidence or asked of the user.
- Keep deep workflows, components, state, and integrations in `architecture.md`.
- Preserve established commitments unless their exact change is approved.
- Use the live instruction and governance-rule schemas without hidden state.

## Output

- Installed-project mode: `.pipes/ai-instructions/project.md`, `.pipes/ai-instructions/delivery.md`, `.pipes/ai-instructions/accountability.md`, and `.pipes/utils/rules/rule-codebase-conventions.md`
- Starter-maintenance mode: equivalent staged `.pipes-v2/` sources followed by their canonical installed `.pipes/` mirrors
- Refreshed configured instruction wrappers and validation evidence

## Phases

### Phase 1: Establish Context And Evidence

**Objective:** Resolve write context, classify current setup contracts, and derive the project and stack baseline from repository-owned evidence.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `roadmapper`

**Entry Conditions:** A request or active loop identifies missing, placeholder, stale, or contradictory project identity or conventions.

**Inputs:**
- Project root, invocation context, current instructions, rules, and wrappers.
- Manifests, lockfiles, configuration, commands, code, tests, and local guidance.

**Fragments:**
- `fragment-source-tree-execution-context`
- `fragment-instruction-surface-ownership`
- `fragment-check-existing-codebase-files`
- `fragment-analyze-codebase-context`
- `fragment-detect-delivery-profile`

**Instructions:**
1. Use `fragment-check-existing-codebase-files` to distinguish `installed_project` from `starter_maintenance`, resolve exact targets, and classify each target as missing, placeholder, or established.
2. Use `fragment-analyze-codebase-context` for its structure, entrypoint, pattern, and evidence scan; interpret relevance repository-wide in this pipeline rather than as a feature-only search.
3. Inspect manifests, executable commands, tests, configuration, imports, documentation, and current contracts before naming an unknown.
4. Separate observed facts, established commitments, conflicts, user-owned intent, and future direction.
5. Use `fragment-detect-delivery-profile` to derive the layout, protected branches, environments, release workflows, change-ticket pattern, commands, and issue-tracker pattern with their evidence.
6. Stop on an unmanaged target or execution context that cannot be resolved.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `roadmapper` when repository ownership or invocation scope is ambiguous.
- Preserve routing semantics: `full-stack-tech-lead` passes the sourced baseline and exact targets to Resolve Intent And Draft.

**Outputs:**
- Execution context, target classifications, current versions, and write set.
- Evidence-backed identity, stack, commands, structure, and convention baseline.
- Preserved commitments, conflicts, and only the remaining user-owned questions.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** Ask only if installed versus starter-maintenance ownership or another write-context boundary cannot be discovered from the invocation and repository identity.

**Exit Conditions:**
- Execution context and every target are unambiguous.
- Repository-discoverable facts are evidenced, and remaining unknowns are classified rather than broadly delegated to the user.
- No source or wrapper has changed.

### Phase 2: Resolve Intent And Draft

**Objective:** Resolve only material user-owned choices and produce complete, schema-valid project and conventions proposals.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `roadmapper`

**Entry Conditions:** Phase 1 produced exact targets, evidence, preserved commitments, and a bounded set of unresolved user-owned questions.

**Inputs:**
- Phase 1 baseline, current contents and versions, and execution context.
- Live project-instruction and binding-rule schemas.

**Fragments:**
- `fragment-ask-project-context`
- `fragment-ask-stack-details`
- `fragment-draft-project-instruction`
- `fragment-draft-codebase-conventions-rule`
- `fragment-format-project-instruction`
- `fragment-format-codebase-conventions-rule`
- `fragment-ask-gate-holders`
- `fragment-format-delivery-profile`
- `fragment-format-accountability-matrix`

**Instructions:**
1. Use `fragment-ask-project-context` only for an identity, intended outcome, or ownership boundary that Phase 1 could not establish.
2. Use `fragment-ask-stack-details` only for a binding convention or intended technical direction that remains materially ambiguous.
3. Use `fragment-draft-project-instruction` and `fragment-format-project-instruction` to compose an inline instruction from evidence and confirmed intent while preserving established commitments.
4. Use `fragment-draft-codebase-conventions-rule` and `fragment-format-codebase-conventions-rule` to produce the live governance schema with Requirement, Enforcement, and concrete Checks.
5. Use `fragment-format-delivery-profile` to compose `delivery.md` from the detected values and the user's answers to its open questions, and include the always-on line budget as `always_on_line_budget` in `project.md` frontmatter when the user wants one. Ask whether the project runs behavioral evals: include the Evals section only when it does, because the section makes eval results required at gate G6. When the user cannot be asked, omit the section and state that default.
6. Use `fragment-ask-gate-holders` and `fragment-format-accountability-matrix` to compose `accountability.md`, resolving holders to evidence sources or the session user.
7. Use version `1.0` for new configured files or one minor increment for each substantive update; do not bump unchanged content.
8. Identify every addition, correction, removal, target, mirror, and wrapper effect without writing it.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `roadmapper` for durable scope or ownership choices.
- Preserve routing semantics: `full-stack-tech-lead` passes the complete proposal package to Validate And Approve.

**Outputs:**
- Complete project-instruction, delivery-profile, accountability-matrix, and conventions-rule proposals.
- Evidence map, preserved commitments, exact changes, versions, and targets.
- Resolved choices or a precise blocking question.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** The user or declared product authority decides any remaining project identity, intended direction, binding convention, or established- commitment change before the affected proposal can advance.

**Exit Conditions:**
- Both proposals use current schemas and contain no unsupported placeholder.
- Every factual claim has evidence and every durable choice has authority.
- The exact write and generated-effect set is readable without hidden state.

### Phase 3: Validate And Approve

**Objective:** Validate the complete proposal against evidence, current schemas, preservation constraints, and write context, then bind approval to exact effects.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 2 produced complete content, targets, version transitions, changes, and no unresolved product choice.

**Inputs:**
- Exact proposals and write set.
- Current targets, evidence map, live schemas, wrappers, and preservation list.

**Fragments:**
- `fragment-request-approval`

**Instructions:**
1. Validate project frontmatter, inline assembly, Stack and Architecture sections, and the separation from deep architecture and binding conventions.
2. Validate rule frontmatter, `rule_type: governance`, `applies_to`, binding enforcement, gate relevance, and Requirement, Enforcement, and Checks.
3. Compare every update with the current target and surface changed or removed commitments, semantic versions, mirrors, and wrapper effects.
4. Present complete content, exact targets, execution context, generated effects, and excluded effects.
5. Use `fragment-request-approval` once for the unchanged package; rebuild and revalidate the full proposal after any material correction.

- Preserve acting-role context: `full-stack-tech-lead`, consulting `e2e-tester` for schema, wrapper, and installed-path validation.
- Preserve routing semantics: The approved unchanged package passes to Write And Assemble; corrections return to the phase that owns them.

**Outputs:**
- Validated exact proposal package and evidence findings.
- Explicit approval or requested corrections for content, paths, and effects.

**Handoff To:** `full-stack-tech-lead`

**Approval Gate:** Human approval covers the displayed project commitments, binding conventions, exact targets, installed mirrors, and configured wrapper regeneration only. It does not authorize unrelated edits or external actions.

**Exit Conditions:**
- No schema, evidence, preservation, path, or version blocker remains.
- Approval is explicit and applies to the current complete proposal, or the pipeline is paused for corrections.

### Phase 4: Write And Assemble

**Objective:** Apply only the approved setup contracts in the correct context, refresh wrappers, and prove the result is coherent and idempotent.

**Acting Role:** `full-stack-tech-lead`

**Support Team:** `e2e-tester`

**Entry Conditions:** Phase 3 approved unchanged exact content, targets, mirrors, version transitions, and generated wrapper effects.

**Inputs:**
- Approved package, current files, execution context, generators, and tests.

**Fragments:**
- `fragment-create-files`

**Instructions:**
1. Re-read every target; return to Phase 3 if ownership or content changed after approval.
2. Use `fragment-create-files` to write canonical `.pipes/` targets in an installed project, or staged `.pipes-v2/` sources first and `.pipes/` mirrors second during starter maintenance.
3. Refuse an unmanaged overwrite or unapproved commitment removal.
4. Regenerate configured instruction wrappers, policy skills, and hook settings from the active source context, and validate `delivery.md` with `delivery-profile.cjs`.
5. Re-read source and generated outputs, confirm staged/installed equivalence when applicable, and inspect wrappers for canonical `.pipes/` paths.
6. Run structural, generator, and clean-install tests and report actual effects.

- Preserve acting-role context: `full-stack-tech-lead`, with `e2e-tester` recommending validation closure.
- Preserve routing semantics: Return factual paths and evidence to the invoking loop or user; defining the stack does not authorize unrelated implementation work.

**Outputs:**
- Written project instruction, delivery profile, accountability matrix, and conventions rule at approved paths.
- Refreshed wrappers and validation evidence.
- Deviations, unchanged effects, and residual risk.

**Handoff To:**

**Approval Gate:** No additional gate for approved effects. Stop before target drift, unmanaged overwrite, material deviation, or another protected action.

**Exit Conditions:**
- Written sources match the approved content and execution context.
- Wrapper output is reproducible, uses canonical installed paths, and tests pass or failures are reported without a false completion claim.
