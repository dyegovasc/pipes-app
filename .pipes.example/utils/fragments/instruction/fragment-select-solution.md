---
title: Select Solution
description: Evaluates generated solution hypotheses and selects the optimal approach based on fit, risk, and maintainability.
version: 1.1
fragment_type: instruction
domain: codebase
---
# Fragment: Select Solution

Evaluates generated solution hypotheses and selects the optimal approach based on fit, risk, and maintainability.

## Instructions

1. **Score each hypothesis** against:
   - Requirement fit (does it satisfy all success criteria?)
   - Implementation complexity (how hard is it to build?)
   - Maintainability (how easy is it to maintain long-term?)
   - Risk (what could go wrong?)
   - Alignment with existing patterns (does it fit the codebase?)
   - Blast radius (how widely does it affect the system?)
2. **Identify the recommended solution** — explain clearly why it scores best
3. **Explain the rejected alternatives** — state why each weaker option lost
4. **Record recommendation confidence** — if repo evidence is incomplete, mark the recommendation as provisional and note what could change it
5. **Surface remaining shared decisions** — list only the high-impact tradeoffs that still need user input after the recommendation
6. **Present the recommendation** to the user with a brief rationale
7. **Allow the user to override** the recommendation if they prefer a different hypothesis

## Output
- `selected_hypothesis`: name and summary of chosen approach
- `selection_rationale`: why this approach was selected over others
- `alternative_rejections`: list of reasons the non-selected approaches were rejected
- `recommendation_status`: `confident` | `provisional`
- `recommendation_assumptions`: assumptions the recommendation depends on
- `remaining_shared_decisions`: list of unresolved, high-impact tradeoffs that may still need user input
- `user_override`: `true` | `false`
