---
title: Assess Implementation Risks
description: Identifies implementation risks, regressions, and mitigations before any code is written.
version: 1.2
fragment_type: instruction
domain: codebase
---
# Fragment: Assess Implementation Risks

Identifies implementation risks, regressions, and mitigations before any code is written.

## Instructions

1. **List implementation risks** — what could go wrong during implementation?
2. **List regression risks** — which existing behaviours could break?
3. **For each risk, document:**
   - Risk description
   - Likelihood: low / medium / high
   - Impact: low / medium / high
   - Mitigation strategy
4. **Identify reversibility** — can this change be rolled back easily? If not, flag it
5. **Verify execution preconditions** — confirm every input, dependency, target, and acceptance fact needed before implementation begins
6. **Flag blockers** — any unresolved dependency or ambiguity that must be resolved before implementation begins

## Output
- `risks`: list of risk objects with description, likelihood, impact, and mitigation
- `reversible`: `true` | `false`
- `execution_preconditions`: list of verified execution facts
- `blockers`: list of unresolved dependencies or ambiguities that block safe implementation
