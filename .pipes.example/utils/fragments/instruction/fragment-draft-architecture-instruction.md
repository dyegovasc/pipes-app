---
title: Draft Architecture Instruction
description: Synthesizes confirmed architecture intent and repository evidence into a concise, factual canonical architecture draft.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Draft Architecture Instruction

## Instructions

1. Use confirmed user choices and current repository evidence as inputs; distinguish facts, accepted constraints, and planned evolution.
2. Draft System Summary, Product Boundaries, Primary Workflows, Components And Responsibilities, Data And State, External Integrations, Operational Constraints, and Planned Evolution.
3. Name concrete modules, services, packages, data stores, or integration contracts when evidence supports them. In the `multi-repo` layout of `.pipes/ai-instructions/delivery.md`, give Components And Responsibilities one row per repository from the workspace survey, with its role and owners, and describe Primary Workflows and Data And State across repositories: which service calls which, through which contract, and which service owns which data.
4. Keep `project.md` responsible for repository identity and stack summary, and keep code conventions in `rule-codebase-conventions.md`.
5. Preserve valid established commitments during update mode. Flag removals or contradictions for approval instead of silently overwriting them.
6. Label uncertain or future-looking statements explicitly; do not present hypotheses as current architecture.
7. Keep the instruction concise enough to guide agents while linking detailed evidence to canonical records or artifacts when appropriate.

## Output

- `architecture_draft`: complete section content
- `architecture_mode`: `create` | `update`
- `preserved_commitments`: existing statements retained
- `proposed_changes`: additions, corrections, and removals
- `architecture_assumptions`: explicit unverified statements
- `wrapper_refresh_required`: `true` | `false`
