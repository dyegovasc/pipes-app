---
title: Generate Solution Hypotheses
description: Generates multiple distinct solution approaches for the feature, each with trade-offs assessed.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Generate Solution Hypotheses

Generates multiple distinct solution approaches for the feature, each with trade-offs assessed.

## Instructions

1. **Generate at least 2 and at most 4 hypotheses** — each must be a genuinely different approach, not a variation of the same idea
2. **For each hypothesis, document:**
   - Approach name and summary
   - How it satisfies the requirements
   - Context evidence that supports or weakens it
   - Key trade-offs (complexity, performance, maintainability, risk)
   - Dependencies or constraints introduced
3. **Ground the hypotheses in Context** — use `context_evidence`, `affected_components`, and `blast_radius_rating` instead of inventing approaches in a vacuum
4. **Present all hypotheses clearly** before any selection is made
5. **Do not select a solution in this fragment** — selection happens in `fragment-select-solution`

## Output
- `hypotheses`: list of approach objects, each with name, summary, requirement fit, context evidence, trade-offs, and constraints
