---
title: Decompose Mission Scope
description: Frames coherent mission delivery themes, dependencies, affected contract families, and planning classifications without producing an implementation plan.
version: 1.1
fragment_type: instruction
domain: project
---
# Fragment: Decompose Mission Scope

## Instructions

1. Begin only after objective, scope, exclusions, validation, intervention mapping, and one selected loop are concrete enough to bound delivery.
2. Split the confirmed mission scope into the smallest coherent ordered themes that can reach independently validated progress without duplicating work or hiding dependencies.
3. For each theme, record a short readable label, intended outcome, dependencies on other theme labels or `none`, affected contract or product families, and one planning classification:
   - `plan-required` when safe execution needs approved plan coverage because unresolved cross-boundary sequencing, material architecture, high risk, or consequential dependencies cannot remain implementation-time choices; coverage may come from one broader plan and does not require a dedicated or separate plan.
   - `plan-recommended` when execution could proceed incrementally but a bounded plan materially improves coordination, evidence, reviewability, or recovery; a separate or additional plan is optional when an existing plan safely covers the theme.
   - `direct-capable` when the theme is bounded, reversible, low risk, and executable without reopening product, architecture, scope, or authority choices.
4. Keep decomposition above implementation-plan detail. Do not add file-level steps, commands, test cases, estimates, or an execution queue.
5. Read the selected loop's declared `pipelines` as available capabilities only. Record whether planning and plan execution capabilities exist, but never invoke a pipeline or treat every listed pipeline as mandatory during mission creation.
6. Determine valid delivery approaches:
   - `spec-driven` is valid when at least one approved, validated plan can cover the complete confirmed mission scope before execution, each additional plan can have an evidence-backed split rationale, and every resulting plan has a governed execution or handoff route.
   - `adaptive` is valid when every `plan-required` theme still has a safe planning route and all remaining themes have a safe incremental loop action or governed subworkflow route.
7. If no delivery approach is valid, revisit the decomposition or selected loop and stop before preview when the contradiction remains. If exactly one is valid, record it with rationale without presenting a false choice. If both are valid, pass the evidence to `fragment-ask-delivery-approach`.
8. Allow later evidence to promote `direct-capable` or `plan-recommended` work to a stricter classification, but never demote required plan coverage merely to avoid a gate; classifications guide coverage and split pressure rather than setting plan count.

## Output

- Ordered mission themes with readable labels, outcomes, dependencies, affected contract families, and planning classifications
- Selected-loop planning and execution capability evidence
- Valid delivery approaches and rationale
- Classification risks, contradictions, and promotion triggers
- Current theme and one safe post-execution-approval route
