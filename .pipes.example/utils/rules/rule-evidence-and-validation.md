---
title: Evidence And Validation
description: Requires completion claims to be supported by relevant concrete checks.
version: 2.2
rule_type: validation
enforcement: binding
enforced_by: [model]
---
# Rule: Evidence And Validation

## Requirement

Do not call work complete without evidence appropriate to its objective and risk. State unavailable checks and limitations instead of hiding them.

## Checks

- Tie important acceptance criteria to tests, inspection, rendered output, source review, or another reproducible check.
- Inspect real user-visible surfaces when appearance or interaction matters.
- Record failed, skipped, or unavailable validation.
- Refresh evidence affected by later changes.
- Before a recorded plan becomes `done`, verify its terminal result, exactly one validated related outcome, reciprocal paths, and the source plan's current `active` state.
- Use concise paths and check results; do not copy large raw outputs into the mission.
- Confidence alone is not evidence when direct validation is available.
