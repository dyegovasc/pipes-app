---
title: Establish Scope Guardrails
description: Defines explicit in-scope and out-of-scope boundaries and safety constraints for the feature implementation.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Establish Scope Guardrails

Defines explicit in-scope and out-of-scope boundaries and safety constraints for the feature implementation.

## Instructions

1. **Define in-scope boundaries** — based on captured requirements, list what this implementation will cover
2. **Define out-of-scope boundaries** — explicitly state what will not be addressed in this implementation
3. **Identify safety constraints** — flag any areas that must not be modified (e.g., auth flows, billing, public APIs)
4. **Defer repo-specific open questions** — if a question depends on understanding the existing app surfaces, architecture, or integration points, record it for Context instead of asking it now
5. **Defer high-impact shared decisions** — if a decision will still require user input after Context, record it as a shared decision to revisit in Design
6. **Present guardrails to user** — display in-scope, out-of-scope, safety constraints, and deferred items clearly
7. **Do not proceed** until the user has reviewed the guardrails

## Output
- `in_scope`: list of covered concerns
- `out_of_scope`: list of explicitly excluded concerns
- `safety_constraints`: list of protected areas that must not be touched
- `deferred_repo_questions`: list of repo-owned questions to resolve in Context
- `deferred_shared_decisions`: list of decision-shaping questions to revisit in Design if they remain unresolved
