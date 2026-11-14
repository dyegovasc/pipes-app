---
title: Assess Blast Radius
description: Assesses the potential impact and regression surface of the feature implementation.
version: 1.0
fragment_type: instruction
domain: codebase
---
# Fragment: Assess Blast Radius

Assesses the potential impact and regression surface of the feature implementation.

## Instructions

1. **Identify dependents** — what other features, modules, or consumers depend on the components being modified?
2. **Flag regression risks** — which existing behaviours could break as a result of this change?
3. **Assess shared contract risk** — does this change any interface, API contract, schema, or event format used by other parts of the system?
4. **Rate overall blast radius** — Low / Medium / High with justification
5. **Summarise findings** clearly

## Blast Radius Ratings
- **Low** — isolated change, no shared contracts modified, no other dependents
- **Medium** — touches shared utilities or internal APIs; regression testing required
- **High** — modifies public interfaces, schemas, or core flows; broad regression risk

## Output
- `dependents`: list of features/modules that depend on affected components
- `regression_risks`: list of behaviours that could regress
- `shared_contract_risk`: description of any contract changes
- `blast_radius_rating`: `low` | `medium` | `high`
- `blast_radius_justification`: explanation of the rating
